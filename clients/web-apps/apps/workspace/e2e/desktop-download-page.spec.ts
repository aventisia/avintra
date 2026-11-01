import { type APIRequestContext, expect, request, test } from "@playwright/test";

import { type Session, connectPage, loginAsAdmin } from "./support/session";

const WINDOWS_INSTALLER_URL = "https://example.test/Avintra_0.1.0_x64-setup.exe";

const artifact = (platform: string, available: boolean, url = "") => ({
  platform,
  architecture: "x86_64",
  url,
  size: 1024 * 1024,
  installerType: null,
  available,
  signatureUrl: null,
});

const product = {
  versions: [
    {
      version: "0.2.0",
      notes: "",
      artifacts: [artifact("macos", true), artifact("windows", false)],
    },
    {
      version: "0.1.0",
      notes: "",
      artifacts: [artifact("windows", true, WINDOWS_INSTALLER_URL)],
    },
  ],
};

let api: APIRequestContext;
let session: Session;

test.beforeAll(async () => {
  api = await request.newContext();
  session = await loginAsAdmin(api);
});

test.afterAll(async () => {
  await api?.dispose();
});

test("The download page opens from the account menu and offers the newest Windows build", async ({
  page,
}) => {
  await connectPage(page, session);
  await page.route("**/binaries/download-manifest", (route) =>
    route.fulfill({
      json: { data: { desktop: product, runner: product }, message: "", statusCode: 200 },
    }),
  );

  await page.goto("agents");
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: "Download desktop app" }).click();
  await expect(page).toHaveURL(/\/download$/);

  await page.getByRole("tab", { name: "Windows" }).click();
  await expect(page.getByRole("link", { name: "Download for Windows" })).toHaveAttribute(
    "href",
    WINDOWS_INSTALLER_URL,
  );

  await page.getByRole("button", { name: "See install steps" }).click();
  await expect(page.locator("#install-runner")).toBeInViewport();
});
