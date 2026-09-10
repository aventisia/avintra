import dotenv from "dotenv";
import pg from "pg";
import { createCorsair, setupCorsair } from "corsair";
import { plugins as registeredPlugins } from "./plugins.js";

// Load defaults first, then allow .env.local to override with real local values.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

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

// Public workspace app URL used to build browser-facing OAuth URLs. The browser
// must be able to reach these, so they use the public APP_BASE_URL (proxied by
// nginx through the generic "integration" path), never the internal sidecar or
// the internal WORKSPACE_API_BASE_URL.
const workspaceAppUrl = process.env.APP_BASE_URL
  ? `https://${process.env.APP_BASE_URL}/workspace`
  : process.env.WORKSPACE_API_BASE_URL;

// Explicit override, kept in sync with the backend's CORSAIR_REDIRECT_URI. When
// unset, derive the public callback from APP_BASE_URL so it matches the Workspace
// API proxy route /api/integration/oauth-callback.
const corsairRedirectUri =
  process.env.CORSAIR_REDIRECT_URI ??
  `${workspaceAppUrl}/api/integration/oauth-callback`;

export const corsair = createCorsair({
  multiTenancy: true,
  plugins,
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  manual: {
    // Consent/callback URLs are proxied by the Workspace API under the generic
    // "integration" path, so the browser only ever talks to the public URL, never
    // the internal sidecar. baseUrl points at the generic connect endpoint and
    // redirectUri at the OAuth callback for the configured backend.
    baseUrl: `${workspaceAppUrl}/api/integration/connect`,
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
