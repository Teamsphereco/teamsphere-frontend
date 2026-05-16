import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const mockAuthPayload = (username = "e2e-user") => ({
  accessToken: "e2e-access-token",
  jwt: "e2e-access-token",
  user: {
    id: "user-e2e-1",
    username,
    email: `${username}@teamsphere.test`,
  },
  fullName: username,
});

const mockAuthenticatedAppRequests = async (page) => {
  await page.route("**/auth/verify", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.route("**/api/user/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "profile-e2e-1", username: "e2e-user", profilePicture: null }),
    });
  });

  await page.route("**/api/chat/summaries**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
};

const expectStoredAuthUser = async (page, username) => {
  await expect.poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem("chat-user") || "null")?.user?.username))
    .toBe(username);
};

const samplePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAF0lEQVR4nGNk+M+ABzDhkxyqAqkBAJwCBQHfH0wOAAAAAElFTkSuQmCC",
  "base64"
);

test.describe("auth pages", () => {
  test("users can sign in with email and password", async ({ page }) => {
    await mockAuthenticatedAppRequests(page);
    await page.route("**/auth/login", async (route) => {
      const requestBody = route.request().postDataJSON();
      expect(requestBody).toEqual({
        email: "maya@teamsphere.test",
        password: "E2ePassword123",
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAuthPayload("maya")),
      });
    });

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in to Teamsphere." })).toBeVisible();

    await page.getByLabel("Email").fill("maya@teamsphere.test");
    await page.getByLabel("Password").fill("E2ePassword123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/chat$/);
    await expectStoredAuthUser(page, "maya");
  });

  test("users can create an account, crop an avatar, and submit signup", async ({ page }) => {
    await mockAuthenticatedAppRequests(page);
    await page.route("**/auth/signup", async (route) => {
      const headers = route.request().headers();
      expect(headers["content-type"]).toContain("multipart/form-data");
      expect(route.request().postData()).toContain("maya@teamsphere.test");
      expect(route.request().postData()).toContain("maya");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAuthPayload("maya")),
      });
    });

    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create your account." })).toBeVisible();

    await page.getByLabel("Email").fill("maya@teamsphere.test");
    await page.getByLabel("Password").fill("E2ePassword123");
    await page.getByRole("button", { name: "Continue to profile" }).click();

    await expect(page.getByRole("heading", { name: "Create your profile." })).toBeVisible();
    await page.getByLabel("Username").fill("maya");
    await page.getByLabel("Profile image").setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: samplePng,
    });

    await expect(page.getByRole("heading", { name: "Crop profile image" })).toBeVisible();
    await page.getByLabel("Zoom").fill("1.4");
    await page.getByRole("button", { name: "Apply crop" }).click();
    await expect(page.getByAltText("Profile image preview")).toBeVisible();

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/chat$/);
    await expectStoredAuthUser(page, "maya");
  });
});
