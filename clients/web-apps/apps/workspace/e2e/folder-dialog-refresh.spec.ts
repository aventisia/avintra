import { type APIRequestContext, type Page, expect, request, test } from "@playwright/test";

import {
  type Session,
  WORKSPACE_API,
  connectPage,
  getApiHeaders,
  loginAsAdmin,
} from "./support/session";

const RUN_ID = Date.now().toString(36);
const EXISTING_NAME = `E2E Refresh ${RUN_ID}`;
const EXISTING_DESCRIPTION = "Saved description";

type FolderSummary = { id: string; name: string };

let api: APIRequestContext;
let session: Session;
let existingFolderId = "";
const folderIdsToDelete = new Set<string>();

const apiHeaders = () => getApiHeaders(session);

const createFolderThroughApi = async (name: string, description = "") => {
  const response = await api.post(`${WORKSPACE_API}/api/folder`, {
    data: { name, description, color: "indigo" },
    headers: apiHeaders(),
  });
  expect(response.ok()).toBeTruthy();
  const { id } = (await response.json()).data as FolderSummary;
  folderIdsToDelete.add(id);

  return id;
};

const deleteFolderThroughApi = (id: string) =>
  api.delete(`${WORKSPACE_API}/api/folder/${id}`, { headers: apiHeaders() });

const listFolders = async () => {
  const response = await api.get(`${WORKSPACE_API}/api/folder/list`, { headers: apiHeaders() });
  expect(response.ok()).toBeTruthy();

  return (await response.json()).data as FolderSummary[];
};

const dialogOf = (page: Page) => page.getByRole("dialog");

const getDialogParam = (url: string) => {
  const params = new URL(url).searchParams;
  if (params.get("e") !== "folder") return null;
  return params.get("ca") === "create" ? "create" : params.get("rid");
};

const expectDialogParam = (page: Page, value: string | null) =>
  expect.poll(() => getDialogParam(page.url())).toBe(value);

const openCreateFromMenu = async (page: Page) => {
  await page.getByRole("button", { name: "More create options" }).click();
  await page.getByRole("menuitem", { name: "Create folder" }).click();
  await expect(dialogOf(page)).toBeVisible();
};

const openEditFromTile = async (page: Page) => {
  await page.getByRole("button", { name: `Actions for folder ${EXISTING_NAME}` }).click();
  await page.getByRole("menuitem", { name: "Edit details" }).click();
  await expect(dialogOf(page)).toBeVisible();
};

const typeName = async (page: Page, text: string) => {
  await dialogOf(page).getByLabel("Name").click();
  await page.keyboard.type(text);
};

test.beforeAll(async () => {
  api = await request.newContext();
  session = await loginAsAdmin(api);

  existingFolderId = await createFolderThroughApi(EXISTING_NAME, EXISTING_DESCRIPTION);
});

test.afterAll(async () => {
  if (!api) return;

  try {
    const createdByUi = (await listFolders()).filter(({ name }) => name.startsWith(RUN_ID));
    createdByUi.forEach(({ id }) => folderIdsToDelete.add(id));
    for (const id of folderIdsToDelete) await deleteFolderThroughApi(id);
  } finally {
    await api.dispose();
  }
});

test.beforeEach(async ({ page }) => {
  await connectPage(page, session);
});

test("Create folder from the menu reopens empty after a reload", async ({ page }) => {
  await page.goto("agents");
  await openCreateFromMenu(page);
  await expectDialogParam(page, "create");

  await page.reload();
  await expect(dialogOf(page)).toBeVisible();
  await expect(dialogOf(page).getByLabel("Name")).toHaveValue("");
});

test("Create folder still opens when the folder list request fails", async ({ page }) => {
  await page.route("**/workspace/api/folder/list**", (route) =>
    route.fulfill({ status: 500, body: "failed" }),
  );
  await page.goto("agents");
  await openCreateFromMenu(page);

  await expect(dialogOf(page).getByLabel("Name")).toBeVisible();
});

test("New folder tile reopens after a reload", async ({ page }) => {
  await page.goto("agents");
  await page.getByRole("button", { name: /New folder/ }).click();
  await expect(dialogOf(page)).toBeVisible();

  await page.reload();
  await expect(dialogOf(page)).toBeVisible();
});

test("folder page switcher New folder reopens on the same folder after a reload", async ({
  page,
}) => {
  await page.goto(`agents/folders/${existingFolderId}`);
  await page
    .getByRole("button", { name: new RegExp(EXISTING_NAME) })
    .first()
    .click();
  await page.getByRole("menuitem", { name: "New folder" }).click();
  await expect(dialogOf(page)).toBeVisible();

  await page.reload();
  await expect(dialogOf(page)).toBeVisible();
  expect(new URL(page.url()).pathname).toContain(`/agents/folders/${existingFolderId}`);
});

test("Edit from the tile menu and the folder page hero reopens with saved values", async ({
  page,
}) => {
  await page.goto("agents");
  await openEditFromTile(page);
  await page.reload();
  await expect(dialogOf(page).getByLabel("Name")).toHaveValue(EXISTING_NAME);
  await expect(dialogOf(page).getByLabel(/Description/)).toHaveValue(EXISTING_DESCRIPTION);

  await page.goto(`agents/folders/${existingFolderId}`);
  await page.getByRole("button", { name: /^Edit/ }).first().click();
  await expect(dialogOf(page)).toBeVisible();
  await page.reload();
  await expect(dialogOf(page).getByLabel("Name")).toHaveValue(EXISTING_NAME);
});

