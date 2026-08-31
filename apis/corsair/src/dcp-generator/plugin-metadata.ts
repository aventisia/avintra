/**
 * Extracts normalized metadata from registered Corsair plugin objects.
 *
 * Each plugin object (from `@corsair-dev/*`) exposes:
 *   - id            e.g. "github", "outlook", "slack"
 *   - oauthConfig   { providerName, authUrl, tokenUrl, scopes }
 *   - endpointMeta  { "<dotted.action>": { riskLevel, description } }
 *   - authConfig    { api_key | oauth_2 | managed }
 *
 * We read these directly so labels/descriptions are derived from Corsair
 * itself rather than hard-coded in the generator.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PluginMetadata } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Default icon map for known plugins. Missing entries fall back to null. */
export const DEFAULT_ICON_MAP: Record<string, string> = {
  github: "/assets/GitHub.svg",
  outlook: "/assets/M365.svg",
  slack: "/assets/Slack.svg",
  twilio: "/assets/Twilio.svg",
  notion: "/assets/Notion.svg",
  hubspot: "/assets/HubSpot.svg",
  stripe: "/assets/Stripe.svg",
  resend: "/assets/Resend.svg",
  tavily: "/assets/Tavily.svg",
  openweathermap: "/assets/OpenWeatherMap.svg",
};

/** Default base URLs for OpenAPI spec generation. */
export const DEFAULT_BASE_URL_MAP: Record<string, string> = {
  github: "https://api.github.com",
  outlook: "https://graph.microsoft.com/v1.0",
  slack: "https://slack.com/api",
  twilio: "https://api.twilio.com/2010-04-01",
  notion: "https://api.notion.com/v1",
  hubspot: "https://api.hubapi.com",
  stripe: "https://api.stripe.com/v1",
  resend: "https://api.resend.com",
  tavily: "https://api.tavily.com",
  openweathermap: "https://api.openweathermap.org/data/2.5",
};

/** Title-case a plugin id, e.g. "openweathermap" → "Openweathermap". */
export function titleCase(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/** Read the package description for a plugin from node_modules. */
function readPackageDescription(pluginId: string): string | undefined {
  try {
    const pkgPath = path.resolve(
      __dirname,
      "../../node_modules/@corsair-dev",
      pluginId,
      "package.json",
    );
    if (!fs.existsSync(pkgPath)) return undefined;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { description?: string };
    return pkg.description;
  } catch {
    return undefined;
  }
}

/** Cast a plugin object to a shape we can read metadata from. */
type RawPlugin = {
  id?: string;
  oauthConfig?: { providerName?: string };
  endpointMeta?: Record<string, { description?: string }>;
  authConfig?: Record<string, unknown>;
};

/**
 * Normalize a registered Corsair plugin into PluginMetadata.
 * Falls back to sensible defaults when a field is missing.
 */
export function toPluginMetadata(
  plugin: unknown,
  iconMap: Record<string, string> = DEFAULT_ICON_MAP,
): PluginMetadata {
  const raw = plugin as RawPlugin;
  const id = raw.id ?? "unknown";
  const providerName = raw.oauthConfig?.providerName ?? titleCase(id);
  const pkgDescription = readPackageDescription(id);
  const description =
    pkgDescription && pkgDescription.trim().length > 0
      ? pkgDescription
      : `Work with ${providerName} services via Corsair.`;

  const actionDescriptions: Record<string, string> = {};
  for (const [action, meta] of Object.entries(raw.endpointMeta ?? {})) {
    if (meta?.description) actionDescriptions[action] = meta.description;
  }

  const authType = raw.authConfig && "oauth_2" in raw.authConfig ? "oauth_2" : "accessToken";

  return {
    id,
    providerName,
    description,
    img: iconMap[id] ?? null,
    authType,
    actionDescriptions,
  };
}

/** Normalize an array of plugin objects. */
export function toPluginMetadataList(
  plugins: readonly unknown[],
  iconMap: Record<string, string> = DEFAULT_ICON_MAP,
): PluginMetadata[] {
  return plugins.map((p) => toPluginMetadata(p, iconMap));
}
