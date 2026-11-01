import { type APIRequestContext, expect, request, test } from "@playwright/test";

import { type Session, connectPage, loginAsAdmin } from "./support/session";

const UNREAD = {
  id: "row-1",
  notificationId: "notification-1",
  title: "Credits running low",
  message: "Your workspace has 50 credits left.",
  type: "Warning",
  sourceType: "LowCredit",
  isRead: false,
  createdOn: new Date().toISOString(),
};

const READ = {
  ...UNREAD,
  id: "row-2",
  notificationId: "notification-2",
  title: "Maintenance window",
  type: "Information",
  sourceType: "Manual",
  isRead: true,
};

const respond = (data: unknown) => ({ json: { data, message: "", statusCode: 200 } });

let api: APIRequestContext;
let session: Session;

test.beforeAll(async () => {
  api = await request.newContext();
  session = await loginAsAdmin(api);
});

test.afterAll(async () => {
  await api?.dispose();
});

test("The notifications page opens from the account menu, filters by status and marks one read", async ({
  page,
}) => {
  await connectPage(page, session);
  await page.route("**/notification/unread", (route) => route.fulfill(respond([UNREAD])));
  await page.route("**/notification/unread/*", (route) => route.fulfill(respond(true)));
  await page.route(/\/notification\/history/, (route) => {
    const isRead = new URL(route.request().url()).searchParams.get("isRead");
    return route.fulfill(respond({ items: isRead === "false" ? [UNREAD] : [UNREAD, READ] }));
  });

  await page.goto("agents");
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: /^Notifications/ }).click();
  await expect(page).toHaveURL(/\/notifications$/);

  await expect(page.getByText(UNREAD.title)).toBeVisible();
  await expect(page.getByText(READ.title)).toHaveCount(0);

  await page.getByRole("tab", { name: "All" }).click();
  await expect(page.getByText(READ.title)).toBeVisible();

  const markRequest = page.waitForRequest(
    (req) => req.method() === "PUT" && req.url().endsWith(`/unread/${UNREAD.notificationId}`),
  );
  await page.getByText(UNREAD.title).hover();
  await page.getByRole("button", { name: "Mark as read" }).click();
  await markRequest;
});
