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
import { agiled } from "@corsair-dev/agiled";
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
import { appointo } from "@corsair-dev/appointo";
import { asana } from "@corsair-dev/asana";
import { ascora } from "@corsair-dev/ascora";
import { ashby } from "@corsair-dev/ashby";
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
import { benchmarkemail } from "@corsair-dev/benchmarkemail";
import { bestbuy } from "@corsair-dev/bestbuy";
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
import { boldsign } from "@corsair-dev/boldsign";
import { boloforms } from "@corsair-dev/boloforms";
import { boltiot } from "@corsair-dev/boltiot";
import { bonsai } from "@corsair-dev/bonsai";
import { bookingmood } from "@corsair-dev/bookingmood";
import { borneo } from "@corsair-dev/borneo";
import { botbaba } from "@corsair-dev/botbaba";
import { botpress } from "@corsair-dev/botpress";
import { botsonic } from "@corsair-dev/botsonic";
import { bouncer } from "@corsair-dev/bouncer";
import { box } from "@corsair-dev/box";
import { boxhero } from "@corsair-dev/boxhero";
import { brandfetch } from "@corsair-dev/brandfetch";
import { breathehr } from "@corsair-dev/breathehr";
import { brevo } from "@corsair-dev/brevo";
import { brex } from "@corsair-dev/brex";
import { brightdata } from "@corsair-dev/brightdata";
import { browseai } from "@corsair-dev/browseai";
import { browserless } from "@corsair-dev/browserless";
import { browsertool } from "@corsair-dev/browsertool";
import { bubble } from "@corsair-dev/bubble";
import { bugsnag } from "@corsair-dev/bugsnag";
import { buildkite } from "@corsair-dev/buildkite";
import { bunnycdn } from "@corsair-dev/bunnycdn";
import { cal } from "@corsair-dev/cal";
import { calendly } from "@corsair-dev/calendly";
import { campayn } from "@corsair-dev/campayn";
import { canva } from "@corsair-dev/canva";
import { canvas } from "@corsair-dev/canvas";
import { capsulecrm } from "@corsair-dev/capsulecrm";
import { castingwords } from "@corsair-dev/castingwords";
import { cdrplatform } from "@corsair-dev/cdrplatform";
import { certifier } from "@corsair-dev/certifier";
import { chatbotkit } from "@corsair-dev/chatbotkit";
import { chatfai } from "@corsair-dev/chatfai";
import { chmeetings } from "@corsair-dev/chmeetings";
import { circleci } from "@corsair-dev/circleci";
import { clickhouse } from "@corsair-dev/clickhouse";
import { clientary } from "@corsair-dev/clientary";
import { clockify } from "@corsair-dev/clockify";
import { cloudflare } from "@corsair-dev/cloudflare";
import { cloudinary } from "@corsair-dev/cloudinary";
import { collegefootballdata } from "@corsair-dev/collegefootballdata";
import { confluence } from "@corsair-dev/confluence";
import { connecteam } from "@corsair-dev/connecteam";
import { contentfulgraphql } from "@corsair-dev/contentfulgraphql";
import { contextsevenmcp } from "@corsair-dev/contextsevenmcp";
import { convoloai } from "@corsair-dev/convoloai";
import { countdownapi } from "@corsair-dev/countdownapi";
import { crowterminal } from "@corsair-dev/crowterminal";
import { cursor } from "@corsair-dev/cursor";
import { customgpt } from "@corsair-dev/customgpt";
import { dadataru } from "@corsair-dev/dadataru";
import { databricks } from "@corsair-dev/databricks";
import { datadog } from "@corsair-dev/datadog";
import { datarobot } from "@corsair-dev/datarobot";
import { deepseek } from "@corsair-dev/deepseek";
import { devinmcp } from "@corsair-dev/devinmcp";
import { diffbot } from "@corsair-dev/diffbot";
import { digitalocean } from "@corsair-dev/digitalocean";
import { discord } from "@corsair-dev/discord";
import { dockerhub } from "@corsair-dev/dockerhub";
import { dodopayments } from "@corsair-dev/dodopayments";
import { doppler } from "@corsair-dev/doppler";
import { dreamstudio } from "@corsair-dev/dreamstudio";
import { dripcel } from "@corsair-dev/dripcel";
import { dropbox } from "@corsair-dev/dropbox";
import { dropboxsign } from "@corsair-dev/dropboxsign";
import { dynapictures } from "@corsair-dev/dynapictures";
import { emelia } from "@corsair-dev/emelia";
import { epicgames } from "@corsair-dev/epicgames";
import { exa } from "@corsair-dev/exa";
import { exist } from "@corsair-dev/exist";
import { facebook } from "@corsair-dev/facebook";
import { faraday } from "@corsair-dev/faraday";
import { figma } from "@corsair-dev/figma";
import { filloutforms } from "@corsair-dev/filloutforms";
import { firecrawl } from "@corsair-dev/firecrawl";
import { fireflies } from "@corsair-dev/fireflies";
import { flexisign } from "@corsair-dev/flexisign";
import { formbricks } from "@corsair-dev/formbricks";
import { gemini } from "@corsair-dev/gemini";
import { github } from "@corsair-dev/github";
import { gitlab } from "@corsair-dev/gitlab";
import { gladia } from "@corsair-dev/gladia";
import { gmail } from "@corsair-dev/gmail";
import { googleaddressvalidation } from "@corsair-dev/googleaddressvalidation";
import { googleanalytics } from "@corsair-dev/googleanalytics";
import { googlebigquery } from "@corsair-dev/googlebigquery";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { googlecloudvision } from "@corsair-dev/googlecloudvision";
import { googledocs } from "@corsair-dev/googledocs";
import { googledrive } from "@corsair-dev/googledrive";
import { googlemaps } from "@corsair-dev/googlemaps";
import { googlemeet } from "@corsair-dev/googlemeet";
import { googlesheets } from "@corsair-dev/googlesheets";
import { grafana } from "@corsair-dev/grafana";
import { griptape } from "@corsair-dev/griptape";
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
import { kibana } from "@corsair-dev/kibana";
import { linear } from "@corsair-dev/linear";
import { linkedin } from "@corsair-dev/linkedin";
import { loyverse } from "@corsair-dev/loyverse";
import { mailboxlayer } from "@corsair-dev/mailboxlayer";
import { mailchimp } from "@corsair-dev/mailchimp";
import { mailtrap } from "@corsair-dev/mailtrap";
import { marketstack } from "@corsair-dev/marketstack";
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
import { parseur } from "@corsair-dev/parseur";
import { pdfmonkey } from "@corsair-dev/pdfmonkey";
import { perplexityai } from "@corsair-dev/perplexityai";
import { pinecone } from "@corsair-dev/pinecone";
import { posthog } from "@corsair-dev/posthog";
import { razorpay } from "@corsair-dev/razorpay";
import { reddit } from "@corsair-dev/reddit";
import { removebg } from "@corsair-dev/removebg";
import { resend } from "@corsair-dev/resend";
import { retailed } from "@corsair-dev/retailed";
import { runpod } from "@corsair-dev/runpod";
import { salesforce } from "@corsair-dev/salesforce";
import { sapsuccessfactors } from "@corsair-dev/sapsuccessfactors";
import { scaleai } from "@corsair-dev/scaleai";
import { scrapegraphai } from "@corsair-dev/scrapegraphai";
import { securitytrails } from "@corsair-dev/securitytrails";
import { sendgrid } from "@corsair-dev/sendgrid";
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
import { timelink } from "@corsair-dev/timelink";
import { tinyurl } from "@corsair-dev/tinyurl";
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
import { uploadcare } from "@corsair-dev/uploadcare";
import { vapi } from "@corsair-dev/vapi";
import { vercel } from "@corsair-dev/vercel";
import { veriphone } from "@corsair-dev/veriphone";
import { vestaboard } from "@corsair-dev/vestaboard";
import { wakatime } from "@corsair-dev/wakatime";
import { webflow } from "@corsair-dev/webflow";
import { webvizio } from "@corsair-dev/webvizio";
import { whatsapp } from "@corsair-dev/whatsapp";
import { witai } from "@corsair-dev/witai";
import { wix } from "@corsair-dev/wix";
import { wiza } from "@corsair-dev/wiza";
import { workday } from "@corsair-dev/workday";
import { workiom } from "@corsair-dev/workiom";
import { worldnewsapi } from "@corsair-dev/worldnewsapi";
import { xquik } from "@corsair-dev/xquik";
import { youcom } from "@corsair-dev/youcom";
import { youtube } from "@corsair-dev/youtube";
import { zendesk } from "@corsair-dev/zendesk";
import { zohoinventory } from "@corsair-dev/zohoinventory";
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
  agiled(),
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
  appointo(),
  asana(),
  ascora(),
  ashby(),
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
  benchmarkemail(),
  bestbuy(),
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
  boldsign(),
  boloforms(),
  boltiot(),
  bonsai(),
  bookingmood(),
  borneo(),
  botbaba(),
  botpress(),
  botsonic(),
  bouncer(),
  box(),
  boxhero(),
  brandfetch(),
  breathehr(),
  brevo(),
  brex(),
  brightdata(),
  browseai(),
  browserless(),
  browsertool(),
  bubble(),
  bugsnag(),
  buildkite(),
  bunnycdn(),
  cal(),
  calendly(),
  campayn(),
  canva(),
  canvas(),
  capsulecrm(),
  castingwords(),
  cdrplatform(),
  certifier(),
  chatbotkit(),
  chatfai(),
  chmeetings(),
  circleci(),
  clickhouse(),
  clientary(),
  clockify(),
  cloudflare(),
  cloudinary(),
  collegefootballdata(),
  confluence(),
  connecteam(),
  contentfulgraphql(),
  contextsevenmcp(),
  convoloai(),
  countdownapi(),
  crowterminal(),
  cursor(),
  customgpt(),
  dadataru(),
  databricks(),
  datadog(),
  datarobot(),
  deepseek(),
  devinmcp(),
  diffbot(),
  digitalocean(),
  discord(),
  dockerhub(),
  dodopayments(),
  doppler(),
  dreamstudio(),
  dripcel(),
  dropbox(),
  dropboxsign(),
  dynapictures(),
  emelia(),
  epicgames(),
  exa(),
  exist(),
  facebook(),
  faraday(),
  figma(),
  filloutforms(),
  firecrawl(),
  fireflies(),
  flexisign(),
  formbricks(),
  gemini(),
  github(),
  gitlab(),
  gladia(),
  gmail(),
  googleaddressvalidation(),
  googleanalytics(),
  googlebigquery(),
  googlecalendar(),
  googlecloudvision(),
  googledocs(),
  googledrive(),
  googlemaps(),
  googlemeet(),
  googlesheets(),
  grafana(),
  griptape(),
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
  kibana(),
  linear(),
  linkedin(),
  loyverse(),
  mailboxlayer(),
  mailchimp(),
  mailtrap(),
  marketstack(),
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
  parseur(),
  pdfmonkey(),
  perplexityai(),
  pinecone(),
  posthog(),
  razorpay(),
  reddit(),
  removebg(),
  resend(),
  retailed(),
  runpod(),
  salesforce(),
  sapsuccessfactors(),
  scaleai(),
  scrapegraphai(),
  securitytrails(),
  sendgrid(),
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
  timelink(),
  tinyurl(),
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
  uploadcare(),
  vapi(),
  vercel(),
  veriphone(),
  vestaboard(),
  wakatime(),
  webflow(),
  webvizio(),
  whatsapp(),
  witai(),
  wix(),
  wiza(),
  // workday requires tenant/host at construction time; use placeholders that
  // are overridden per-tenant at runtime via the integration key manager.
  workday({ tenant: "placeholder", host: "placeholder.workday.com" }),
  workiom(),
  worldnewsapi(),
  xquik(),
  youcom(),
  youtube(),
  zendesk(),
  zohoinventory(),
  zohomail(),
  zoom(),
  zoominfo(),
] as const;
