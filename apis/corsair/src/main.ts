import dotenv from "dotenv";
import express from "express";
import { toExpressHandler, PermissionRequiredError, AuthMissingError, listOperations, getStructuredSchema } from "corsair";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import { corsair, provision, plugins, pool } from "./corsair.js";

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
// Browser lands here with ?state=... after createLink. Resolve to the OAuth URL.
app.get("/connect", async (req, res) => {
  const state = req.query.state as string | undefined;
  if (!state) return res.status(400).send("Missing state.");
  try {
    const { oauthUrl } = await corsair.manage.connect.resolve(state);
    res.redirect(oauthUrl);
  } catch (err) {
    res.status(400).send(err instanceof Error ? err.message : String(err));
  }
});

// --- OAuth callback (manual.redirectUri) ---
// Provider redirects here with ?code=...&state=...; Corsair stores tokens per tenant.
app.get("/api/oauth/callback", async (req, res) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  if (!code || !state) return res.status(400).send("Missing code or state.");
  try {
    const result = await corsair.manage.connect.oauthCallback({ code, state });
    res.redirect(`/dashboard?connected=${encodeURIComponent(result.plugin)}`);
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : String(err));
  }
});

// --- Mint a connect link for a tenant (called by the .NET backend) ---
// OAuth plugins only; API-key plugins use POST /credentials instead.
app.post("/connect/link", requireApiKey, async (req, res) => {
  const { tenantId, plugin } = req.body ?? {};
  if (!tenantId) return res.status(400).json({ error: "tenantId required" });
  if (!plugin) return res.status(400).json({ error: "plugin required" });
  try {
    const link = await corsair.manage.connect.createLink({ plugin, tenantId });
    res.json({
      plugin,
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
