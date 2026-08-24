import dotenv from "dotenv";
import pg from "pg";
import { createCorsair, setupCorsair } from "corsair";
import { github } from "@corsair-dev/github";
import { resend } from "@corsair-dev/resend";
import { tavily } from "@corsair-dev/tavily";
import { slack } from "@corsair-dev/slack";
import { stripe } from "@corsair-dev/stripe";
import { twilio } from "@corsair-dev/twilio";
import { notion } from "@corsair-dev/notion";
import { hubspot } from "@corsair-dev/hubspot";
import { openweathermap } from "@corsair-dev/openweathermap";

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
// For now the sidecar is platform-internal and protected by the shared API key.

export const plugins = [
  github(),
  resend(),
  tavily(),
  slack(),
  stripe(),
  twilio(),
  notion(),
  hubspot(),
  openweathermap(),
] as const;

export const corsair = createCorsair({
  multiTenancy: true,
  plugins,
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  manual: {
    baseUrl: `${process.env.APP_URL}/connect`,
    redirectUri: `${process.env.APP_URL}/api/oauth/callback`,
  },
});

/**
 * Idempotent: creates integration rows in the Corsair DB for all registered
 * plugins. Must be called once at startup after running migration.sql.
 */
export async function provision() {
  await setupCorsair(corsair);
  console.log("Provisioned Corsair integration rows for:", plugins.map((p) => (p as any).id).join(", "));
}
