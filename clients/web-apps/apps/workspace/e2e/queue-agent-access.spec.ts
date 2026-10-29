import { type APIRequestContext, type Page, expect, request, test } from "@playwright/test";

import {
  EMAIL,
  type Session,
  WORKSPACE_API,
  connectPage,
  getApiHeaders,
  loginAsAdmin,
} from "./support/session";

const ENVIRONMENT_STORAGE_KEY = `configure-env:${EMAIL}`;

const OPEN_QUEUE = "E2E Open Queue";
const RESTRICTED_QUEUE = "E2E Restricted Queue";
const PROD_QUEUE = "E2E Prod Queue";
const AGENT_ONE = "E2E Agent One";
const AGENT_TWO = "E2E Agent Two";

type QueueSummary = {
  id: string;
  name: string;
  isResourceAccessRestricted: boolean;
  agentsNames: string[] | null;
};

type FlowOption = { label: string; value: string };

let api: APIRequestContext;
let session: Session;
let openQueueId = "";
let restrictedQueueId = "";
let agentOneId = "";
let agentTwoId = "";

const apiHeaders = (env: "dev" | "prod" = "dev") => getApiHeaders(session, env);

const findQueue = async (name: string, env: "dev" | "prod") => {
  const response = await api.get(`${WORKSPACE_API}/api/queue/list`, { headers: apiHeaders(env) });
  expect(response.ok()).toBeTruthy();
  const queue = (await response.json()).data.find((item: QueueSummary) => item.name === name);

  if (!queue) throw new Error(`Fixture queue "${name}" is missing in ${env}.`);

  return queue as QueueSummary;
};

const assignFlows = async (resourceId: string, flowIds: string[]) => {
  const response = await api.post(`${WORKSPACE_API}/api/resource-flows/assign`, {
    data: { resourceType: "Queue", resourceId, flowIds },
    headers: apiHeaders(),
  });

  expect(response.ok()).toBeTruthy();
};

const queueRow = (page: Page, queueName: string) =>
  page.getByRole("row").filter({ hasText: queueName });

const openAssignAgentsDialog = async (page: Page, queueName: string) => {
  const row = queueRow(page, queueName);
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Assign Agents" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  return dialog;
};

test.beforeAll(async () => {
  api = await request.newContext();
  session = await loginAsAdmin(api);

  openQueueId = (await findQueue(OPEN_QUEUE, "dev")).id;
  restrictedQueueId = (await findQueue(RESTRICTED_QUEUE, "dev")).id;
  await findQueue(PROD_QUEUE, "prod");

  const search = await api.get(`${WORKSPACE_API}/api/search/flow`, {
    headers: apiHeaders(),
    params: { query: "E2E Agent" },
  });
  expect(search.ok()).toBeTruthy();
  const agents: FlowOption[] = (await search.json()).data;
  agentOneId = agents.find((agent) => agent.label === AGENT_ONE)?.value ?? "";
  agentTwoId = agents.find((agent) => agent.label === AGENT_TWO)?.value ?? "";

  if (!agentOneId || !agentTwoId) throw new Error("Fixture agents are missing.");
});

test.afterAll(async () => {
  await api.dispose();
});

test.beforeEach(async ({ page }) => {
  await assignFlows(openQueueId, []);
  await assignFlows(restrictedQueueId, [agentOneId]);

  await connectPage(page, session);
});

test("AC1 and AC6: the shared dialog opens and the restricted flag drives the initial mode", async ({
  page,
}) => {
  await page.goto("configure/queues");

  const openDialog = await openAssignAgentsDialog(page, OPEN_QUEUE);
  await expect(openDialog.getByText("Agent access", { exact: true })).toBeVisible();
  await expect(openDialog.getByRole("radio", { name: /Any agent/ })).toBeChecked();
  await expect(openDialog.getByText("Assign agents", { exact: true })).toHaveCount(0);
  await expect(openDialog.getByText("Choose which agents process items from")).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(openDialog).toBeHidden();

  const restrictedDialog = await openAssignAgentsDialog(page, RESTRICTED_QUEUE);
  await expect(restrictedDialog.getByRole("radio", { name: /Selected agents/ })).toBeChecked();
  await expect(restrictedDialog.getByRole("radio", { name: /Any agent/ })).not.toBeChecked();
  await expect(restrictedDialog.getByText(AGENT_ONE)).toBeVisible();
});

