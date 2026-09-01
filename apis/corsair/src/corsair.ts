import dotenv from "dotenv";
import pg from "pg";
import { createCorsair, setupCorsair } from "corsair";
import { plugins as registeredPlugins } from "./plugins.js";

// Load defaults first, then allow .env.local to override with real local values.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const { Pool } = pg;

const POSTGRESQL_DATABASE = "CorsairDb";

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

export const corsair = createCorsair({
  multiTenancy: true,
  plugins,
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  manual: {
    baseUrl: `${process.env.APP_URL}/connect`,
    // The OAuth callback is proxied through the Workspace API, so the redirect
    // URI must point at the public proxy path (never the internal sidecar).
    redirectUri:
      process.env.CORSAIR_REDIRECT_URI ??
      `${process.env.APP_URL}/api/oauth/callback`,
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
  console.log("Provisioned Corsair integration rows for:", plugins.map((p) => (p as any).id).join(", "));
}
