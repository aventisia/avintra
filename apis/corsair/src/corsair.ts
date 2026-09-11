import dotenv from "dotenv";
import pg from "pg";
import { createCorsair, setupCorsair } from "corsair";
import { plugins as registeredPlugins } from "./plugins.js";

// --- Variable selection precedence ---
// Config is resolved in this order (highest wins):
//   1. System environment variables (server: systemd Environment=/EnvironmentFile=;
//      local: setx /M or $env:). These are authoritative.
//   2. .env.local  (local dev overrides, gitignored)
//   3. .env        (committed defaults)
// dotenv never overrides an already-set variable, so anything present in the
// process environment wins over both .env files. This keeps the server and
// local dev on the same config source.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const { Pool } = pg;

const POSTGRESQL_DATABASE = process.env.POSTGRESQL_DATABASE || "CorsairDb";

export const pool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  port: Number(process.env.POSTGRESQL_PORT || "5432"),
  database: POSTGRESQL_DATABASE,
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
});

// TODO: When an external caller needs user-scoped auth, configure Corsair's
// permission/approval settings here (permissions.mode, approvalBaseUrl, etc.).
// For now the sidecar is backend-only and private to the deployment network;
// the Workspace API is the authorization boundary.

export const plugins = registeredPlugins;

// --- URL domains (two distinct ones) ---
//
// 1. INTERNAL sidecar URL (CORSAIR_API_BASE_URL, e.g. http://corsair:4006).
//    This is the sidecar's OWN API base. It is used ONLY by the .NET backend
//    (WorkspaceAPIs) for backend-to-backend calls (/api/corsair/invoke,
//    /api/oauth/callback, /connect/link, ...). It is never exposed to the
//    browser and is NOT referenced in this file.
//
// 2. PUBLIC proxy URL (derived from APP_BASE_URL). The sidecar is internal-only,
//    so the browser can never reach it directly. Instead, the Workspace API
//    proxies the OAuth flow under the generic "integration" path:
//      /api/integration/connect        -> sidecar /connect
//      /api/integration/oauth-callback -> sidecar /api/oauth/callback
//    The Workspace API is mounted at /api (UsePathBase) and served on the same
//    public host as the workspace app, so the public base is:
//      https://<APP_BASE_URL>/workspace
//    manual.baseUrl / redirectUri MUST point at these public proxy URLs so the
//    provider redirects the browser to the proxy, which forwards to the sidecar.
const publicWorkspaceBaseUrl = process.env.APP_BASE_URL
  ? `https://${process.env.APP_BASE_URL}/workspace`
  : process.env.WORKSPACE_API_BASE_URL; // local-dev fallback only; browser must reach it

// Explicit override, kept in sync with the backend's CORSAIR_REDIRECT_URI. When
// unset, derive the public callback from APP_BASE_URL so it matches the Workspace
// API proxy route /api/integration/oauth-callback.
const corsairRedirectUri =
  process.env.CORSAIR_REDIRECT_URI ??
  `${publicWorkspaceBaseUrl}/api/integration/oauth-callback`;

export const corsair = createCorsair({
  multiTenancy: true,
  plugins,
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  manual: {
    // Browser-facing OAuth endpoints, proxied by the Workspace API under the
    // generic "integration" path. The browser only ever talks to the public
    // URL; it never sees the internal sidecar or its own API URL.
    baseUrl: `${publicWorkspaceBaseUrl}/api/integration/connect`,
    redirectUri: corsairRedirectUri,
  },
});

/** Plugin metadata exposed by the Corsair SDK. */
type PluginMeta = {
  id: string;
  name: string;
  oauthConfig?: {
    providerName?: string;
    scopes?: string[];
    authUrl?: string;
    tokenUrl?: string;
  };
};

/** Return every registered plugin that ships an oauthConfig. */
export function getOAuthPlugins(): PluginMeta[] {
  return plugins
    .map((p) => p as unknown as PluginMeta)
    .filter((p) => p.oauthConfig !== undefined);
}

/** True if a registered plugin supports OAuth. */
export function isOAuthPlugin(pluginId: string): boolean {
  return getOAuthPlugins().some((p) => p.id === pluginId.toLowerCase());
}

/** Resolve a plugin id to its metadata, or undefined if unknown. */
export function getPluginMeta(pluginId: string): PluginMeta | undefined {
  return plugins
    .map((p) => p as unknown as PluginMeta)
    .find((p) => p.id === pluginId.toLowerCase());
}

/**
 * Idempotent: creates integration rows in the Corsair DB for all registered
 * plugins. Must be called once at startup after running migration.sql.
 */
export async function provision() {
  await setupCorsair(corsair);
  console.log(
    "Provisioned Corsair integration rows for:",
    plugins.map((p) => (p as any).id).join(", "),
  );
}
