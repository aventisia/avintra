/**
 * Corsair Sidecar API Server — INTERNAL ONLY
 *
 * This sidecar is backend-only infrastructure for the Worc Platform. It is NOT
 * exposed to end users and must be deployed in a private, isolated network behind
 * the Workspace API proxy. All endpoints are accessed exclusively via the backend
 * Workspace API (`CorsairInvokeService`), and end users interact only with the
 * generated plugin action configurations through the Studio UI.
 *
 * SECURITY NOTE: This sidecar has no authentication layer because it assumes
 * network isolation (private deployment network). Do NOT expose this to the
 * public internet; always route requests through the Workspace API proxy.
 */

import dotenv from "dotenv";
import express from "express";
import { toExpressHandler, PermissionRequiredError, AuthMissingError, listOperations, getStructuredSchema } from "corsair";
import { createIntegrationKeyManager } from "corsair/core";
import { createCorsairDatabase } from "corsair/db";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import { corsair, provision, plugins, pool, isOAuthPlugin, getPluginMeta } from "./corsair.js";
import { validatePayload, normalizeInvokeError } from "./validation.js";

// Load defaults first, then allow .env.local to override with real local values.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

// --- Proxy-aware fetch for corporate networks ---
// Node's native fetch does not honour http_proxy / https_proxy. We route outbound
// requests through undici when a proxy is configured, matching curl's behaviour.
const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
const proxyAgent = proxyUrl ? new ProxyAgent({ uri: proxyUrl }) : undefined;
if (proxyAgent) {
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = (input: any, init?: any) => undiciFetch(input, { ...init, dispatcher: proxyAgent } as any) as any;
  console.log(`[corsair:proxy] using proxy ${proxyUrl}`);
}

const app = express();
const port = Number(process.env.PORT || 3456);
const appUrl = process.env.APP_URL || `http://localhost:${port}`;
const workspaceAppUrl = process.env.WORKSPACE_APP_URL || appUrl;

// REQUIRED: express.json() must run BEFORE the Corsair route.
app.use(express.json());

