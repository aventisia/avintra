import { type APIRequestContext, type Page, expect, test } from "@playwright/test";

import {
  APP_PATH,
  authenticate,
  createApi,
  createInstance,
  createTenant,
  deleteTenants,
} from "./global-admin-helpers";

const RUN = Date.now();

let api: APIRequestContext;
let createdTenants: string[] = [];

const dateLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    date,
  );

const rangeLabel = (from: Date, to: Date) => `${dateLabel(from)} - ${dateLabel(to)}`;

// The select-row column is hidden by default, so batch actions need it enabled first.
const showSelectionColumn = async (page: Page) => {
  await page.getByRole("button", { name: "View", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Select Row" }).click();
  await page.keyboard.press("Escape");
};

test.beforeEach(async ({ context, baseURL }) => {
  await authenticate(context, baseURL ?? "");
  api = await createApi(baseURL ?? "");
});

test.afterEach(async () => {
  try {
    await deleteTenants(api, createdTenants);
  } finally {
    createdTenants = [];
    await api.dispose();
  }
});

test("on-prem tenant list filters by search and deletes the selected tenant in one batch", async ({
  page,
}) => {
  const tenantName = `E2E Tenant List ${RUN}`;
  const otherTenantName = `E2E Tenant List Other ${RUN}`;
  createdTenants.push(tenantName, otherTenantName);
  await createTenant(api, tenantName);
  await createTenant(api, otherTenantName);

  await page.goto(`${APP_PATH}/on-prem-tenants`);
  await expect(page.getByRole("heading", { name: "On-prem Tenants" })).toBeVisible();

  const sidebar = page.getByRole("navigation");
  await expect(sidebar.getByRole("link", { name: "On-prem Tenants" })).toBeVisible();
  await expect(sidebar.getByRole("link")).toHaveCount(1);

  const row = page.getByRole("row").filter({ hasText: tenantName });
  const otherRow = page.getByRole("row").filter({ hasText: otherTenantName });
  await expect(row).toBeVisible();
  await expect(otherRow).toBeVisible();

  await page.getByPlaceholder("Search tenants...").fill(tenantName);
  await expect(row).toBeVisible();
  await expect(otherRow).toBeHidden();

  await showSelectionColumn(page);
  await row.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Delete" }).click();
  const confirmDialog = page.getByRole("alertdialog");
  await expect(confirmDialog).toContainText("Delete 1 tenant?");
  await confirmDialog.getByRole("button", { name: "Yes, delete" }).click();
  await expect(row).toBeHidden();
});

test("instance list shows the tenant summary and deletes the selected instance in one batch", async ({
  page,
}) => {
  const tenantName = `E2E Instance List ${RUN}`;
  const instanceName = `${tenantName} Instance`;
  const otherInstanceName = `${tenantName} Other Instance`;
  createdTenants.push(tenantName);
  const tenantId = await createTenant(api, tenantName);
  await createInstance(api, tenantId, instanceName);
  await createInstance(api, tenantId, otherInstanceName);

  await page.goto(
    `${APP_PATH}/on-prem-tenants/${tenantId}?tname=${encodeURIComponent(tenantName)}`,
  );

  for (const title of [
    "Total Execution Time Consumed",
    "Total Users",
    "Total Published Agents",
    "Total Executed Jobs",
  ]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }

  const row = page.getByRole("row").filter({ hasText: instanceName });
  const otherRow = page.getByRole("row").filter({ hasText: otherInstanceName });
  await expect(row).toBeVisible();
  await expect(otherRow).toBeVisible();

  await page.getByPlaceholder("Search...").fill(instanceName);
  await expect(row).toBeVisible();
  await expect(otherRow).toBeHidden();

  await showSelectionColumn(page);
  await row.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Delete" }).click();
  const confirmDialog = page.getByRole("alertdialog");
  await expect(confirmDialog).toContainText("Delete 1 instance?");
  await confirmDialog.getByRole("button", { name: "Yes, delete" }).click();
  await expect(row).toBeHidden();
});

test("instance data page shows the instance summary and applies a date range", async ({ page }) => {
  const tenantName = `E2E Instance Data ${RUN}`;
  const instanceName = `${tenantName} Instance`;
  createdTenants.push(tenantName);
  const tenantId = await createTenant(api, tenantName);
  const instanceId = await createInstance(api, tenantId, instanceName);

  await page.goto(
    `${APP_PATH}/on-prem-tenants/${tenantId}/${instanceId}?tname=${encodeURIComponent(tenantName)}&iname=${encodeURIComponent(instanceName)}`,
  );

  await expect(page.getByRole("link", { name: "On-prem Tenants" })).toBeVisible();
  await expect(page.getByText(instanceName, { exact: true })).toBeVisible();

  for (const title of [
    "Total Execution Time",
    "Total Users",
    "Total Published Agents",
    "Total Executed Jobs",
  ]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }

  for (const header of [
    "Validated At",
    "Execution Time",
    "Executed Jobs",
    "Published Agents",
    "Users",
  ]) {
    await expect(page.getByRole("columnheader", { name: header })).toBeVisible();
  }
  await expect(page.getByRole("cell", { name: "No results." })).toBeVisible();

  const today = new Date();
  await page.getByRole("button", { name: /^\w{3} \d{1,2}, \d{4} - \w{3} \d{1,2}, \d{4}$/ }).click();
  await page.getByRole("button", { name: "Month to Date" }).click();
  await page.getByRole("button", { name: "Update" }).click();

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  await expect(page.getByRole("button", { name: rangeLabel(monthStart, today) })).toBeVisible();
  await expect(page.getByRole("cell", { name: "No results." })).toBeVisible();
});
