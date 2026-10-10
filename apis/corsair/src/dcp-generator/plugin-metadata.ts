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
import type { PluginAuthMode, PluginMetadata, PluginOAuthConfig } from "./types.js";

import { getVaultType } from "./integration-catalog.js";
import { getNodeFieldMapping } from "./node-field-mappings/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Default icon map for known plugins. Missing entries fall back to null.
 *
 * Icons are brand-color SVGs stored in the Studio app under
 * `public/brand-img/<pluginId>.svg` (downloaded from theSVG, CC0/MIT).
 * Some plugin ids fall back to a parent brand's icon (e.g. googlecloudvision
 * uses the Google Cloud mark) — those are resolved by the download script and
 * saved under the plugin id's own filename.
 */
export const DEFAULT_ICON_MAP: Record<string, string> = {
  // --- AI / LLM providers ---
  openai: "/brand-img/openai.svg",
  deepseek: "/brand-img/deepseek.svg",
  gemini: "/brand-img/gemini.svg",
  anthropicadministrator: "/brand-img/anthropicadministrator.png",
  perplexityai: "/brand-img/perplexityai.svg",
  groqcloud: "/brand-img/groqcloud.svg",
  openrouter: "/brand-img/openrouter.svg",
  huggingface: "/brand-img/huggingface.svg",
  ollama: "/brand-img/ollama.svg",
  aimlapi: "/brand-img/aimlapi.png",
  apipie: "/brand-img/apipie.png",
  asticaai: "/brand-img/asticaai.png",
  bigml: "/brand-img/bigml.png",
  diffbot: "/brand-img/diffbot.png",
  jigsawstack: "/brand-img/jigsawstack.svg",
  ocrspace: "/brand-img/ocrspace.png",
  ocrwebservice: "/brand-img/ocrwebservice.png",
  textrazor: "/brand-img/textrazor.png",
  tisane: "/brand-img/tisane.png",
  witai: "/brand-img/witai.png",
  // --- Google / Microsoft ---
  gmail: "/brand-img/gmail.svg",
  googlecalendar: "/brand-img/googlecalendar.svg",
  googlesheets: "/brand-img/googlesheets.svg",
  googledocs: "/brand-img/googledocs.svg",
  googledrive: "/brand-img/googledrive.svg",
  googlemeet: "/brand-img/googlemeet.svg",
  googlebigquery: "/brand-img/googlebigquery.svg",
  googlecloudvision: "/brand-img/googlecloudvision.svg",
  googlemaps: "/brand-img/googlemaps.svg",
  googleaddressvalidation: "/brand-img/googleaddressvalidation.svg",
  outlook: "/brand-img/outlook.svg",
  teams: "/brand-img/teams.svg",
  onedrive: "/brand-img/onedrive.svg",
  sharepoint: "/brand-img/sharepoint.png",
  // --- Project management / productivity ---
  linear: "/brand-img/linear.svg",
  jira: "/brand-img/jira.svg",
  asana: "/brand-img/asana.svg",
  trello: "/brand-img/trello.svg",
  monday: "/brand-img/monday.svg",
  todoist: "/brand-img/todoist.svg",
  airtable: "/brand-img/airtable.svg",
  confluence: "/brand-img/confluence.svg",
  basecamp: "/brand-img/basecamp.svg",
  // --- Dev / code hosting ---
  github: "/brand-img/github.svg",
  gitlab: "/brand-img/gitlab.svg",
  bitbucket: "/brand-img/bitbucket.svg",
  // --- CRM / sales / marketing ---
  salesforce: "/brand-img/salesforce.svg",
  intercom: "/brand-img/intercom.svg",
  zendesk: "/brand-img/zendesk.svg",
  mailchimp: "/brand-img/mailchimp.svg",
  mailtrap: "/brand-img/mailtrap.svg",
  zohomail: "/brand-img/zohomail.svg",
  hubspot: "/brand-img/hubspot.svg",
  // --- Payments ---
  razorpay: "/brand-img/razorpay.svg",
  stripe: "/brand-img/stripe.svg",
  // --- Communication ---
  telegram: "/brand-img/telegram.svg",
  discord: "/brand-img/discord.svg",
  whatsapp: "/brand-img/whatsapp.svg",
  slack: "/brand-img/slack.svg",
  twilio: "/brand-img/twilio.svg",
  // --- Social ---
  spotify: "/brand-img/spotify.svg",
  youtube: "/brand-img/youtube.svg",
  twitter: "/brand-img/twitter.svg",
  linkedin: "/brand-img/linkedin.svg",
  instagram: "/brand-img/instagram.svg",
  facebook: "/brand-img/facebook.svg",
  reddit: "/brand-img/reddit.svg",
  strava: "/brand-img/strava.svg",
  kaggle: "/brand-img/kaggle.svg",
  // --- File storage ---
  dropbox: "/brand-img/dropbox.svg",
  box: "/brand-img/box.svg",
  // --- Web / scraping ---
  webflow: "/brand-img/webflow.svg",
  figma: "/brand-img/figma.svg",
  canva: "/brand-img/canva.svg",
  typeform: "/brand-img/typeform.svg",
  formbricks: "/brand-img/formbricks.svg",
  calendly: "/brand-img/calendly.svg",
  cal: "/brand-img/cal.svg",
  zoom: "/brand-img/zoom.svg",
  firecrawl: "/brand-img/firecrawl.svg",
  exa: "/brand-img/exa.svg",
  // --- Data / infra ---
  algolia: "/brand-img/algolia.svg",
  pinecone: "/brand-img/pinecone.svg",
  neon: "/brand-img/neon.svg",
  supabase: "/brand-img/supabase.svg",
  databricks: "/brand-img/databricks.svg",
  datadog: "/brand-img/datadog.svg",
  grafana: "/brand-img/grafana.svg",
  sentry: "/brand-img/sentry.svg",
  posthog: "/brand-img/posthog.svg",
  clickhouse: "/brand-img/clickhouse.svg",
  cloudflare: "/brand-img/cloudflare.svg",
  vercel: "/brand-img/vercel.svg",
  digitalocean: "/brand-img/digitalocean.svg",
  dockerhub: "/brand-img/dockerhub.svg",
  cloudinary: "/brand-img/cloudinary.svg",
  runpod: "/brand-img/runpod.svg",
  // --- Ops / monitoring ---
  pagerduty: "/brand-img/pagerduty.svg",
  bugsnag: "/brand-img/bugsnag.svg",
  betterstack: "/brand-img/betterstack.svg",
  clockify: "/brand-img/clockify.svg",
  toggl: "/brand-img/toggl.svg",
  amplitude: "/brand-img/amplitude.svg",
  circleci: "/brand-img/circleci.svg",
  // --- Misc / niche ---
  workday: "/brand-img/workday.svg",
  vapi: "/brand-img/vapi.svg",
  sourcegraph: "/brand-img/sourcegraph.svg",
  wakatime: "/brand-img/wakatime.svg",
  brandfetch: "/brand-img/brandfetch.svg",
  here: "/brand-img/here.svg",
  alphavantage: "/brand-img/alphavantage.svg",
  abstract: "/brand-img/abstract.svg",
  ahrefs: "/brand-img/ahrefs.svg",
  alchemy: "/brand-img/alchemy.svg",
  attio: "/brand-img/attio.svg",
  backendless: "/brand-img/backendless.svg",
  bitwarden: "/brand-img/bitwarden.svg",
  blazemeter: "/brand-img/blazemeter.svg",
  bluesky: "/brand-img/bluesky.svg",
  boxhero: "/brand-img/boxhero.svg",
  brex: "/brand-img/brex.svg",
  canvas: "/brand-img/canvas.svg",
  contentfulgraphql: "/brand-img/contentfulgraphql.svg",
  cursor: "/brand-img/cursor.svg",
  dodopayments: "/brand-img/dodopayments.svg",
  doppler: "/brand-img/doppler.svg",
  epicgames: "/brand-img/epicgames.svg",
  hashnode: "/brand-img/hashnode.svg",
  tavily: "/brand-img/tavily.svg",
  tavilymcp: "/brand-img/tavilymcp.svg",
  ticktick: "/brand-img/ticktick.svg",
  resend: "/brand-img/resend.svg",
  notion: "/brand-img/notion.svg",
  nextdns: "/brand-img/nextdns.svg",
  // --- Icons fetched from official pages / other open libraries ---
  ably: "/brand-img/ably.svg",
  abuseipdb: "/brand-img/abuseipdb.png",
  addresszen: "/brand-img/addresszen.svg",
  alttextai: "/brand-img/alttextai.svg",
  apify: "/brand-img/apify.svg",
  ayrshare: "/brand-img/ayrshare.svg",
  abyssale: "/brand-img/abyssale.png",
  accrediblecertificates: "/brand-img/accrediblecertificates.png",
  activecampaign: "/brand-img/activecampaign.png",
  boloforms: "/brand-img/boloforms.svg",
  bookingmood: "/brand-img/bookingmood.svg",
  botsonic: "/brand-img/botsonic.svg",
  browserless: "/brand-img/browserless.png",
  devinmcp: "/brand-img/devinmcp.png",
  faraday: "/brand-img/faraday.svg",
  hackernews: "/brand-img/hackernews.svg",
  harvest: "/brand-img/harvest.svg",
  onepassword: "/brand-img/onepassword.png",
  openweathermap: "/brand-img/openweathermap.svg",
  pdfmonkey: "/brand-img/pdfmonkey.svg",
  tally: "/brand-img/tally.svg",
  twitterapiio: "/brand-img/twitterapiio.svg",
  xquik: "/brand-img/xquik.svg",
  ...Object.fromEntries(
    [
      "activetrail",
      "aeroleads",
      "affinda",
      "agencyzoom",
      "agentmail",
      "agentql",
      "agenty",
      "agiled",
      "agilitycms",
      "aivoov",
      "altoviz",
      "amara",
      "ambientweather",
      "anchorbrowser",
      "anonyflow",
      "apaleo",
      "api2pdf",
      "apibible",
      "apilabz",
      "apininjas",
      "apisports",
      "appointo",
      "ascora",
      "ashby",
      "asindataapi",
      "asyncinterview",
      "autom",
      "bannerbear",
      "bart",
      "baselinker",
      "basin",
      "beaconstac",
      "beeminder",
      "benchmarkemail",
      "bestbuy",
      "bettercontact",
      "betterproposals",
      "bigdatacloud",
      "bigmailer",
      "blocknative",
      "boldsign",
      "boltiot",
      "bonsai",
      "borneo",
      "botbaba",
      "botpress",
      "bouncer",
      "breathehr",
      "brightdata",
      "browseai",
      "browsertool",
      "bubble",
      "bunnycdn",
      "campayn",
      "capsulecrm",
      "castingwords",
      "cdrplatform",
      "certifier",
      "chatbotkit",
      "chatfai",
      "chmeetings",
      "clientary",
      "collegefootballdata",
      "connecteam",
      "contextsevenmcp",
      "convoloai",
      "countdownapi",
      "crowterminal",
      "customgpt",
      "dadataru",
      "datarobot",
      "dreamstudio",
      "dripcel",
      "dropboxsign",
      "dynapictures",
      "emelia",
      "exist",
      "filloutforms",
      "fireflies",
      "flexisign",
      "gladia",
      "griptape",
      "habitica",
      "heygen",
      "htmltoimage",
      "imgbb",
      "insightoai",
      "loyverse",
      "mailboxlayer",
      "marketstack",
      "merriamwebsterdict",
      "oura",
      "parseur",
      "removebg",
      "retailed",
      "sapsuccessfactors",
      "scaleai",
      "scrapegraphai",
      "securitytrails",
      "serpapi",
      "streamtime",
      "synthflowai",
      "timecamp",
      "timelink",
      "tinyurl",
      "twentyonerisk",
      "unione",
      "uniswapapi",
      "uploadcare",
      "veriphone",
      "vestaboard",
      "webvizio",
      "wiza",
      "workiom",
      "worldnewsapi",
      "youcom",
      "zohoinventory",
      "zoominfo",
    ].map((id) => [id, `/brand-img/${id}.png`]),
  ),
  allimagesai: "/brand-img/allimagesai.png",
  ambee: "/brand-img/ambee.png",
  amcards: "/brand-img/amcards.png",
  brevo: "/brand-img/brevo.svg",
  buildkite: "/brand-img/buildkite.svg",
  googleanalytics: "/brand-img/googleanalytics.svg",
  kibana: "/brand-img/kibana.svg",
  sendgrid: "/brand-img/sendgrid.svg",
  studiobyai21labs: "/brand-img/studiobyai21labs.png",
  twochat: "/brand-img/twochat.png",
  wix: "/brand-img/wix.svg",
};

