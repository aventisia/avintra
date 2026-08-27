import dotenv from "dotenv";
import express from "express";
import { toExpressHandler, PermissionRequiredError, AuthMissingError, listOperations, getStructuredSchema } from "corsair";
import { createIntegrationKeyManager } from "corsair/core";
import { createCorsairDatabase } from "corsair/db";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import { corsair, provision, plugins, pool, isOAuthPlugin, getPluginMeta } from "./corsair.js";

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
const apiKey = process.env.CORSAIR_API_KEY;

// REQUIRED: express.json() must run BEFORE the Corsair route.
app.use(express.json());

// Shared-secret middleware: protects all sidecar routes except the Corsair
// management handler (which has its own token checks and needs public OAuth callbacks).
// TODO: When external callers arrive, replace/augment this with JWT validation and
// resolve a tenant/user identity for per-credential authorization.
function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!apiKey) return next();
  const header = req.headers["x-corsair-api-key"];
  if (header !== apiKey) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing or invalid X-Corsair-Api-Key header" });
  }
  next();
}

// --- List all available tools across registered plugins ---
// Mount BEFORE the catch-all Corsair handler, which uses app.use and would otherwise 404 this path.
app.get("/api/corsair/tools", requireApiKey, async (_req, res) => {
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

// Corsair management handler: serves /connect/links, /connect/resolve,
// /connect/oauth-callback, /ok, etc. Intentionally NOT behind requireApiKey.
app.use("/api/corsair", toExpressHandler(corsair, { basePath: "/api/corsair" }));

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

    const providerName = meta.oauthConfig.providerName ?? meta.name ?? pluginId;
    const scopes = meta.oauthConfig.scopes ?? [];
    const cancelUrl = `${workspaceAppUrl}/configure/vault/oauth-callback?oauth_cancelled=true&plugin=${encodeURIComponent(pluginId)}&credentialId=${encodeURIComponent((resolved as any).tenantId ?? "")}`;

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect to ${escapeHtml(providerName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background: #f4f6f8; color: #1f2937; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px; max-width: 420px; width: 100%; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    p { margin: 0 0 16px; color: #4b5563; line-height: 1.5; }
    .scopes { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; }
    .scopes ul { margin: 8px 0 0; padding-left: 20px; }
    .scopes li { margin-bottom: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #374151; }
    .actions { display: flex; gap: 12px; }
    button, a.button { flex: 1; text-align: center; border-radius: 8px; padding: 12px 16px; font-size: 15px; font-weight: 500; cursor: pointer; text-decoration: none; }
    button { background: #111827; color: #fff; border: none; }
    button:hover { background: #374151; }
    a.button { background: #fff; color: #374151; border: 1px solid #d1d5db; }
    a.button:hover { background: #f9fafb; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Connect to ${escapeHtml(providerName)}</h1>
    <p>The workspace wants to access the following permissions on your behalf. You can revoke access at any time from the vault.</p>
    <div class="scopes">
      <strong>Requested permissions</strong>
      <ul>${scopes.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    </div>
    <div class="actions">
      <a class="button" href="${escapeHtml(cancelUrl)}">Cancel</a>
      <button onclick="location.href='${escapeHtml(oauthUrl)}'">Connect</button>
    </div>
  </div>
</body>
</html>`);
  } catch (err) {
    res.status(400).send(err instanceof Error ? err.message : String(err));
  }
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
    console.error("OAuth callback failed:", err);
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
app.post("/connect/link", requireApiKey, async (req, res) => {
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
app.post("/connect/status", requireApiKey, async (req, res) => {
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
app.post("/integration-keys", requireApiKey, async (req, res) => {
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
    console.error("Failed to store integration keys:", err);
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// --- Mirror an API-key credential into Corsair (vault already owns the copy) ---
app.post("/credentials", requireApiKey, async (req, res) => {
  const { connectionId, plugin, apiKey: keyValue } = req.body ?? {};
  if (!connectionId || !plugin || !keyValue) {
    return res.status(400).json({ error: "connectionId, plugin, and apiKey required" });
  }
  const pluginId = String(plugin).toLowerCase();
  const pluginNames = plugins.map((p) => (p as any).id as string);
  if (!pluginNames.includes(pluginId)) {
    return res.status(400).json({ error: `Unsupported plugin: ${plugin}` });
  }
  try {
    const tenant = corsair.withTenant(connectionId) as any;
    await tenant[pluginId].keys.set_api_key(keyValue);
    res.json({ success: true, connectionId, plugin: pluginId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message ?? String(err) });
  }
});

// --- Unmirror / delete an API-key credential from Corsair ---
// We clear the stored key/config instead of deleting the row so FK relationships
// with corsair_entities / corsair_events stay intact.
app.delete("/credentials", requireApiKey, async (req, res) => {
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
    console.error("Failed to clear credential", err);
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// --- Invoke a Corsair tool using a stored credential ---
app.post("/corsair/invoke", requireApiKey, async (req, res) => {
  const { connectionId, plugin, action, payload = {} } = req.body ?? {};
  const pluginId = String(plugin).toLowerCase();
  if (!connectionId || !pluginId || !action) {
    return res.status(400).json({ error: "connectionId, plugin, and action required" });
  }
  const pluginNames = plugins.map((p) => (p as any).id as string);
  if (!pluginNames.includes(pluginId)) {
    return res.status(400).json({ error: `Unsupported plugin: ${plugin}` });
  }

  const parts = String(action).split(".");
  const tenant = corsair.withTenant(connectionId) as any;
  let fn: any = tenant[pluginId]?.api;
  for (const part of parts) fn = fn?.[part];
  if (typeof fn !== "function") return res.status(400).json({ error: `Unknown action: ${pluginId}.${action}` });

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
    console.error("Corsair invoke error:", err);
    if (err?.cause) {
      console.error("Corsair invoke error cause:", err.cause);
    }
    res.status(500).json({
      success: false,
      error: err?.message ?? String(err),
      details: err?.cause ? String(err.cause) : undefined,
    });
  }
});

// --- Status ---
app.get("/dashboard", (_req, res) => res.send("Connected. See /api/corsair/ok for health."));

app.listen(port, async () => {
  await provision();
  console.log(`Corsair APIs listening on ${appUrl}`);
});
