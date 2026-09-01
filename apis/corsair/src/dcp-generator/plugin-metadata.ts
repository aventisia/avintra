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
  // --- AI / LLM providers ---
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com",
  gemini: "https://generativelanguage.googleapis.com",
  anthropicadministrator: "https://api.anthropic.com",
  perplexityai: "https://api.perplexity.ai",
  groqcloud: "https://api.groq.com/openai",
  openrouter: "https://openrouter.ai/api/v1",
  huggingface: "https://huggingface.co/api",
  ollama: "http://localhost:11434",
  aimlapi: "https://api.aimlapi.com",
  apipie: "https://api.apipie.ai",
  asticaai: "https://api.astica.ai",
  bigml: "https://bigml.io/andromeda",
  diffbot: "https://api.diffbot.com/v3",
  jigsawstack: "https://api.jigsawstack.com/v1",
  ocrspace: "https://api.ocr.space/parse/image",
  ocrwebservice: "https://www.ocrwebservice.com/restservices",
  textrazor: "https://api.textrazor.com",
  tisane: "https://api.tisane.ai",
  witai: "https://api.wit.ai",
  // --- Google / Microsoft ---
  gmail: "https://gmail.googleapis.com",
  googlecalendar: "https://www.googleapis.com/calendar/v3",
  googlesheets: "https://sheets.googleapis.com/v4",
  googledocs: "https://docs.googleapis.com/v1",
  googledrive: "https://www.googleapis.com/drive/v3",
  googlemeet: "https://www.googleapis.com/calendar/v3",
  googlebigquery: "https://bigquery.googleapis.com/bigquery/v2",
  googlecloudvision: "https://vision.googleapis.com/v1",
  googlemaps: "https://maps.googleapis.com/maps/api",
  googleaddressvalidation: "https://addressvalidation.googleapis.com/v1",
  teams: "https://graph.microsoft.com/v1.0",
  onedrive: "https://graph.microsoft.com/v1.0",
  sharepoint: "https://graph.microsoft.com/v1.0",
  // --- Project management / productivity ---
  linear: "https://api.linear.app/graphql",
  jira: "https://your-domain.atlassian.net",
  asana: "https://app.asana.com/api/1.0",
  trello: "https://api.trello.com/1",
  monday: "https://api.monday.com/v2",
  todoist: "https://api.todoist.com/rest/v2",
  airtable: "https://api.airtable.com/v0",
  confluence: "https://{site}.atlassian.net/wiki",
  basecamp: "https://3.basecampapi.com",
  // --- Dev / code hosting ---
  gitlab: "https://gitlab.com/api/v4",
  bitbucket: "https://api.bitbucket.org/2.0",
  // --- CRM / sales / marketing ---
  salesforce: "https://your-instance.salesforce.com",
  intercom: "https://api.intercom.io",
  zendesk: "https://{subdomain}.zendesk.com/api/v2",
  mailchimp: "https://us1.api.mailchimp.com/3.0",
  mailtrap: "https://connect.mailtrap.io/api",
  zohomail: "https://mail.zoho.com/api",
  // --- Payments ---
  razorpay: "https://api.razorpay.com/v1",
  // --- Communication ---
  telegram: "https://api.telegram.org",
  discord: "https://discord.com/api",
  whatsapp: "https://graph.facebook.com/v19.0",
  // --- Social ---
  spotify: "https://api.spotify.com/v1",
  youtube: "https://www.googleapis.com/youtube/v3",
  twitter: "https://api.twitter.com/2",
  twitterapiio: "https://api.twitterapi.io",
  linkedin: "https://api.linkedin.com/v2",
  instagram: "https://graph.instagram.com",
  facebook: "https://graph.facebook.com/v19.0",
  reddit: "https://oauth.reddit.com",
  strava: "https://www.strava.com/api/v3",
  kaggle: "https://www.kaggle.com/api/v1",
  // --- File storage ---
  dropbox: "https://api.dropboxapi.com/2",
  box: "https://api.box.com/2.0",
  // --- Web / scraping ---
  webflow: "https://api.webflow.com/v2",
  figma: "https://api.figma.com/v1",
  canva: "https://api.canva.com/rest",
  typeform: "https://api.typeform.com",
  tally: "https://api.tally.so",
  formbricks: "https://app.formbricks.com/api",
  calendly: "https://api.calendly.com",
  cal: "https://api.cal.com/v1",
  zoom: "https://api.zoom.us/v2",
  firecrawl: "https://api.firecrawl.dev/v1",
  exa: "https://api.exa.ai",
  serpapi: "https://serpapi.com",
  browseai: "https://api.browse.ai/v2",
  browserless: "https://chrome.browserless.io",
  anchorbrowser: "https://api.anchorbrowser.io",
  // --- Data / infra ---
  algolia: "https://{app-id}.algolia.net",
  pinecone: "https://{index}.svc.{environment}.pinecone.io",
  neon: "https://api.neon.tech/v2",
  supabase: "https://api.supabase.com/v1",
  databricks: "https://{workspace}.cloud.databricks.com/api/2.0",
  datadog: "https://api.datadoghq.com/api/v1",
  grafana: "https://grafana.com/api",
  sentry: "https://sentry.io/api/0",
  posthog: "https://app.posthog.com/api",
  clickhouse: "https://{host}:8443",
  cloudflare: "https://api.cloudflare.com/client/v4",
  vercel: "https://api.vercel.com",
  digitalocean: "https://api.digitalocean.com/v2",
  dockerhub: "https://hub.docker.com/v2",
  apify: "https://api.apify.com/v2",
  cloudinary: "https://api.cloudinary.com/v1_1",
  imgbb: "https://api.imgbb.com/1",
  api2pdf: "https://v2019.api2pdf.com",
  // --- Ops / monitoring ---
  pagerduty: "https://api.pagerduty.com",
  bugsnag: "https://api.bugsnag.com",
  betterstack: "https://api.betterstack.com",
  clockify: "https://api.clockify.me/api/v1",
  harvest: "https://api.harvestapp.com/v2",
  toggl: "https://api.track.toggl.com/api/v9",
  timecamp: "https://app.timecamp.com/third_party/api",
  amplitude: "https://api2.amplitude.com/2",
  circleci: "https://circleci.com/api/v2",
  // --- Misc / niche ---
  workday: "https://{tenant}.workday.com/ccx/api",
  fireflies: "https://api.fireflies.ai/graphql",
  vapi: "https://api.vapi.ai",
  heygen: "https://api.heygen.com/v2",
  sourcegraph: "https://sourcegraph.com/.api",
  wakatime: "https://wakatime.com/api/v1",
  vestaboard: "https://platform.vestaboard.com",
  youcom: "https://api.you.com",
  xquik: "https://api.xquik.com",
  zoominfo: "https://api.zoominfo.com",
  securitytrails: "https://api.securitytrails.com/v1",
  brandfetch: "https://api.brandfetch.io/v2",
  oura: "https://api.ouraring.com/v2",
  ambee: "https://api.ambeedata.com",
  ambientweather: "https://api.ambientweather.net/v1",
  bigdatacloud: "https://api.bigdatacloud.net/data",
  here: "https://{base}.hereapi.com/v3",
  collegefootballdata: "https://api.collegefootballdata.com",
  apisports: "https://v3.football.api-sports.io",
  alphavantage: "https://www.alphavantage.co/query",
  abuseipdb: "https://api.abuseipdb.com/api/v2",
  mailboxlayer: "https://api.mailboxlayer.com",
  bouncer: "https://api.usebouncer.com/v1",
  bettercontact: "https://api.bettercontact.io",
  aeroleads: "https://api.aeroleads.com/v1",
  wiza: "https://api.wiza.co/v1",
  abstract: "https://emailvalidation.abstractapi.com/v1",
  addresszen: "https://api.addresszen.com",
  affinda: "https://api.affinda.com/v3",
  agencyzoom: "https://api.agencyzoom.com",
  agentmail: "https://api.agentmail.to",
  agentql: "https://api.agentql.com",
  agenty: "https://api.agenty.com",
  agilitycms: "https://api.agilitycms.com",
  ahrefs: "https://api.ahrefs.com/v3",
  allimagesai: "https://api.allimages.ai",
  alttextai: "https://api.alttext.ai",
  amara: "https://amara.org/api",
  amcards: "https://api.amcards.com",
  anonyflow: "https://api.anonyflow.com",
  apaleo: "https://api.apaleo.com/v1",
  apibible: "https://api.scripture.api.bible/v1",
  apilabz: "https://api.apilabz.com",
  apininjas: "https://api.api-ninjas.com/v1",
  asindataapi: "https://api.asindataapi.com",
  asyncinterview: "https://api.asyncinterview.ai",
  attio: "https://api.attio.com",
  autom: "https://api.autom.dev",
  ayrshare: "https://api.ayrshare.com",
  backendless: "https://api.backendless.com",
  bannerbear: "https://api.bannerbear.com/v2",
  bart: "https://api.bart.gov/api",
  baselinker: "https://api.baselinker.com",
  basin: "https://usebasin.com/f",
  beaconstac: "https://api.beaconstac.com",
  betterproposals: "https://api.betterproposals.io",
  bigmailer: "https://api.bigmailer.io/v1",
  blazemeter: "https://a.blazemeter.com/api/v4",
  bluesky: "https://bsky.social/xrpc",
  boloforms: "https://api.boloforms.com",
  boltiot: "https://api.boltiot.com",
  bonsai: "https://api.hellobonsai.com",
  bookingmood: "https://api.bookingmood.com",
  botpress: "https://api.botpress.cloud",
  botsonic: "https://api.botsonic.ai",
  canvas: "https://canvas.instructure.com/api",
  chatbotkit: "https://api.chatbotkit.com",
  clientary: "https://api.clientary.com",
  contentfulgraphql: "https://graphql.contentful.com/content/v1/spaces",
  contextsevenmcp: "https://context7.com",
  crowterminal: "https://api.crowterminal.com",
  customgpt: "https://api.customgpt.ai",
  devinmcp: "https://api.devin.ai",
  dreamstudio: "https://api.stability.ai/v1",
  dropboxsign: "https://api.hellosign.com/v3",
  epicgames: "https://api.epicgames.dev",
  faraday: "https://api.faraday.ai",
  habitica: "https://habitica.com/api/v3",
  hashnode: "https://api.hashnode.com",
  htmltoimage: "https://api.htmltoimage.com",
  insightoai: "https://api.insighto.ai",
  loyverse: "https://api.loyverse.com/v1.0",
  merriamwebsterdict: "https://dictionaryapi.com/api/v3",
  nextdns: "https://api.nextdns.io",
  pdfmonkey: "https://api.pdfmonkey.io",
  retailed: "https://api.retailed.io",
  streamtime: "https://api.streamtime.net",
  studiobyai21labs: "https://api.studio.ai21.com",
  synthflowai: "https://api.synthflow.ai",
  tavilymcp: "https://api.tavily.com",
  twentyonerisk: "https://api.21risk.com",
  twochat: "https://api.twochat.com",
  unione: "https://api.unione.io",
  webvizio: "https://api.webvizio.com",
  uniswapapi: "https://api.uniswap.org/v1",
  alchemy: "https://eth-mainnet.g.alchemy.com/v2",
  blocknative: "https://api.blocknative.com",
  dodopayments: "https://api.dodopayments.com",
  brex: "https://api.brex.com/v2",
  doppler: "https://api.doppler.com/v3",
  onepassword: "https://{vault}.1password.com/v1",
  bitwarden: "https://vault.bitwarden.com/api",
  beeminder: "https://www.beeminder.com/api/v1",
  ticktick: "https://api.ticktick.com",
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