// --- CORS (strict) ---
// The sidecar is internal-only. Browser-facing OAuth endpoints are reached via
// top-level navigation (redirects), not XHR, so CORS is not required for them.
// For any XHR, only allow the configured workspace origin.
const allowedOrigin = workspaceAppUrl;
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// --- List all available tools across registered plugins ---
// Mount BEFORE the catch-all Corsair handler, which uses app.use and would otherwise 404 this path.
app.get("/api/corsair/tools", async (_req, res) => {
  try {
    const operations = listOperations(corsair);
    const paths = operations.split("\n").filter(Boolean);
    const tools = paths.map((path) => {
      const schema = getStructuredSchema(corsair, path);
      return {
        path,
        plugin: path.split(".")[0],
        description: schema?.description,
        input: schema?.input,
        output: schema?.output,
      };
    });
    res.json({ tools, count: tools.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// --- Connect page (manual.baseUrl) ---
// Browser lands here with ?state=... after createLink. Resolve to the OAuth URL
// and render a minimal consent page before sending the user to the provider.
app.get("/connect", async (req, res) => {
  const state = req.query.state as string | undefined;
  if (!state) return res.status(400).send("Missing state.");
  try {
    const resolved = await corsair.manage.connect.resolve(state);
    const pluginId = (resolved as any).plugin as string | undefined;
    const oauthUrl = (resolved as any).oauthUrl as string | undefined;
    if (!pluginId || !oauthUrl) {
      return res.status(400).send("Invalid connect state: missing plugin or OAuth URL.");
    }

    const meta = getPluginMeta(pluginId);
    if (!meta?.oauthConfig) {
      return res.status(400).send(`Plugin ${pluginId} does not support OAuth.`);
    }

    // Skip the intermediate consent page and send the user directly to the
    // provider's OAuth authorization URL. The provider already shows the
    // service being connected and the requested scopes.
    return res.redirect(oauthUrl);
  } catch (err) {
    res.status(400).send(err instanceof Error ? err.message : String(err));
  }
});

// --- OAuth callback (manual.redirectUri) ---
// Provider redirects here with ?code=...&state=...; Corsair stores tokens per tenant.
// We then redirect the browser back to the workspace app with the result.
app.get("/api/oauth/callback", async (req, res) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  if (!code || !state) return res.status(400).send("Missing code or state.");
  try {
    const result = await corsair.manage.connect.oauthCallback({ code, state });
    const pluginId = result.plugin;
    const tenantId = result.tenantId;
    const redirectUrl = `${workspaceAppUrl}/configure/vault/oauth-callback?oauth_success=true&plugin=${encodeURIComponent(pluginId)}&credentialId=${encodeURIComponent(tenantId)}`;
    res.redirect(redirectUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[corsair:oauth] callback failed:", message);
    // Best-effort decode of plugin/tenant from the signed state for a useful redirect.
    let pluginId = "unknown";
    let tenantId = "unknown";
    try {
      const resolved = await corsair.manage.connect.resolve(state);
      pluginId = (resolved as any).plugin ?? pluginId;
      tenantId = (resolved as any).tenantId ?? tenantId;
    } catch {
      // ignore state decode errors; we already have the failure message
    }
    const redirectUrl = `${workspaceAppUrl}/configure/vault/oauth-callback?oauth_error=${encodeURIComponent(message)}&plugin=${encodeURIComponent(pluginId)}&credentialId=${encodeURIComponent(tenantId)}`;
    res.redirect(redirectUrl);
  }
});

// --- Suppress Corsair hub warnings for internal sidecar usage ---
// The SDK logs a warning when BYO subscribe is used without a configured hub.
// We don't use the real-time hub in this sidecar, so downgrade it to a debug log.
const originalStderr = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk: any, ...args: any[]) => {
  const text = typeof chunk === "string" ? chunk : chunk?.toString?.() ?? "";
  if (text.includes("[corsair:oauth] BYO subscribe failed") && text.includes("HubNotConfiguredError")) {
    console.debug("[corsair:oauth] hub not configured (expected for internal sidecar; real-time features disabled)");
    return true;
  }
  return originalStderr(chunk, ...(args as [any]));
};

// --- Mint a connect link for a tenant (called by the .NET backend) ---
// OAuth plugins only; API-key plugins use POST /credentials instead.
app.post("/connect/link", async (req, res) => {
  const { tenantId, plugin } = req.body ?? {};
  if (!tenantId) return res.status(400).json({ error: "tenantId required" });
  if (!plugin) return res.status(400).json({ error: "plugin required" });
  const pluginId = String(plugin).toLowerCase();
  if (!isOAuthPlugin(pluginId)) {
    return res.status(400).json({ error: `Plugin ${pluginId} does not support OAuth` });
  }
  try {
    const link = await corsair.manage.connect.createLink({ plugin: pluginId, tenantId });
    res.json({
      plugin: pluginId,
      tenantId,
      // The tenantId is the stable connection handle the backend persists.
      connectionId: tenantId,
      connectUrl: link.connectUrl,
      expiresAt: link.expiresAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.code ?? "unknown", message: err?.message });
  }
});

// --- Check whether a tenant has connected a plugin ---
app.post("/connect/status", async (req, res) => {
  const { tenantId, plugin } = req.body ?? {};
  if (!tenantId) return res.status(400).json({ error: "tenantId required" });
  if (!plugin) return res.status(400).json({ error: "plugin required" });
  try {
    const status = await corsair.manage.connectionStatus.get({ tenantId });
    const state = status[plugin] ?? "not_connected";
    res.json({
      plugin,
      tenantId,
      connectionId: tenantId,
      state,
      connected: state === "connected",
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.code ?? "unknown", message: err?.message });
  }
});

// --- Store tenant-scoped OAuth integration keys for a plugin ---
// These are the client_id / client_secret / redirect_url used by Corsair to
// drive the OAuth flow and refresh tokens for this specific tenant.
app.post("/integration-keys", async (req, res) => {
  const { plugin, tenantId, clientId, clientSecret, redirectUrl } = req.body ?? {};
  if (!plugin || !tenantId || !clientId || !clientSecret || !redirectUrl) {
    return res.status(400).json({
      error: "plugin, tenantId, clientId, clientSecret, and redirectUrl required",
    });
  }

  const pluginId = String(plugin).toLowerCase();
  if (!isOAuthPlugin(pluginId)) {
    return res.status(400).json({ error: `Plugin ${pluginId} does not support OAuth` });
  }

  try {
    const keyManager = createIntegrationKeyManager({
      authType: "oauth_2",
      integrationName: pluginId,
      kek: process.env.CORSAIR_KEK!,
      database: createCorsairDatabase(pool),
    });

    await keyManager.set_client_id(clientId);
    await keyManager.set_client_secret(clientSecret);
    await keyManager.set_redirect_url(redirectUrl);

    res.json({ success: true, plugin: pluginId, tenantId });
  } catch (err: any) {
    console.error("[corsair:integration-keys] failed:", err?.message ?? String(err));
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// --- Mirror an API-key credential into Corsair (vault already owns the copy) ---
app.post("/credentials", async (req, res) => {
  const { connectionId, plugin, credentials } = req.body ?? {};
  if (!connectionId || !plugin || !credentials || typeof credentials !== "object") {
    return res.status(400).json({ error: "connectionId, plugin, and credentials required" });
  }
  const pluginId = String(plugin).toLowerCase();
  const pluginNames = plugins.map((p) => (p as any).id as string);
  if (!pluginNames.includes(pluginId)) {
    return res.status(400).json({ error: `Unsupported plugin: ${plugin}` });
  }
  try {
    const tenant = corsair.withTenant(connectionId) as any;
    const keyManager = tenant[pluginId].keys as Record<string, (value: string) => Promise<void>>;
    for (const [field, value] of Object.entries(credentials as Record<string, unknown>)) {
      if (typeof value !== "string" || value.length === 0) continue;
      const normalizedField = {
        apikey: "api_key",
        accesstoken: "access_token",
        apitoken: "api_token",
        clientid: "client_id",
        clientsecret: "client_secret",
        redirecturl: "redirect_url",
      }[field.replaceAll("_", "").toLowerCase()] ?? field;
      const setter = keyManager[`set_${normalizedField}`];
      if (typeof setter !== "function") {
        if (pluginId === "gemini" && field.replaceAll("_", "").toLowerCase() === "host") continue;
        return res.status(400).json({ error: `Unsupported credential field: ${field}` });
      }
      await setter(value);
    }
    res.json({ success: true, connectionId, plugin: pluginId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message ?? String(err) });
  }
});

app.post("/credentials/test", async (req, res) => {
  const { connectionId, plugin } = req.body ?? {};
  if (!connectionId || !plugin) {
    return res.status(400).json({ status: "Unknown", reason: "connectionId and plugin required" });
  }

  const pluginId = String(plugin).toLowerCase();
  if (!plugins.some((registered) => (registered as any).id === pluginId)) {
    return res.status(400).json({ status: "Unknown", reason: `Unsupported plugin: ${plugin}` });
  }

  try {
    const status = await corsair.manage.connectionStatus.get({ tenantId: String(connectionId) });
    const state = String(status[pluginId] ?? "not_connected");
    if (state === "connected") return res.json({ status: "Connected" });
    if (state === "expired") return res.json({ status: "Expired", reason: "Credential expired." });
    return res.json({ status: "NotTestable", reason: "No safe provider health check is configured." });
  } catch {
    return res.json({ status: "Unknown", reason: "Connection test unavailable." });
  }
});

// --- Unmirror / delete an API-key credential from Corsair ---
// We clear the stored key/config instead of deleting the row so FK relationships
// with corsair_entities / corsair_events stay intact.
app.delete("/credentials", async (req, res) => {
  const { connectionId, plugin } = req.body ?? {};
  if (!connectionId || !plugin) {
    return res.status(400).json({ error: "connectionId and plugin required" });
  }

  const pluginId = String(plugin).toLowerCase();
  const pluginNames = plugins.map((p) => (p as any).id as string);
  if (!pluginNames.includes(pluginId)) {
    return res.status(400).json({ error: `Unsupported plugin: ${plugin}` });
  }

  try {
    await pool.query(
      `UPDATE corsair_accounts
       SET dek = NULL, config = '{}', updated_at = NOW()
       WHERE tenant_id = $1 AND integration_id = $2`,
      [String(connectionId), pluginId]
    );
    return res.status(204).send();
  } catch (err: any) {
    console.error("[corsair:credentials] clear failed:", err?.message ?? String(err));
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// --- Invoke a Corsair tool using a stored credential ---
// The sidecar is backend-only and private to the deployment network. The
// Workspace API is the authorization boundary: it authenticates the caller,
// resolves the Vault credential, and enforces tenant/environment/resource-share
// access before calling this endpoint.
app.post("/api/corsair/invoke", async (req, res) => {
  const { connectionId, plugin, action, payload = {} } = req.body ?? {};
  const pluginId = String(plugin).toLowerCase();
  if (!connectionId || !pluginId || !action) {
    return res.status(400).json({ success: false, error: "connectionId, plugin, and action required" });
  }
  const pluginNames = plugins.map((p) => (p as any).id as string);
  if (!pluginNames.includes(pluginId)) {
    return res.status(400).json({ success: false, error: `Unsupported plugin: ${plugin}` });
  }

  const parts = String(action).split(".");
  const tenant = corsair.withTenant(connectionId) as any;
  let fn: any = tenant[pluginId]?.api;
  for (const part of parts) fn = fn?.[part];
  if (typeof fn !== "function") return res.status(400).json({ success: false, error: `Unknown action: ${pluginId}.${action}` });

  // Validate the payload against the plugin's declared input schema before
  // dispatching to the provider SDK. This prevents malformed/oversized input
  // (and path/URL injection via interpolated fields) from reaching the provider.
  const schema = getStructuredSchema(corsair, `${pluginId}.api.${action}`);
  const validationErrors = validatePayload(schema?.input, payload);
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, error: "Invalid tool input", details: validationErrors.join("; ") });
  }

  try {
    const result = await fn(payload);
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err instanceof PermissionRequiredError) {
      return res.status(202).json({ success: false, approvalRequired: true, message: err.message });
    }
    if (err instanceof AuthMissingError) {
      return res.status(401).json({
        success: false,
        needsConnect: true,
        plugin: err.pluginId,
        authType: err.authType,
        message: err.message,
      });
    }
    const normalized = normalizeInvokeError(err);
    // Log only a sanitized summary — never the raw error object, which can carry
    // the Authorization header / request body containing the live credential.
    console.error(`[corsair:invoke] ${pluginId}.${action} failed: ${normalized.body.errorType} (${normalized.status})`);
    res.status(normalized.status).json(normalized.body);
  }
});

// --- Readiness ---
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// --- Status ---
app.get("/dashboard", (_req, res) => res.send("Connected. See /api/corsair/ok for health."));

// Corsair management handler: serves /connect/links, /connect/resolve,
// /connect/oauth-callback, /ok, etc. Keep this catch-all after the explicit
// routes above so it cannot intercept the custom invoke endpoint.
app.use("/api/corsair", toExpressHandler(corsair, { basePath: "/api/corsair" }));

app.listen(port, async () => {
  await provision();
  console.log(`Corsair APIs listening on ${appUrl}`);
});
