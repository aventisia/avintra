import {
  type APIRequestContext,
  type Locator,
  type Page,
  expect,
  request,
  test,
} from "@playwright/test";

import {
  ACCOUNTS_API,
  type Session,
  WORKSPACE_API,
  connectPage,
  getApiHeaders,
  loginAsAdmin,
} from "./support/session";

const SHARED_QUEUE = "E2E Open Queue";
const BULK_SHARE_ROUTE = "**/workspace/api/resource-user-access/bulk";

type QueueSummary = { id: string; name: string };

type SearchedUser = {
  id: string;
  userName: string;
  firstName: string | null;
  lastName: string | null;
};

type ShareSummary = { id: string; userId: string; accessLevel: string };

type Person = { id: string; name: string; email: string };

let api: APIRequestContext;
let session: Session;
let queueId = "";
let removedPerson: Person;
let editedPerson: Person;
let addedPerson: Person;

const apiHeaders = () => getApiHeaders(session);

const listShares = async () => {
  const response = await api.get(`${WORKSPACE_API}/api/resource-user-access/${queueId}/list`, {
    headers: apiHeaders(),
  });
  expect(response.ok()).toBeTruthy();

  return (await response.json()).data as ShareSummary[];
};

const accessOf = (shares: ShareSummary[], person: Person) =>
  shares.find((share) => share.userId === person.id)?.accessLevel;

const removeAllShares = async () => {
  for (const share of await listShares()) {
    const response = await api.delete(`${WORKSPACE_API}/api/resource-user-access/${share.id}`, {
      headers: apiHeaders(),
    });
    expect(response.ok()).toBeTruthy();
  }
};

const openShareDialog = async (page: Page) => {
  const row = page.getByRole("row").filter({ hasText: SHARED_QUEUE });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Share" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("radio", { name: /Specific people/ })).toBeChecked();
  await expect(dialog.getByText(editedPerson.name, { exact: true })).toBeVisible();

  return dialog;
};

const addPerson = async (page: Page, dialog: Locator, person: Person) => {
  await dialog.getByRole("combobox", { name: "Add people by name or email" }).fill(person.email);
  await page.getByRole("option").filter({ hasText: person.email }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(dialog.getByText(person.name, { exact: true })).toBeVisible();
  await expect(dialog.getByText("New", { exact: true })).toBeVisible();
};

const toPerson = (user: SearchedUser): Person => ({
  id: user.id,
  name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.userName,
  email: user.userName,
});

const pickFixturePeople = (users: SearchedUser[]) => {
  const seenEmails = new Set<string>();
  const seenNames = new Set<string>();

  return users.map(toPerson).filter((person) => {
    const emailKey = person.email.toLowerCase();
    const nameKey = person.name.toLowerCase();
    if (!emailKey || seenEmails.has(emailKey) || seenNames.has(nameKey)) return false;

    seenEmails.add(emailKey);
    seenNames.add(nameKey);
    return true;
  });
};

test.beforeAll(async () => {
  api = await request.newContext();
  session = await loginAsAdmin(api);

  const queues = await api.get(`${WORKSPACE_API}/api/queue/list`, { headers: apiHeaders() });
  expect(queues.ok()).toBeTruthy();
  queueId =
    (await queues.json()).data.find((queue: QueueSummary) => queue.name === SHARED_QUEUE)?.id ?? "";
  if (!queueId) throw new Error(`Fixture queue "${SHARED_QUEUE}" is missing in dev.`);

  const search = await api.get(`${ACCOUNTS_API}/api/search/user`, {
    headers: apiHeaders(),
    params: { query: "", includeCurrentUser: false, onlyCurrentSpace: true },
  });
  expect(search.ok()).toBeTruthy();
  const people = pickFixturePeople((await search.json()).data as SearchedUser[]);
  if (people.length < 3) {
    throw new Error("Central needs at least three users besides the admin with distinct names.");
  }

  [removedPerson, editedPerson, addedPerson] = people;
});

test.afterAll(async () => {
  if (!api) return;

  try {
    if (queueId) await removeAllShares();
  } finally {
    await api.dispose();
  }
});

test.beforeEach(async ({ page }) => {
  const tenantAccess = await api.put(`${WORKSPACE_API}/api/resource-user-access/tenant-access`, {
    data: { resourceType: "Queue", resourceId: queueId, isTenantWideAccess: false },
    headers: apiHeaders(),
  });
  expect(tenantAccess.ok()).toBeTruthy();

  await removeAllShares();
  const bulk = await api.post(`${WORKSPACE_API}/api/resource-user-access/bulk`, {
    data: {
      resourceType: "Queue",
      resourceId: queueId,
      users: [removedPerson, editedPerson].map(({ id }) => ({ userId: id, accessLevel: "View" })),
    },
    headers: apiHeaders(),
  });
  expect(bulk.ok()).toBeTruthy();

  await connectPage(page, session);
});

test("saves a removal, a role change and a new person together", async ({ page }) => {
  await page.goto("configure/queues");

  const dialog = await openShareDialog(page);
  await dialog.getByRole("button", { name: `Remove ${removedPerson.name}` }).click();
  await dialog.getByRole("button", { name: `Role of ${editedPerson.name}: Can view` }).click();
  await page.getByRole("menuitem", { name: /^Can edit/ }).click();
  await addPerson(page, dialog, addedPerson);

  await expect(dialog.getByText("1 added · 1 changed · 1 removed")).toBeVisible();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toBeHidden();

  const shares = await listShares();
  expect(accessOf(shares, removedPerson)).toBeUndefined();
  expect(accessOf(shares, editedPerson)).toBe("Edit");
  expect(accessOf(shares, addedPerson)).toBe("View");
});

test("a failed request keeps the dialog open with only that change pending", async ({ page }) => {
  await page.route(BULK_SHARE_ROUTE, (route) => route.fulfill({ status: 500 }));
  await page.goto("configure/queues");

  const dialog = await openShareDialog(page);
  await dialog.getByRole("button", { name: `Remove ${removedPerson.name}` }).click();
  await addPerson(page, dialog, addedPerson);
  await dialog.getByRole("button", { name: "Save changes" }).click();

  await expect(dialog.getByText(/^Some changes didn’t save\./)).toBeVisible();
  await expect(dialog.getByText(removedPerson.name, { exact: true })).toHaveCount(0);
  await expect(dialog.getByText(addedPerson.name, { exact: true })).toBeVisible();
  await expect(dialog.getByText("New", { exact: true })).toBeVisible();

  await page.unroute(BULK_SHARE_ROUTE);
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toBeHidden();

  const shares = await listShares();
  expect(accessOf(shares, removedPerson)).toBeUndefined();
  expect(accessOf(shares, addedPerson)).toBe("View");
});
