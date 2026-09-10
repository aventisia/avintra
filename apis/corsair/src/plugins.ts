/**
 * Central registry of every open-source Corsair integration plugin.
 *
 * This is the single source of truth for the sidecar's plugin set. It is
 * consumed by:
 *   - src/corsair.ts        (runtime registration + provisioning)
 *   - src/generate-corsair-configs.ts (generates Corsair action configs, mappings, and OpenAPI specs)
 *   - src/dcp-generator/generator.test.ts (DCP generator validation)
 *
 * Each plugin package (@corsair-dev/<id>) exports a factory function named
 * after the package (e.g. `github`, `openai`, `gmail`). We import them all and
 * instantiate them into the `plugins` array.
 *
 * NOTE: This file is generated from the authoritative package list in the
 * corsairdev/corsair monorepo (packages/ directory). To add/remove a plugin,
 * edit the imports below and the `plugins` array, then run `npm install`.
 */
// Polyfill Node < 20 globals (File/Blob) before any plugin module is loaded.
// Some plugins reference `File` at module-load time; the server runs Node 18.
import "./polyfills.js";
import { ably } from "@corsair-dev/ably";
import { abstract } from "@corsair-dev/abstract";
import { abuseipdb } from "@corsair-dev/abuseipdb";
import { abyssale } from "@corsair-dev/abyssale";
import { accrediblecertificates } from "@corsair-dev/accrediblecertificates";
import { activecampaign } from "@corsair-dev/activecampaign";
import { activetrail } from "@corsair-dev/activetrail";
import { addresszen } from "@corsair-dev/addresszen";
import { aeroleads } from "@corsair-dev/aeroleads";
import { affinda } from "@corsair-dev/affinda";
import { agencyzoom } from "@corsair-dev/agencyzoom";
import { agentmail } from "@corsair-dev/agentmail";
import { agentql } from "@corsair-dev/agentql";
import { agenty } from "@corsair-dev/agenty";
import { agilitycms } from "@corsair-dev/agilitycms";
import { ahrefs } from "@corsair-dev/ahrefs";
import { aimlapi } from "@corsair-dev/aimlapi";
import { airtable } from "@corsair-dev/airtable";
import { aivoov } from "@corsair-dev/aivoov";
import { alchemy } from "@corsair-dev/alchemy";
import { algolia } from "@corsair-dev/algolia";
import { allimagesai } from "@corsair-dev/allimagesai";
import { alphavantage } from "@corsair-dev/alphavantage";
import { altoviz } from "@corsair-dev/altoviz";
import { alttextai } from "@corsair-dev/alttextai";
import { amara } from "@corsair-dev/amara";
import { ambee } from "@corsair-dev/ambee";
import { ambientweather } from "@corsair-dev/ambientweather";
import { amcards } from "@corsair-dev/amcards";
import { amplitude } from "@corsair-dev/amplitude";
import { anchorbrowser } from "@corsair-dev/anchorbrowser";
import { anonyflow } from "@corsair-dev/anonyflow";
import { anthropicadministrator } from "@corsair-dev/anthropicadministrator";
import { apaleo } from "@corsair-dev/apaleo";
import { api2pdf } from "@corsair-dev/api2pdf";
import { apibible } from "@corsair-dev/apibible";
import { apify } from "@corsair-dev/apify";
import { apilabz } from "@corsair-dev/apilabz";
import { apininjas } from "@corsair-dev/apininjas";
import { apipie } from "@corsair-dev/apipie";
import { apisports } from "@corsair-dev/apisports";
import { asana } from "@corsair-dev/asana";
import { asindataapi } from "@corsair-dev/asindataapi";
import { asticaai } from "@corsair-dev/asticaai";
import { asyncinterview } from "@corsair-dev/asyncinterview";
import { attio } from "@corsair-dev/attio";
import { autom } from "@corsair-dev/autom";
import { ayrshare } from "@corsair-dev/ayrshare";
import { backendless } from "@corsair-dev/backendless";
import { bannerbear } from "@corsair-dev/bannerbear";
import { bart } from "@corsair-dev/bart";
import { basecamp } from "@corsair-dev/basecamp";
import { baselinker } from "@corsair-dev/baselinker";
import { basin } from "@corsair-dev/basin";
import { beaconstac } from "@corsair-dev/beaconstac";
import { beeminder } from "@corsair-dev/beeminder";
import { bettercontact } from "@corsair-dev/bettercontact";
import { betterproposals } from "@corsair-dev/betterproposals";
import { betterstack } from "@corsair-dev/betterstack";
import { bigdatacloud } from "@corsair-dev/bigdatacloud";
import { bigmailer } from "@corsair-dev/bigmailer";
import { bigml } from "@corsair-dev/bigml";
import { bitbucket } from "@corsair-dev/bitbucket";
import { bitwarden } from "@corsair-dev/bitwarden";
import { blazemeter } from "@corsair-dev/blazemeter";
import { blocknative } from "@corsair-dev/blocknative";
import { bluesky } from "@corsair-dev/bluesky";
import { boloforms } from "@corsair-dev/boloforms";
import { boltiot } from "@corsair-dev/boltiot";
import { bonsai } from "@corsair-dev/bonsai";
import { bookingmood } from "@corsair-dev/bookingmood";
import { botpress } from "@corsair-dev/botpress";
import { botsonic } from "@corsair-dev/botsonic";
import { bouncer } from "@corsair-dev/bouncer";
import { box } from "@corsair-dev/box";
import { boxhero } from "@corsair-dev/boxhero";
import { brandfetch } from "@corsair-dev/brandfetch";
import { brex } from "@corsair-dev/brex";
import { browseai } from "@corsair-dev/browseai";
import { browserless } from "@corsair-dev/browserless";
import { bugsnag } from "@corsair-dev/bugsnag";
import { cal } from "@corsair-dev/cal";
import { calendly } from "@corsair-dev/calendly";
import { canva } from "@corsair-dev/canva";
import { canvas } from "@corsair-dev/canvas";
import { chatbotkit } from "@corsair-dev/chatbotkit";
import { circleci } from "@corsair-dev/circleci";
import { clickhouse } from "@corsair-dev/clickhouse";
import { clientary } from "@corsair-dev/clientary";
import { clockify } from "@corsair-dev/clockify";
import { cloudflare } from "@corsair-dev/cloudflare";
import { cloudinary } from "@corsair-dev/cloudinary";
import { collegefootballdata } from "@corsair-dev/collegefootballdata";
import { confluence } from "@corsair-dev/confluence";
import { contentfulgraphql } from "@corsair-dev/contentfulgraphql";
import { contextsevenmcp } from "@corsair-dev/contextsevenmcp";
import { crowterminal } from "@corsair-dev/crowterminal";
import { cursor } from "@corsair-dev/cursor";
import { customgpt } from "@corsair-dev/customgpt";
import { databricks } from "@corsair-dev/databricks";
import { datadog } from "@corsair-dev/datadog";
import { deepseek } from "@corsair-dev/deepseek";
import { devinmcp } from "@corsair-dev/devinmcp";
import { diffbot } from "@corsair-dev/diffbot";
import { digitalocean } from "@corsair-dev/digitalocean";
import { discord } from "@corsair-dev/discord";
import { dockerhub } from "@corsair-dev/dockerhub";
import { dodopayments } from "@corsair-dev/dodopayments";
import { doppler } from "@corsair-dev/doppler";
import { dreamstudio } from "@corsair-dev/dreamstudio";
import { dropbox } from "@corsair-dev/dropbox";
import { dropboxsign } from "@corsair-dev/dropboxsign";
import { epicgames } from "@corsair-dev/epicgames";
import { exa } from "@corsair-dev/exa";
import { facebook } from "@corsair-dev/facebook";
import { faraday } from "@corsair-dev/faraday";
import { figma } from "@corsair-dev/figma";
import { firecrawl } from "@corsair-dev/firecrawl";
import { fireflies } from "@corsair-dev/fireflies";
import { formbricks } from "@corsair-dev/formbricks";
import { gemini } from "@corsair-dev/gemini";
import { github } from "@corsair-dev/github";
import { gitlab } from "@corsair-dev/gitlab";
import { gmail } from "@corsair-dev/gmail";
import { googleaddressvalidation } from "@corsair-dev/googleaddressvalidation";
import { googlebigquery } from "@corsair-dev/googlebigquery";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { googlecloudvision } from "@corsair-dev/googlecloudvision";
import { googledocs } from "@corsair-dev/googledocs";
import { googledrive } from "@corsair-dev/googledrive";
import { googlemaps } from "@corsair-dev/googlemaps";
import { googlemeet } from "@corsair-dev/googlemeet";
import { googlesheets } from "@corsair-dev/googlesheets";
import { grafana } from "@corsair-dev/grafana";
import { groqcloud } from "@corsair-dev/groqcloud";
import { habitica } from "@corsair-dev/habitica";
import { hackernews } from "@corsair-dev/hackernews";
import { harvest } from "@corsair-dev/harvest";
import { hashnode } from "@corsair-dev/hashnode";
import { here } from "@corsair-dev/here";
import { heygen } from "@corsair-dev/heygen";
import { htmltoimage } from "@corsair-dev/htmltoimage";
import { hubspot } from "@corsair-dev/hubspot";
import { huggingface } from "@corsair-dev/huggingface";
import { imgbb } from "@corsair-dev/imgbb";
import { insightoai } from "@corsair-dev/insightoai";
import { instagram } from "@corsair-dev/instagram";
import { intercom } from "@corsair-dev/intercom";
import { jigsawstack } from "@corsair-dev/jigsawstack";
import { jira } from "@corsair-dev/jira";
import { kaggle } from "@corsair-dev/kaggle";
import { linear } from "@corsair-dev/linear";
import { linkedin } from "@corsair-dev/linkedin";
import { loyverse } from "@corsair-dev/loyverse";
import { mailboxlayer } from "@corsair-dev/mailboxlayer";
import { mailchimp } from "@corsair-dev/mailchimp";
import { mailtrap } from "@corsair-dev/mailtrap";
import { merriamwebsterdict } from "@corsair-dev/merriamwebsterdict";
import { monday } from "@corsair-dev/monday";
import { neon } from "@corsair-dev/neon";
import { nextdns } from "@corsair-dev/nextdns";
import { notion } from "@corsair-dev/notion";
import { ocrspace } from "@corsair-dev/ocrspace";
import { ocrwebservice } from "@corsair-dev/ocrwebservice";
import { ollama } from "@corsair-dev/ollama";
import { onedrive } from "@corsair-dev/onedrive";
import { onepassword } from "@corsair-dev/onepassword";
import { openai } from "@corsair-dev/openai";
import { openrouter } from "@corsair-dev/openrouter";
import { openweathermap } from "@corsair-dev/openweathermap";
import { oura } from "@corsair-dev/oura";
import { outlook } from "@corsair-dev/outlook";
import { pagerduty } from "@corsair-dev/pagerduty";
import { pdfmonkey } from "@corsair-dev/pdfmonkey";
import { perplexityai } from "@corsair-dev/perplexityai";
import { pinecone } from "@corsair-dev/pinecone";
import { posthog } from "@corsair-dev/posthog";
import { razorpay } from "@corsair-dev/razorpay";
import { reddit } from "@corsair-dev/reddit";
import { resend } from "@corsair-dev/resend";
import { retailed } from "@corsair-dev/retailed";
import { salesforce } from "@corsair-dev/salesforce";
import { securitytrails } from "@corsair-dev/securitytrails";
import { sentry } from "@corsair-dev/sentry";
import { serpapi } from "@corsair-dev/serpapi";
import { sharepoint } from "@corsair-dev/sharepoint";
import { slack } from "@corsair-dev/slack";
import { sourcegraph } from "@corsair-dev/sourcegraph";
import { spotify } from "@corsair-dev/spotify";
import { strava } from "@corsair-dev/strava";
import { streamtime } from "@corsair-dev/streamtime";
import { stripe } from "@corsair-dev/stripe";
import { studiobyai21labs } from "@corsair-dev/studiobyai21labs";
import { supabase } from "@corsair-dev/supabase";
import { synthflowai } from "@corsair-dev/synthflowai";
import { tally } from "@corsair-dev/tally";
import { tavily } from "@corsair-dev/tavily";
import { tavilymcp } from "@corsair-dev/tavilymcp";
import { teams } from "@corsair-dev/teams";
import { telegram } from "@corsair-dev/telegram";
import { textrazor } from "@corsair-dev/textrazor";
import { ticktick } from "@corsair-dev/ticktick";
import { timecamp } from "@corsair-dev/timecamp";
import { tisane } from "@corsair-dev/tisane";
import { todoist } from "@corsair-dev/todoist";
import { toggl } from "@corsair-dev/toggl";
import { trello } from "@corsair-dev/trello";
import { twentyonerisk } from "@corsair-dev/twentyonerisk";
import { twilio } from "@corsair-dev/twilio";
import { twitter } from "@corsair-dev/twitter";
import { twitterapiio } from "@corsair-dev/twitterapiio";
import { twochat } from "@corsair-dev/twochat";
import { typeform } from "@corsair-dev/typeform";
import { unione } from "@corsair-dev/unione";
import { uniswapapi } from "@corsair-dev/uniswapapi";
import { vapi } from "@corsair-dev/vapi";
import { vercel } from "@corsair-dev/vercel";
import { vestaboard } from "@corsair-dev/vestaboard";
import { wakatime } from "@corsair-dev/wakatime";
import { webflow } from "@corsair-dev/webflow";
import { webvizio } from "@corsair-dev/webvizio";
import { whatsapp } from "@corsair-dev/whatsapp";
import { witai } from "@corsair-dev/witai";
import { wiza } from "@corsair-dev/wiza";
import { workday } from "@corsair-dev/workday";
import { xquik } from "@corsair-dev/xquik";
import { youcom } from "@corsair-dev/youcom";
import { youtube } from "@corsair-dev/youtube";
import { zendesk } from "@corsair-dev/zendesk";
import { zohomail } from "@corsair-dev/zohomail";
import { zoom } from "@corsair-dev/zoom";
import { zoominfo } from "@corsair-dev/zoominfo";

