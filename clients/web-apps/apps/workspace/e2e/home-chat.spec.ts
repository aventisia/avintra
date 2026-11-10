import { type APIRequestContext, expect, request, test } from "@playwright/test";

import {
  type Session,
  WORKSPACE_API,
  connectPage,
  getApiHeaders,
  loginAsAdmin,
} from "./support/session";

const REPLY = "Webhook triggers live under Configure.";

const sse = (...frames: object[]) =>
  frames.map((frame) => `data: ${JSON.stringify(frame)}\n\n`).join("");

let api: APIRequestContext;
let session: Session;
let conversationId: string | undefined;

test.beforeAll(async () => {
  api = await request.newContext();
  session = await loginAsAdmin(api);
});

test.afterAll(async () => {
  if (conversationId)
    await api.delete(`${WORKSPACE_API}/api/assist/conversations/${conversationId}`, {
      headers: getApiHeaders(session),
    });
  await api?.dispose();
});

test("Signing in lands on Home, and a sent message shows the streamed answer", async ({ page }) => {
  await connectPage(page, session);
  // The model reply is scripted so the run doesn't depend on tenant model keys.
  await page.route("**/assist/chats/stream/completions", (route) =>
    route.fulfill({
      contentType: "text/event-stream",
      body: sse({ type: "delta", output: REPLY }, { type: "done", output: REPLY }),
    }),
  );

  await page.goto("./?homeChat=1");
  const composer = page.getByRole("textbox", { name: /message|ask/i });
  await expect(composer).toBeVisible();

  await composer.fill("Where do I set up a webhook?");
  await composer.press("Enter");

  await expect(page.getByText(REPLY)).toBeVisible();
  await expect(page).toHaveURL(/\/c\/[0-9a-f-]{36}$/);
  conversationId = page.url().split("/c/")[1];
});