/**
 * Canonical user-facing display names for every plugin.
 *
 * This is the single source of truth for the label shown in the action
 * selector, integration catalog and credential picker. It must be:
 *   - user friendly (proper brand casing/spacing, e.g. "ActiveCampaign",
 *     "Hugging Face", "Zoho Mail")
 *   - unique across plugins (a duplicated label collapses two integrations
 *     into one in the UI and produces duplicate React list keys)
 *
 * Keys are the plugin id from `plugins.ts`. `titleCase(id)` remains the
 * fallback for any newly added plugin that is not listed here yet.
 */
export const PLUGIN_DISPLAY_NAMES: Record<string, string> = {
  // --- AI / LLM ---
  aimlapi: "AIMLAPI",
  anthropicadministrator: "Anthropic",
  apipie: "APIpie",
  asticaai: "Astica AI",
  bigml: "BigML",
  deepseek: "DeepSeek",
  diffbot: "Diffbot",
  gemini: "Gemini",
  groqcloud: "Groq Cloud",
  huggingface: "Hugging Face",
  jigsawstack: "JigsawStack",
  ollama: "Ollama",
  openai: "OpenAI",
  openrouter: "OpenRouter",
  perplexityai: "Perplexity",
  studiobyai21labs: "Studio by AI21 Labs",
  tavily: "Tavily",
  tavilymcp: "Tavily MCP",
  textrazor: "TextRazor",
  tisane: "Tisane",
  witai: "Wit.ai",
  // --- Google ---
  gmail: "Gmail",
  googleaddressvalidation: "Google Address Validation",
  googleanalytics: "Google Analytics",
  googlebigquery: "Google BigQuery",
  googlecalendar: "Google Calendar",
  googlecloudvision: "Google Cloud Vision",
  googledocs: "Google Docs",
  googledrive: "Google Drive",
  googlemaps: "Google Maps",
  googlemeet: "Google Meet",
  googlesheets: "Google Sheets",
  youtube: "YouTube",
  // --- Microsoft ---
  outlook: "Outlook",
  teams: "Microsoft Teams",
  onedrive: "OneDrive",
  sharepoint: "SharePoint",
  // --- Productivity / project management / CRM ---
  activecampaign: "ActiveCampaign",
  airtable: "Airtable",
  asana: "Asana",
  attio: "Attio",
  basecamp: "Basecamp",
  cal: "Cal.com",
  calendly: "Calendly",
  capsulecrm: "Capsule CRM",
  clickhouse: "ClickHouse",
  clockify: "Clockify",
  confluence: "Confluence",
  connecteam: "Connecteam",
  contentfulgraphql: "Contentful",
  habitica: "Habitica",
  hubspot: "HubSpot",
  jira: "Jira",
  kaggle: "Kaggle",
  linear: "Linear",
  mailchimp: "Mailchimp",
  monday: "monday.com",
  notion: "Notion",
  pagerduty: "PagerDuty",
  salesforce: "Salesforce",
  streamtime: "Streamtime",
  tally: "Tally",
  ticktick: "TickTick",
  timecamp: "TimeCamp",
  todoist: "Todoist",
  toggl: "Toggl",
  trello: "Trello",
  typeform: "Typeform",
  workday: "Workday",
  workiom: "Workiom",
  zendesk: "Zendesk",
  // --- Marketing / email / communications ---
  benchmarkemail: "Benchmark Email",
  bigmailer: "BigMailer",
  brevo: "Brevo",
  chatfai: "ChatFAI",
  discord: "Discord",
  emelia: "Emelia",
  fireflies: "Fireflies",
  imgbb: "ImgBB",
  insightoai: "Insighto.ai",
  intercom: "Intercom",
  mailboxlayer: "Mailboxlayer",
  mailtrap: "Mailtrap",
  resend: "Resend",
  sendgrid: "SendGrid",
  slack: "Slack",
  telegram: "Telegram",
  twilio: "Twilio",
  whatsapp: "WhatsApp",
  // --- Social ---
  bluesky: "Bluesky",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  spotify: "Spotify",
  strava: "Strava",
  twitter: "Twitter",
  twitterapiio: "TwitterAPI.io",
  xquik: "Xquik",
  // --- Dev / code hosting / infra ---
  bitbucket: "Bitbucket",
  buildkite: "Buildkite",
  circleci: "CircleCI",
  cloudflare: "Cloudflare",
  cursor: "Cursor",
  databricks: "Databricks",
  datadog: "Datadog",
  datarobot: "DataRobot",
  digitalocean: "DigitalOcean",
  dockerhub: "Docker Hub",
  github: "GitHub",
  gitlab: "GitLab",
  grafana: "Grafana",
  kibana: "Kibana",
  neon: "Neon",
  nextdns: "NextDNS",
  posthog: "PostHog",
  runpod: "RunPod",
  sentry: "Sentry",
  sourcegraph: "Sourcegraph",
  supabase: "Supabase",
  vercel: "Vercel",
  wakatime: "WakaTime",
  // --- Storage / files / media ---
  box: "Box",
  boxhero: "BoxHero",
  bunnycdn: "Bunny CDN",
  canva: "Canva",
  canvas: "Canvas",
  cloudinary: "Cloudinary",
  dropbox: "Dropbox",
  dropboxsign: "Dropbox Sign",
  dynapictures: "DynaPictures",
  figma: "Figma",
  uploadcare: "Uploadcare",
  webflow: "Webflow",
  wix: "Wix",
  // --- Docs / e-sign / PDF ---
  api2pdf: "API2PDF",
  boldsign: "BoldSign",
  certifier: "Certifier",
  flexisign: "FlexiSign",
  htmltoimage: "HTML to Image",
  pdfmonkey: "PDFMonkey",
  // --- Data / enrichment / scraping ---
  abstract: "Abstract API",
  abuseipdb: "AbuseIPDB",
  affinda: "Affinda",
  ahrefs: "Ahrefs",
  algolia: "Algolia",
  alphavantage: "Alpha Vantage",
  ambee: "Ambee",
  apify: "Apify",
  apilabz: "ApiLabz",
  apininjas: "API Ninjas",
  apisports: "API-Sports",
  asindataapi: "ASIN Data API",
  bigdatacloud: "BigDataCloud",
  brandfetch: "Brandfetch",
  brightdata: "Bright Data",
  browseai: "Browse AI",
  browserless: "Browserless",
  browsertool: "BrowserTool",
  collegefootballdata: "College Football Data",
  countdownapi: "Countdown API",
  crowterminal: "Crow Terminal",
  dadataru: "Dadataru",
  exa: "Exa",
  faraday: "Faraday",
  firecrawl: "Firecrawl",
  hackernews: "Hacker News",
  here: "HERE",
  marketstack: "Marketstack",
  merriamwebsterdict: "Merriam-Webster",
  parseur: "Parseur",
  pinecone: "Pinecone",
  scrapegraphai: "ScrapeGraphAI",
  securitytrails: "SecurityTrails",
  serpapi: "SerpApi",
  uniswapapi: "Uniswap",
  worldnewsapi: "World News API",
  // --- Finance / payments ---
  brex: "Brex",
  dodopayments: "Dodo Payments",
  razorpay: "Razorpay",
  stripe: "Stripe",
  twentyonerisk: "TwentyOneRisk",
  // --- Automation / workflow / misc SaaS ---
  ably: "Ably",
  abyssale: "Abyssale",
  accrediblecertificates: "Accredible",
  activetrail: "ActiveTrail",
  addresszen: "AddressZen",
  aeroleads: "AeroLeads",
  agencyzoom: "AgencyZoom",
  agentmail: "AgentMail",
  agentql: "AgentQL",
  agenty: "Agenty",
  agiled: "Agiled",
  agilitycms: "Agility CMS",
  aivoov: "AIvoov",
  alchemy: "Alchemy",
  allimagesai: "All Images AI",
  altoviz: "Altoviz",
  alttextai: "AltText.ai",
  amara: "Amara",
  ambientweather: "Ambient Weather",
  amcards: "AMcards",
  amplitude: "Amplitude",
  anchorbrowser: "Anchor Browser",
  anonyflow: "AnonyFlow",
  apaleo: "Apaleo",
  apibible: "API.Bible",
  appointo: "Appointo",
  ascora: "Ascora",
  ashby: "Ashby",
  asyncinterview: "Async Interview",
  autom: "Autom",
  ayrshare: "Ayrshare",
  backendless: "Backendless",
  bannerbear: "Bannerbear",
  bart: "Bart",
  baselinker: "BaseLinker",
  basin: "Basin",
  beaconstac: "Beaconstac",
  beeminder: "Beeminder",
  bestbuy: "Best Buy",
  bettercontact: "BetterContact",
  betterproposals: "BetterProposals",
  betterstack: "Better Stack",
  bitwarden: "Bitwarden",
  blazemeter: "BlazeMeter",
  blocknative: "Blocknative",
  boloforms: "BoloForms",
  boltiot: "Bolt IoT",
  bonsai: "Bonsai",
  bookingmood: "Bookingmood",
  borneo: "Borneo",
  botbaba: "Botbaba",
  botpress: "Botpress",
  botsonic: "Botsonic",
  bouncer: "Bouncer",
  breathehr: "Breathe HR",
  bubble: "Bubble",
  bugsnag: "BugSnag",
  campayn: "Campayn",
  castingwords: "CastingWords",
  cdrplatform: "CDR Platform",
  chatbotkit: "ChatbotKit",
  chmeetings: "ChMeetings",
  clientary: "Clientary",
  contextsevenmcp: "Context7",
  convoloai: "Convolo AI",
  customgpt: "CustomGPT",
  devinmcp: "Devin",
  doppler: "Doppler",
  dreamstudio: "DreamStudio",
  dripcel: "Dripcel",
  epicgames: "Epic Games",
  exist: "Exist",
  filloutforms: "Fillout",
  formbricks: "Formbricks",
  gladia: "Gladia",
  griptape: "Griptape",
  harvest: "Harvest",
  hashnode: "Hashnode",
  heygen: "HeyGen",
  loyverse: "Loyverse",
  ocrspace: "OCR.space",
  ocrwebservice: "OCR Web Service",
  onepassword: "1Password",
  openweathermap: "OpenWeather",
  oura: "Oura",
  removebg: "remove.bg",
  retailed: "Retailed",
  scaleai: "Scale AI",
  sapsuccessfactors: "SAP SuccessFactors",
  synthflowai: "Synthflow AI",
  timelink: "Timelink",
  tinyurl: "TinyURL",
  twochat: "TwoChat",
  unione: "UniOne",
  vapi: "Vapi",
  veriphone: "Veriphone",
  vestaboard: "Vestaboard",
  webvizio: "Webvizio",
  wiza: "Wiza",
  youcom: "You.com",
  zohoinventory: "Zoho Inventory",
  zohomail: "Zoho Mail",
  zoominfo: "ZoomInfo",
  zoom: "Zoom",
};