/**
 * Every registered Corsair plugin, instantiated.
 * Order is alphabetical by package name for determinism.
 */
export const plugins = [
  ably(),
  abstract(),
  abuseipdb(),
  abyssale(),
  accrediblecertificates(),
  activecampaign(),
  activetrail(),
  addresszen(),
  aeroleads(),
  affinda(),
  agencyzoom(),
  agentmail(),
  agentql(),
  agenty(),
  agilitycms(),
  ahrefs(),
  aimlapi(),
  airtable(),
  aivoov(),
  alchemy(),
  algolia(),
  allimagesai(),
  alphavantage(),
  altoviz(),
  alttextai(),
  amara(),
  ambee(),
  ambientweather(),
  amcards(),
  amplitude(),
  anchorbrowser(),
  anonyflow(),
  anthropicadministrator(),
  apaleo(),
  api2pdf(),
  apibible(),
  apify(),
  apilabz(),
  apininjas(),
  apipie(),
  apisports(),
  asana(),
  asindataapi(),
  asticaai(),
  asyncinterview(),
  attio(),
  autom(),
  ayrshare(),
  backendless(),
  bannerbear(),
  bart(),
  basecamp(),
  baselinker(),
  basin(),
  beaconstac(),
  beeminder(),
  bettercontact(),
  betterproposals(),
  betterstack(),
  bigdatacloud(),
  bigmailer(),
  bigml(),
  bitbucket(),
  bitwarden(),
  blazemeter(),
  blocknative(),
  bluesky(),
  boloforms(),
  boltiot(),
  bonsai(),
  bookingmood(),
  botpress(),
  botsonic(),
  bouncer(),
  box(),
  boxhero(),
  brandfetch(),
  brex(),
  browseai(),
  browserless(),
  bugsnag(),
  cal(),
  calendly(),
  canva(),
  canvas(),
  chatbotkit(),
  circleci(),
  clickhouse(),
  clientary(),
  clockify(),
  cloudflare(),
  cloudinary(),
  collegefootballdata(),
  confluence(),
  contentfulgraphql(),
  contextsevenmcp(),
  crowterminal(),
  cursor(),
  customgpt(),
  databricks(),
  datadog(),
  deepseek(),
  devinmcp(),
  diffbot(),
  digitalocean(),
  discord(),
  dockerhub(),
  dodopayments(),
  doppler(),
  dreamstudio(),
  dropbox(),
  dropboxsign(),
  epicgames(),
  exa(),
  facebook(),
  faraday(),
  figma(),
  firecrawl(),
  fireflies(),
  formbricks(),
  gemini(),
  github(),
  gitlab(),
  gmail(),
  googleaddressvalidation(),
  googlebigquery(),
  googlecalendar(),
  googlecloudvision(),
  googledocs(),
  googledrive(),
  googlemaps(),
  googlemeet(),
  googlesheets(),
  grafana(),
  groqcloud(),
  habitica(),
  hackernews(),
  harvest(),
  hashnode(),
  here(),
  heygen(),
  htmltoimage(),
  hubspot(),
  huggingface(),
  imgbb(),
  insightoai(),
  instagram(),
  intercom(),
  jigsawstack(),
  jira(),
  kaggle(),
  linear(),
  linkedin(),
  loyverse(),
  mailboxlayer(),
  mailchimp(),
  mailtrap(),
  merriamwebsterdict(),
  monday(),
  neon(),
  nextdns(),
  notion(),
  ocrspace(),
  ocrwebservice(),
  ollama(),
  onedrive(),
  onepassword(),
  openai(),
  openrouter(),
  openweathermap(),
  oura(),
  outlook(),
  pagerduty(),
  pdfmonkey(),
  perplexityai(),
  pinecone(),
  posthog(),
  razorpay(),
  reddit(),
  resend(),
  retailed(),
  salesforce(),
  securitytrails(),
  sentry(),
  serpapi(),
  sharepoint(),
  slack(),
  sourcegraph(),
  spotify(),
  strava(),
  streamtime(),
  stripe(),
  studiobyai21labs(),
  supabase(),
  synthflowai(),
  tally(),
  tavily(),
  tavilymcp(),
  teams(),
  telegram(),
  textrazor(),
  ticktick(),
  timecamp(),
  tisane(),
  todoist(),
  toggl(),
  trello(),
  twentyonerisk(),
  twilio(),
  twitter(),
  twitterapiio(),
  twochat(),
  typeform(),
  unione(),
  uniswapapi(),
  vapi(),
  vercel(),
  vestaboard(),
  wakatime(),
  webflow(),
  webvizio(),
  whatsapp(),
  witai(),
  wiza(),
  // workday requires tenant/host at construction time; use placeholders that
  // are overridden per-tenant at runtime via the integration key manager.
  workday({ tenant: "placeholder", host: "placeholder.workday.com" }),
  xquik(),
  youcom(),
  youtube(),
  zendesk(),
  zohomail(),
  zoom(),
  zoominfo(),
] as const;

/** Plugin ids (lowercase package names) for quick membership checks. */
export const PLUGIN_IDS: readonly string[] = plugins.map((p) => (p as any).id as string);
