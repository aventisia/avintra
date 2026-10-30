import { type APIRequestContext, type BrowserContext, expect, request } from "@playwright/test";
import { randomUUID } from "node:crypto";

const ACCESS_TOKEN = process.env.E2E_ACCESS_TOKEN ?? "";
const APP_PATH = "/global-admin";

const apiBaseUrl = (baseURL: string) =>
  `${process.env.E2E_GLOBALADMIN_API_URL ?? `${new URL(baseURL).origin}${APP_PATH}/api`}/`;

/** Signs the browser in with the SA session token from E2E_ACCESS_TOKEN. */
const authenticate = async (context: BrowserContext, baseURL: string) => {
  if (!ACCESS_TOKEN) throw new Error("E2E_ACCESS_TOKEN must be an SA session token");

  const origin = new URL(baseURL).origin;

  await context.addCookies([
    {
      name: "AccessToken",
      value: ACCESS_TOKEN,
      url: origin,
      httpOnly: true,
      secure: origin.startsWith("https:"),
      sameSite: "Lax",
    },
  ]);
};

/** Creates a Global Admin API context authenticated with the same token. */
const createApi = (baseURL: string) =>
  request.newContext({
    baseURL: apiBaseUrl(baseURL),
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

const createTenant = async (api: APIRequestContext, name: string) => {
  const now = new Date().toISOString();
  const response = await api.post("onprem-tenant", {
    data: {
      id: randomUUID(),
      name,
      type: "Enterprise",
      executionTimeAllowed: 100,
      contractStartDate: now,
      contractRenewalDate: now,
      isExecutionDisabled: false,
      isLoginDisabled: false,
      ourEmails: "e2e@aventisia.com",
      tenantEmails: "client@example.com",
    },
  });
  const body = await response.text();
  expect(response.ok(), body).toBeTruthy();
  return (JSON.parse(body) as { data: { id: string } }).data.id;
};

const createInstance = async (api: APIRequestContext, tenantId: string, name: string) => {
  const response = await api.post("onprem/instance", {
    data: { id: randomUUID(), name, type: "Prod", onPremTenantId: tenantId },
  });
  const body = await response.text();
  expect(response.ok(), body).toBeTruthy();
  return (JSON.parse(body) as { data: { id: string } }).data.id;
};

/** Deletes every tenant whose name is listed, which also deletes its instances. */
const deleteTenants = async (api: APIRequestContext, names: string[]) => {
  const tenants = (await (await api.get("onprem-tenant/list")).json()) as {
    data: { id: string; name: string }[];
  };

  for (const tenant of tenants.data) {
    if (names.includes(tenant.name)) await api.delete(`onprem-tenant/${tenant.id}`);
  }
};

export {
  ACCESS_TOKEN,
  APP_PATH,
  authenticate,
  createApi,
  createInstance,
  createTenant,
  deleteTenants,
};