/** Title-case a plugin id, e.g. "openweathermap" → "Openweathermap". */
function titleCase(id: string): string {
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
  oauthConfig?: PluginOAuthConfig;
  options?: { authType?: string };
  endpointMeta?: Record<string, { description?: string }>;
  authConfig?: Record<string, { account?: unknown }>;
};

function normalizeAccountFields(account: unknown): string[] {
  if (!Array.isArray(account)) return [];
  return account.filter((field): field is string => typeof field === "string");
}

function normalizeAuthModes(authConfig: RawPlugin["authConfig"]): PluginAuthMode[] {
  return Object.entries(authConfig ?? {}).map(([mode, config]) => ({
    mode,
    accountFields: normalizeAccountFields(config?.account),
  }));
}

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
  const providerName = PLUGIN_DISPLAY_NAMES[id]
    ?? raw.oauthConfig?.providerName
    ?? titleCase(id);
  const pkgDescription = readPackageDescription(id);
  const description =
    pkgDescription && pkgDescription.trim().length > 0
      ? pkgDescription
      : `Work with ${providerName} services via Corsair.`;

  const actionDescriptions: Record<string, string> = {};
  for (const [action, meta] of Object.entries(raw.endpointMeta ?? {})) {
    if (meta?.description) actionDescriptions[action] = meta.description;
  }

  const authModes = normalizeAuthModes(raw.authConfig);
  if (authModes.length === 0 && raw.options?.authType) {
    authModes.push({ mode: raw.options.authType, accountFields: [] });
  }
  const authType = authModes.some(({ mode }) => mode === "oauth_2")
    ? "oauth_2"
    : authModes[0]?.mode ?? "none";

  return {
    id,
    providerName,
    vaultType: getVaultType(id),
    description,
    img: iconMap[id] ?? "/function.png",
    authType,
    authModes,
    oauthConfig: raw.oauthConfig,
    actionDescriptions,
    nodeFieldMapping: getNodeFieldMapping(id),
  };
}

/** Normalize an array of plugin objects. */
export function toPluginMetadataList(
  plugins: readonly unknown[],
  iconMap: Record<string, string> = DEFAULT_ICON_MAP,
): PluginMetadata[] {
  return plugins.map((p) => toPluginMetadata(p, iconMap));
}
