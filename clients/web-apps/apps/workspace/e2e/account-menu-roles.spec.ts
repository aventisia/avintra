import { type APIRequestContext, type Page, expect, request, test } from "@playwright/test";

import { ACCOUNTS_API, type Session, connectPage, loginAsAdmin } from "./support/session";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const SELECTED_ROLES_STORAGE_KEY = "workspace_selected_roles";

let api: APIRequestContext;
let session: Session;

const withRolesClaim = (accessToken: string, roles: string[]) => {
  const [header, payload, signature] = accessToken.split(".");
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
  const rewritten = Buffer.from(JSON.stringify({ ...claims, [ROLE_CLAIM]: roles })).toString(
    "base64url",
  );
  return [header, rewritten, signature].join(".");
};

/** Makes the app see the signed-in admin as holding only these roles. */
const signInWithRoles = async (page: Page, roles: string[]) => {
  await connectPage(page, session);
  await page.route("**/accounts/api/me/refresh-session", async (route) => {
    const response = await route.fetch({
      url: route
        .request()
        .url()
        .replace(/^.*?\/accounts\/api\//, `${ACCOUNTS_API}/api/`),
    });
    const body = await response.json();
    await route.fulfill({
      response,
      json: {
        ...body,
        data: { ...body.data, accessToken: withRolesClaim(body.data.accessToken, roles) },
      },
    });
  });
};

const openAccountMenu = async (page: Page) => {
  await page.goto("agents");
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByRole("button", { name: "My account" })).toBeVisible();
};

test.beforeAll(async () => {
  api = await request.newContext();
  session = await loginAsAdmin(api);
});

test.afterAll(async () => {
  await api?.dispose();
});

test("A tenant admin sees only the admin console, even with a stale role choice saved", async ({
  page,
}) => {
  await page.addInitScript(
    ([key]) => localStorage.setItem(key, "TD"),
    [SELECTED_ROLES_STORAGE_KEY],
  );
  await signInWithRoles(page, ["TA", "TD"]);
  await openAccountMenu(page);

  await expect(page.getByRole("button", { name: "Admin console" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Multi-tenant console" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Roles/ })).toHaveCount(0);
});

test("A super admin sees the multi-tenant console and the roles selector", async ({ page }) => {
  await signInWithRoles(page, ["SA"]);
  await openAccountMenu(page);

  await expect(page.getByRole("button", { name: "Multi-tenant console" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Admin console" })).toHaveCount(0);

  await page.getByRole("button", { name: /^Roles/ }).hover();
  await expect(page.getByPlaceholder("Search roles...")).toBeInViewport();
});