test("AC2: assigning agents restricts the queue, persists the list and re-opens it", async ({
  page,
}) => {
  await page.goto("configure/queues");

  const dialog = await openAssignAgentsDialog(page, OPEN_QUEUE);
  await dialog.getByRole("radio", { name: /Selected agents/ }).click();

  const picker = dialog.getByRole("combobox", { name: "Search agents" });
  await picker.fill("E2E");
  await dialog.getByRole("option", { name: new RegExp(AGENT_ONE) }).click();
  await dialog.getByRole("option", { name: new RegExp(AGENT_TWO) }).click();

  await dialog.getByText("Agent access", { exact: true }).click();
  await expect(dialog.getByRole("listbox")).toBeHidden();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toBeHidden();
  await expect(queueRow(page, OPEN_QUEUE)).toContainText(AGENT_TWO);

  const saved = await findQueue(OPEN_QUEUE, "dev");
  expect(saved.isResourceAccessRestricted).toBe(true);
  expect(saved.agentsNames ?? []).toHaveLength(2);
  expect(saved.agentsNames ?? []).toEqual(expect.arrayContaining([AGENT_ONE, AGENT_TWO]));

  const reopened = await openAssignAgentsDialog(page, OPEN_QUEUE);
  await expect(reopened.getByRole("radio", { name: /Selected agents/ })).toBeChecked();
  await expect(reopened.getByText(AGENT_ONE)).toBeVisible();
  await expect(reopened.getByText(AGENT_TWO)).toBeVisible();
});

test("AC3: unticking and clearing update on re-open and clearing re-opens the queue", async ({
  page,
}) => {
  await assignFlows(openQueueId, [agentOneId, agentTwoId]);
  await page.goto("configure/queues");

  let dialog = await openAssignAgentsDialog(page, OPEN_QUEUE);
  await expect(dialog.getByRole("radio", { name: /Selected agents/ })).toBeChecked();
  await dialog.getByRole("button", { name: `Remove ${AGENT_TWO}` }).click();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toBeHidden();
  await expect(queueRow(page, OPEN_QUEUE)).not.toContainText(AGENT_TWO);

  dialog = await openAssignAgentsDialog(page, OPEN_QUEUE);
  await expect(dialog.getByText(AGENT_ONE)).toBeVisible();
  await expect(dialog.getByText(AGENT_TWO)).toHaveCount(0);
  await dialog.getByRole("radio", { name: /Any agent/ }).click();
  await expect(dialog.getByText("Includes agents created later.")).toBeVisible();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toBeHidden();
  await expect(queueRow(page, OPEN_QUEUE)).not.toContainText(AGENT_ONE);

  dialog = await openAssignAgentsDialog(page, OPEN_QUEUE);
  await expect(dialog.getByRole("radio", { name: /Any agent/ })).toBeChecked();
  await expect(dialog.getByText("Includes agents created later.")).toBeVisible();

  const cleared = await findQueue(OPEN_QUEUE, "dev");
  expect(cleared.isResourceAccessRestricted).toBe(false);
  expect(cleared.agentsNames ?? []).toHaveLength(0);
});

test("AC8: Production disables the entry and never opens the dialog", async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ state: { env: "prod" }, version: 0 }));
  }, ENVIRONMENT_STORAGE_KEY);
  await page.goto("configure/queues");

  await expect(page.getByText("Some actions are restricted.")).toBeVisible();
  const row = queueRow(page, PROD_QUEUE);
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Open menu" }).click();

  const item = page.getByRole("menuitem", { name: "Assign Agents" });
  await expect(item).toBeVisible();
  await expect(item).toHaveAttribute("aria-disabled", "true");
  await item.click({ force: true });
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
