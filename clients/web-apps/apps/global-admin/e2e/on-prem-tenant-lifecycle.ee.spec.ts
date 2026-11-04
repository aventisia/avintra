import { expect, test } from "@playwright/test";

import { APP_PATH, authenticate, createApi, deleteTenants } from "./global-admin-helpers.ee";

const TENANT_NAME = `E2E Tenant ${Date.now()}`;
const INSTANCE_NAME = `${TENANT_NAME} Instance`;

test.beforeEach(async ({ context, baseURL }) => {
  await authenticate(context, baseURL ?? "");
});

test.afterEach(async ({ baseURL }) => {
  const api = await createApi(baseURL ?? "");

  try {
    await deleteTenants(api, [TENANT_NAME]);
  } finally {
    await api.dispose();
  }
});

test("creates an on-prem tenant, opens its instance data, and deletes it", async ({ page }) => {
  await page.goto(`${APP_PATH}/on-prem-tenants`);
  await expect(page.getByRole("heading", { name: "On-prem Tenants" })).toBeVisible();

  await page.getByRole("button", { name: "Create", exact: true }).click();
  const tenantDialog = page.getByRole("dialog", { name: "Create On-prem Tenant" });
  await tenantDialog.getByRole("textbox", { name: /^Name/ }).fill(TENANT_NAME);
  await tenantDialog.getByRole("textbox", { name: /^Execution Time Allowed/ }).fill("100");
  await tenantDialog.getByRole("textbox", { name: /^Aventisia Emails/ }).fill("e2e@aventisia.com");
  await tenantDialog.getByRole("textbox", { name: /^Client Emails/ }).fill("client@example.com");
  await expect(tenantDialog.getByText(`${TENANT_NAME} is available`)).toBeVisible();
  await tenantDialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(tenantDialog).toBeHidden();

  await page.getByRole("link", { name: TENANT_NAME }).click();
  await expect(page).toHaveURL(/\/on-prem-tenants\/[0-9a-f-]{36}\?tname=/);

  await page.getByRole("button", { name: "Create", exact: true }).click();
  const instanceDialog = page.getByRole("dialog", { name: "Create Instance" });
  await instanceDialog.getByRole("textbox", { name: /^Name/ }).fill(INSTANCE_NAME);
  await instanceDialog.getByRole("combobox").click();
  await page.getByRole("option", { name: "Prod", exact: true }).click();
  await expect(instanceDialog.getByText(`${INSTANCE_NAME} is available`)).toBeVisible();
  await instanceDialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(instanceDialog).toBeHidden();

  await page.getByRole("link", { name: INSTANCE_NAME }).click();
  await expect(page).toHaveURL(/\/on-prem-tenants\/[0-9a-f-]{36}\/[0-9a-f-]{36}\?tname=/);
  await expect(page.getByText(INSTANCE_NAME, { exact: true })).toBeVisible();

  await page.goto(`${APP_PATH}/on-prem-tenants`);
  const tenantRow = page.getByRole("row").filter({ hasText: TENANT_NAME });
  await tenantRow.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Yes, delete tenant" }).click();
  await expect(page.getByRole("link", { name: TENANT_NAME })).toBeHidden();
});
