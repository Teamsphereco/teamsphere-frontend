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

const createOneToOneChat = async (api, caller, callee) => {
  const response = await api.post("/api/chat/single", {
    headers: {
      Authorization: `Bearer ${caller.auth.jwt}`,
    },
    data: {
      userId: callee.auth.user.id,
    },
  });
  await expectOk(response, "create 1:1 chat");
  return response.json();
};

const createGroupChat = async (api, owner, members, groupName) => {
  const formData = new FormData();
  formData.append("chatName", groupName);
  members.forEach((member) => {
    formData.append("userIds", member.auth.user.id);
  });

  const response = await api.post("/api/chat/group", {
    headers: {
      Authorization: `Bearer ${owner.auth.jwt}`,
    },
    multipart: formData,
  });
  await expectOk(response, "create group chat");
  return response.json();
};

const seedCallFixture = async () => {
  const api = await request.newContext({ baseURL: backendUrl });
  const health = await api.get("/actuator/health");
  await expectOk(health, "backend health check");

  const caller = await registerFakeUser(api, "caller");
  const callee = await registerFakeUser(api, "callee");
  const chat = await createOneToOneChat(api, caller, callee);

  return { api, caller, callee, chat };
};

const seedGroupCallFixture = async (participantCount = 5) => {
  const api = await request.newContext({ baseURL: backendUrl });
  const health = await api.get("/actuator/health");
  await expectOk(health, "backend health check");

  const users = [];
  for (let index = 0; index < participantCount; index += 1) {
    users.push(await registerFakeUser(api, `group${index + 1}`));
  }

  const groupName = `e2e-group-${uniqueRunId()}`;
  const chat = await createGroupChat(api, users[0], users.slice(1), groupName);

  return { api, users, groupName, chat };
};

const authenticatePage = async (page, authUser) => {
  await page.addInitScript((storedAuthUser) => {
    window.localStorage.setItem("chat-user", JSON.stringify(storedAuthUser));
  }, authUser);
};

const visibleChatList = (page) => page.locator("aside:visible");

const openChat = async (page, otherUser) => {
  await page.goto("/chat");
  await expect(visibleChatList(page).getByText("Recent Chats")).toBeVisible();
  await visibleChatList(page).getByText(otherUser.username, { exact: false }).first().click();
  await expect(page.getByTestId("message-container").getByText(otherUser.username, { exact: false }).first()).toBeVisible();
};

const openChatByName = async (page, chatName) => {
  await page.goto("/chat");
  await expect(visibleChatList(page).getByText("Recent Chats")).toBeVisible();
  await visibleChatList(page).getByText(chatName, { exact: false }).first().click();
  await expect(page.getByTestId("message-container").getByText(chatName, { exact: false }).first()).toBeVisible();
};

const ensureAudioCallConnected = async (page) => {
  const connected = page.getByText("Connected").first();
  const joinButton = page.getByRole("button", { name: "Join" }).first();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await connected.isVisible().catch(() => false)) {
      return;
    }

    if (await joinButton.isVisible().catch(() => false)) {
      await joinButton.click();
    }

    try {
      await expect(connected).toBeVisible({ timeout: 15_000 });
      return;
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }
    }
  }
};

const getActiveCalls = async (api, authUser) => {
  const response = await api.get("/api/calls/active", {
    headers: {
      Authorization: `Bearer ${authUser.jwt}`,
    },
  });
  await expectOk(response, "get active calls");
  return response.json();
};

const endCallBestEffort = async (api, authUser, callId) => {
  if (!api || !authUser?.jwt || !callId) {
    return;
  }

  await api.post(`/api/calls/${callId}/end`, {
    headers: {
      Authorization: `Bearer ${authUser.jwt}`,
    },
    data: {
      reason: "E2E_CLEANUP",
    },
  }).catch(() => {});
};

const closeResources = async (...resources) => {
  await Promise.allSettled(
    resources
      .filter(Boolean)
      .map((resource) => resource.close?.() || resource.dispose?.())
  );
};

