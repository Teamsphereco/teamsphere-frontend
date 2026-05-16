import { expect, request, test } from "@playwright/test";

const frontendUrl = process.env.E2E_FRONTEND_URL || "http://localhost:3000";
const backendUrl = process.env.E2E_API_URL || "http://localhost:5454";
const e2ePassword = process.env.E2E_USER_PASSWORD || "E2ePassword123";

const uniqueRunId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeAuthUser = (rawAuthUser) => {
  const accessToken = rawAuthUser.accessToken || rawAuthUser.jwt || rawAuthUser.token;
  const user = rawAuthUser.user || (rawAuthUser.id ? rawAuthUser : null);

  if (!accessToken || !user?.id) {
    throw new Error(`Auth response did not include token and user id: ${JSON.stringify(rawAuthUser)}`);
  }

  return {
    ...rawAuthUser,
    accessToken,
    jwt: accessToken,
    user,
    fullName: rawAuthUser.fullName || user.username || rawAuthUser.username || "",
  };
};

const expectOk = async (response, label) => {
  if (!response.ok()) {
    throw new Error(`${label} failed with ${response.status()}: ${await response.text()}`);
  }
};

const registerFakeUser = async (api, prefix) => {
  const runId = uniqueRunId();
  const email = `${prefix}.${runId}@e2e.teamsphere.local`;
  const username = `${prefix}-${runId}`;

  const response = await api.post("/auth/signup", {
    multipart: {
      email,
      username,
      password: e2ePassword,
    },
  });
  await expectOk(response, `signup ${email}`);

  return {
    email,
    username,
    password: e2ePassword,
    auth: normalizeAuthUser(await response.json()),
  };
};

const createOneToOneChat = async (api, owner, member) => {
  const response = await api.post("/api/chat/single", {
    headers: {
      Authorization: `Bearer ${owner.auth.jwt}`,
    },
    data: {
      userId: member.auth.user.id,
    },
  });
  await expectOk(response, "create 1:1 chat");
  return response.json();
};

const seedChatFixture = async () => {
  const api = await request.newContext({ baseURL: backendUrl });
  const health = await api.get("/actuator/health");
  await expectOk(health, "backend health check");

  const owner = await registerFakeUser(api, "layout-owner");
  const member = await registerFakeUser(api, "layout-member");
  const chat = await createOneToOneChat(api, owner, member);

  return { api, owner, member, chat };
};

const authenticatePage = async (page, authUser) => {
  await page.addInitScript((storedAuthUser) => {
    window.localStorage.setItem("chat-user", JSON.stringify(storedAuthUser));
  }, authUser);
};

const expectNoHorizontalOverflow = async (page) => {
  await expect.poll(async () => page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(root.scrollWidth, body?.scrollWidth || 0);
    return scrollWidth <= window.innerWidth + 1;
  })).toBe(true);
};

const documentHasResizeCursor = (page) => page.evaluate(() => document.body.style.cursor === "col-resize");

const conversationItem = (page, chat) => page.locator(`[data-testid="conversation-item-${chat.chatId || chat.id}"]:visible`);

const visibleRecentChats = (page) => page.locator("aside:visible").getByText("Recent Chats");

const closeResources = async (...resources) => {
  await Promise.allSettled(resources.filter(Boolean).map((resource) => resource.close?.()));
};

test.describe("responsive chat layout", () => {
  test("desktop users can resize, collapse, reopen, select, and close chats", async ({ browser }) => {
    let api;
    let context;

    try {
      const fixture = await seedChatFixture();
      api = fixture.api;
      context = await browser.newContext({
        baseURL: frontendUrl,
        viewport: { width: 1366, height: 840 },
      });
      const page = await context.newPage();
      await authenticatePage(page, fixture.owner.auth);

      await page.goto("/chat");
      await expect(page.getByTestId("chats-panel")).toBeVisible();
      await expect(visibleRecentChats(page)).toBeVisible();
      await expect(conversationItem(page, fixture.chat)).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const panelBefore = await page.getByTestId("chats-panel").boundingBox();
      const handle = page.getByTestId("resize-handle");
      const handleBox = await handle.boundingBox();
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
      await page.mouse.down();
      await expect.poll(async () => documentHasResizeCursor(page)).toBe(true);
      await page.mouse.move(handleBox.x + handleBox.width / 2 + 140, handleBox.y + handleBox.height / 2, { steps: 8 });
      await page.mouse.up();
      await expect.poll(async () => (await page.getByTestId("chats-panel").boundingBox())?.width || 0)
        .toBeGreaterThan(panelBefore.width + 80);

      await conversationItem(page, fixture.chat).click();
      await expect(page.getByTestId("chat-input-textarea")).toBeVisible();
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await expect(page.getByText(/Select a chat to start messaging/i)).toBeVisible();

      await page.getByLabel("Close chat list").click();
      await expect.poll(async () => (await page.getByTestId("chats-panel").boundingBox())?.width || 0).toBeLessThan(20);
      await page.getByLabel("Open chat list").click();
      await expect.poll(async () => (await page.getByTestId("chats-panel").boundingBox())?.width || 0).toBeGreaterThan(250);
      await expectNoHorizontalOverflow(page);
    } finally {
      await closeResources(context, api);
    }
  });

  test("mobile users can browse chats, open a conversation, view details, and go back", async ({ browser }) => {
    let api;
    let context;

    try {
      const fixture = await seedChatFixture();
      api = fixture.api;
      context = await browser.newContext({
        baseURL: frontendUrl,
        viewport: { width: 390, height: 844 },
        isMobile: true,
      });
      const page = await context.newPage();
      await authenticatePage(page, fixture.owner.auth);

      await page.goto("/chat");
      await expect(visibleRecentChats(page)).toBeVisible();
      await expect(conversationItem(page, fixture.chat)).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await conversationItem(page, fixture.chat).click();
      await expect(page.getByLabel("Back to chats")).toBeVisible();
      await expect(page.getByTestId("chat-input-textarea")).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.getByText("View chat profile").click();
      await expect(page.getByTestId("settings-panel")).toBeVisible();
      await expect(page.getByText("Shared Content")).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.getByRole("button", { name: "Back", exact: true }).click();
      await expect(page.getByTestId("chat-input-textarea")).toBeVisible();
      await page.getByLabel("Back to chats").click();
      await expect(visibleRecentChats(page)).toBeVisible();
      await expect(conversationItem(page, fixture.chat)).toBeVisible();
    } finally {
      await closeResources(context, api);
    }
  });
});
