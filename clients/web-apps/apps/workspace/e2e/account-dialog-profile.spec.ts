import { type APIRequestContext, type Page, expect, request, test } from "@playwright/test";

import { type Session, connectPage, loginAsAdmin } from "./support/session";

const PROFILE_ROUTE = "**/accounts/api/me/profile";
const UPDATE_PROFILE_ROUTE = "**/accounts/api/me/update-profile";
const SAVED_PROFILE = {
  firstName: "Ada",
  lastName: "Lovelace",
  phoneNumber: "+44 20 7946 0000",
  country: "UnitedKingdom",
};

let api: APIRequestContext;
let session: Session;

const accountDialogOf = (page: Page) =>
  page.getByRole("dialog").filter({ has: page.getByRole("tab", { name: "Profile" }) });

const openAccountDialog = async (page: Page) => {
  await page.goto("agents");
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: "My account" }).click();
  await expect(accountDialogOf(page)).toBeVisible();
};

test.beforeAll(async () => {
  api = await request.newContext();
  session = await loginAsAdmin(api);
});

test.afterAll(async () => {
  await api?.dispose();
});

test.beforeEach(async ({ page }) => {
  await connectPage(page, session);
});

test("Saving a new name sends back the hidden phone number and country", async ({ page }) => {
  await page.route(PROFILE_ROUTE, (route) =>
    route.fulfill({ json: { data: SAVED_PROFILE, message: "", statusCode: 200 } }),
  );
  await page.route(UPDATE_PROFILE_ROUTE, (route) =>
    route.fulfill({
      json: { data: route.request().postDataJSON(), message: "Profile updated", statusCode: 200 },
    }),
  );
  await openAccountDialog(page);

  await accountDialogOf(page).getByLabel("First name").fill("Grace");
  const updateRequest = page.waitForRequest(UPDATE_PROFILE_ROUTE);
  await accountDialogOf(page).getByRole("button", { name: "Save changes" }).click();

  expect((await updateRequest).postDataJSON()).toMatchObject({
    ...SAVED_PROFILE,
    firstName: "Grace",
  });
});

test("Save stays off when the profile fails to load", async ({ page }) => {
  await page.route(PROFILE_ROUTE, (route) => route.fulfill({ status: 500, body: "failed" }));
  await openAccountDialog(page);

  await expect(page.getByText("Couldn't load your profile")).toBeVisible();
  await expect(accountDialogOf(page).getByLabel("First name")).toHaveCount(0);
  await expect(accountDialogOf(page).getByRole("button", { name: "Save changes" })).toBeDisabled();
});

test("The dialog reopens on its tab after a reload and opens from search", async ({ page }) => {
  await page.route(PROFILE_ROUTE, (route) =>
    route.fulfill({ json: { data: SAVED_PROFILE, message: "", statusCode: 200 } }),
  );
  await openAccountDialog(page);
  await accountDialogOf(page).getByRole("tab", { name: "Password" }).click();
  await expect(page).toHaveURL(/[?&]account=password/);

  await page.reload();
  await expect(accountDialogOf(page).getByRole("tab", { name: "Password" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.keyboard.press("Escape");
  await expect(accountDialogOf(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/[?&]account=/);

  await page.keyboard.press("ControlOrMeta+k");
  await page.getByRole("option", { name: "My account" }).click();
  await expect(accountDialogOf(page)).toBeVisible();
});