test("Cancel, Escape and save end the dialog for good", async ({ page }) => {
  await page.goto("agents");

  await openCreateFromMenu(page);
  await dialogOf(page).getByRole("button", { name: "Cancel" }).click();
  await expect(dialogOf(page)).toBeHidden();
  await page.reload();
  await expect(dialogOf(page)).toBeHidden();
  await expectDialogParam(page, null);

  await openCreateFromMenu(page);
  await page.keyboard.press("Escape");
  await expect(dialogOf(page)).toBeHidden();
  await page.reload();
  await expect(dialogOf(page)).toBeHidden();
  await expectDialogParam(page, null);

  await openCreateFromMenu(page);
  await typeName(page, `${RUN_ID} saved`);
  await dialogOf(page).getByRole("button", { name: "Create folder" }).click();
  await expect(dialogOf(page)).toBeHidden();
  await page.reload();
  await expect(dialogOf(page)).toBeHidden();
  await expectDialogParam(page, null);
});

test("leave prompt appears only for unsaved changes", async ({ page }) => {
  await page.goto("agents");
  await openCreateFromMenu(page);

  let promptCount = 0;
  page.on("dialog", async (dialog) => {
    if (dialog.type() === "beforeunload") promptCount += 1;
    await dialog.dismiss();
  });

  await page.reload();
  await expect(dialogOf(page)).toBeVisible();
  expect(promptCount).toBe(0);

  await typeName(page, "x");
  // IMPORTANT NOTE: a dismissed beforeunload prompt aborts the reload, so its navigation error is expected.
  await page.reload({ waitUntil: "commit" }).catch(() => undefined);
  await expect.poll(() => promptCount).toBe(1);
});

test("Edit of a deleted folder shows no dialog and one error toast", async ({ page }) => {
  const doomedName = `${RUN_ID} doomed`;
  const doomedId = await createFolderThroughApi(doomedName);

  await page.goto(`agents?e=folder&ca=edit&rid=${doomedId}`);
  await expect(dialogOf(page)).toBeVisible();
  await deleteFolderThroughApi(doomedId);
  await page.reload();

  await expect(page.getByText("Folder not found")).toHaveCount(1);
  await expect(dialogOf(page)).toBeHidden();
  await expectDialogParam(page, null);
});

test("Edit of a deleted folder on its own page shows one error toast and returns to Agents", async ({
  page,
}) => {
  const doomedName = `${RUN_ID} page doomed`;
  const doomedId = await createFolderThroughApi(doomedName);

  await page.goto(`agents/folders/${doomedId}?e=folder&ca=edit&rid=${doomedId}`);
  await expect(dialogOf(page)).toBeVisible();
  await deleteFolderThroughApi(doomedId);
  await page.reload();

  await expect(page.getByText("Folder not found")).toHaveCount(1);
  await expect(dialogOf(page)).toBeHidden();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/workspace/agents");
});

test("saving a reopened Create adds the folder and a duplicate name is refused", async ({
  page,
}) => {
  const name = `${RUN_ID} reopened`;
  await page.goto("agents");
  await openCreateFromMenu(page);
  await page.reload();
  await typeName(page, name);
  await dialogOf(page).getByRole("button", { name: "Create folder" }).click();
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();

  await openCreateFromMenu(page);
  await typeName(page, name);
  await expect(dialogOf(page).getByText(/already exists/)).toBeVisible();
});

test("Agents table parameters survive opening, reloading and closing", async ({ page }) => {
  const query = "archived=1&page=1&perPage=10";
  await page.goto(`agents?${query}`);
  await openCreateFromMenu(page);
  await page.reload();
  await expect(dialogOf(page)).toBeVisible();
  await dialogOf(page).getByRole("button", { name: "Cancel" }).click();
  await expect(dialogOf(page)).toBeHidden();

  const params = new URL(page.url()).searchParams;
  expect(params.get("archived")).toBe("1");
  expect(params.get("page")).toBe("1");
  expect(params.get("perPage")).toBe("10");
  expect(params.get("e")).toBeNull();
});

test("an address with the dialog opens it elsewhere and Back leaves the page", async ({ page }) => {
  await page.goto("settings/general");
  const previousPath = new URL(page.url()).pathname;
  await page.goto("agents");
  await openCreateFromMenu(page);

  const copy = await page.context().newPage();
  await copy.goto(page.url());
  await expect(dialogOf(copy)).toBeVisible();
  await copy.close();

  await page.goBack();
  await expect.poll(() => new URL(page.url()).pathname).toBe(previousPath);
});

test("a cancelled draft does not come back on the next open", async ({ page }) => {
  await page.goto("agents");
  await openCreateFromMenu(page);
  await typeName(page, "draft text");
  await dialogOf(page).getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Yes, discard changes" }).click();
  await expect(dialogOf(page)).toBeHidden();

  await openCreateFromMenu(page);
  await expect(dialogOf(page).getByLabel("Name")).toHaveValue("");
});
