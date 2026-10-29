import { type APIRequestContext, type Page, type Route, expect } from "@playwright/test";

const WEB_ORIGIN = "http://localhost:3002";
export const ACCOUNTS_API = process.env.E2E_ACCOUNTS_API_URL ?? "http://localhost:4000";
export const WORKSPACE_API = process.env.E2E_WORKSPACE_API_URL ?? "http://localhost:4001";
export const EMAIL = process.env.E2E_EMAIL ?? "admin@aventisia.com";
const PASSWORD = process.env.E2E_PWD ?? "";

type SessionCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  sameSite: "Lax";
};

/** A logged-in admin: the token for direct API calls and the cookies for the browser. */
export type Session = { accessToken: string; cookies: SessionCookie[] };

const parseSessionCookies = (headers: { name: string; value: string }[]): SessionCookie[] =>
  headers
    .filter((header) => header.name.toLowerCase() === "set-cookie")
    .map((header) => {
      const [pair] = header.value.split(";");
      const separator = pair.indexOf("=");

      return {
        name: pair.slice(0, separator),
        value: pair.slice(separator + 1),
        domain: "localhost",
        path: "/",
        sameSite: "Lax",
      };
    });

const forwardRequests = (sourcePrefix: string, targetPrefix: string) => async (route: Route) => {
  const response = await route.fetch({
    url: route.request().url().replace(sourcePrefix, targetPrefix),
  });

  await route.fulfill({ response });
};

/** Logs the seeded admin (`E2E_EMAIL` / `E2E_PWD`) in through the accounts API. */
export const loginAsAdmin = async (api: APIRequestContext): Promise<Session> => {
  if (!PASSWORD) throw new Error("E2E_PWD must hold the seeded admin password.");

  const login = await api.post(`${ACCOUNTS_API}/api/auth/login`, {
    data: { email: EMAIL, pwd: PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  return {
    accessToken: (await login.json()).data.accessToken,
    cookies: parseSessionCookies(login.headersArray()),
  };
};

/** Headers that authenticate a direct backend call as the session user. */
export const getApiHeaders = (session: Session, env: "dev" | "prod" = "dev") => ({
  Cookie: `AccessToken=${session.accessToken}`,
  "X-Env-Type": env,
});

/** Signs the page in and sends its API calls straight to the local backends. */
export const connectPage = async (page: Page, session: Session) => {
  await page.context().addCookies(session.cookies);
  await page.route(
    "**/workspace/api/**",
    forwardRequests(`${WEB_ORIGIN}/workspace/api/`, `${WORKSPACE_API}/api/`),
  );
  await page.route(
    "**/accounts/api/**",
    forwardRequests(`${WEB_ORIGIN}/accounts/api/`, `${ACCOUNTS_API}/api/`),
  );
};