test.describe("LiveKit voice/video calls", () => {
  test("registered fake users can complete a video call", async ({ browser }) => {
    let api;
    let caller;
    let callee;
    let call;
    let callerContext;
    let calleeContext;

    try {
      ({ api, caller, callee } = await seedCallFixture());
      callerContext = await browser.newContext({
        baseURL: frontendUrl,
        permissions: ["camera", "microphone"],
      });
      calleeContext = await browser.newContext({
        baseURL: frontendUrl,
        permissions: ["camera", "microphone"],
      });
      const callerPage = await callerContext.newPage();
      const calleePage = await calleeContext.newPage();

      await authenticatePage(callerPage, caller.auth);
      await authenticatePage(calleePage, callee.auth);
      await openChat(callerPage, callee);
      await openChat(calleePage, caller);

      const callResponsePromise = callerPage.waitForResponse(
        (response) => response.url().includes("/api/calls")
          && response.request().method() === "POST"
          && response.status() === 201
      );
      await callerPage.getByTitle("Start video call").click();
      call = await (await callResponsePromise).json();

      await expect(calleePage.getByText("Incoming video call")).toBeVisible();
      await calleePage.getByRole("button", { name: "Answer" }).click();

      await expect(callerPage.getByText("Connected").first()).toBeVisible({ timeout: 30_000 });
      await expect(calleePage.getByText("Connected").first()).toBeVisible({ timeout: 30_000 });
      await expect(callerPage.getByText("Video call").first()).toBeVisible();
      await expect(calleePage.getByText("Video call").first()).toBeVisible();

      await callerPage.getByTitle("End call").click();
      await expect.poll(async () => {
        const calls = await getActiveCalls(api, caller.auth);
        return calls.filter((activeCall) => activeCall.id === call.id).length;
      }, { timeout: 20_000 }).toBe(0);
    } finally {
      await endCallBestEffort(api, caller?.auth, call?.id);
      await closeResources(callerContext, calleeContext, api);
    }
  });

  test("unanswered calls time out for registered fake users", async ({ browser }) => {
    let api;
    let caller;
    let callee;
    let callerContext;
    let calleeContext;

    try {
      ({ api, caller, callee } = await seedCallFixture());
      callerContext = await browser.newContext({
        baseURL: frontendUrl,
        permissions: ["camera", "microphone"],
      });
      calleeContext = await browser.newContext({
        baseURL: frontendUrl,
        permissions: ["camera", "microphone"],
      });
      const callerPage = await callerContext.newPage();
      const calleePage = await calleeContext.newPage();

      await authenticatePage(callerPage, caller.auth);
      await authenticatePage(calleePage, callee.auth);
      await openChat(callerPage, callee);
      await openChat(calleePage, caller);

      const callResponsePromise = callerPage.waitForResponse(
        (response) => response.url().includes("/api/calls")
          && response.request().method() === "POST"
          && response.status() === 201
      );
      await callerPage.getByTitle("Start audio call").click();
      const call = await (await callResponsePromise).json();

      await expect(calleePage.getByText("Incoming audio call")).toBeVisible();
      await expect.poll(async () => {
        const callerCalls = await getActiveCalls(api, caller.auth);
        const calleeCalls = await getActiveCalls(api, callee.auth);
        return callerCalls.some((activeCall) => activeCall.id === call.id)
          || calleeCalls.some((activeCall) => activeCall.id === call.id);
      }, { timeout: 80_000, intervals: [5_000] }).toBe(false);
      await expect(callerPage.getByRole("dialog")).toBeVisible();
      await expect(callerPage.getByRole("button", { name: "Fair enough" })).toBeVisible();
    } finally {
      await closeResources(callerContext, calleeContext, api);
    }
  });

  test("five registered fake users can join a group audio call", async ({ browser }) => {
    test.setTimeout(120_000);

    let api;
    let users = [];
    let call;
    const contexts = [];

    try {
      const fixture = await seedGroupCallFixture(5);
      api = fixture.api;
      users = fixture.users;
      const pages = [];

      for (const user of users) {
        const context = await browser.newContext({
          baseURL: frontendUrl,
          permissions: ["camera", "microphone"],
        });
        contexts.push(context);
        const page = await context.newPage();
        pages.push(page);
        await authenticatePage(page, user.auth);
        await openChatByName(page, fixture.groupName);
      }

      const callResponsePromise = pages[0].waitForResponse(
        (response) => response.url().includes("/api/calls")
          && response.request().method() === "POST"
          && response.status() === 201
      );
      await pages[0].getByTitle("Start audio call").click();
      call = await (await callResponsePromise).json();
      await expect(pages[0].getByText("1 joined · 4 ringing")).toBeVisible({ timeout: 30_000 });
      await ensureAudioCallConnected(pages[0]);

      for (const page of pages.slice(1)) {
        await expect(page.getByText("Incoming audio call")).toBeVisible();
        await page.getByRole("button", { name: "Answer" }).click();
        await ensureAudioCallConnected(page);
      }

      for (const page of pages) {
        await expect(page.getByText("Audio call").first()).toBeVisible({ timeout: 30_000 });
        await ensureAudioCallConnected(page);
      }

      await expect(pages[0].getByText("5 joined")).toBeVisible();
      for (const user of users) {
        await expect(pages[0].getByText(user.username, { exact: false }).first()).toBeVisible();
      }

      await pages[4].getByTitle("End call").click();
      await expect.poll(async () => {
        const calls = await getActiveCalls(api, users[0].auth);
        const activeCall = calls.find((candidate) => candidate.id === call.id);
        return activeCall?.participants?.filter(
          (participant) => participant.participantState === "ACTIVE"
        ).length;
      }, { timeout: 20_000 }).toBe(4);
      await expect(pages[0].getByText("4 joined")).toBeVisible();
      await expect.poll(async () => {
        const calls = await getActiveCalls(api, users[1].auth);
        return calls.some((activeCall) => activeCall.id === call.id);
      }, { timeout: 20_000 }).toBe(true);
    } finally {
      await Promise.allSettled(
        users.map((user) => endCallBestEffort(api, user.auth, call?.id))
      );
      await closeResources(...contexts, api);
    }
  });
});