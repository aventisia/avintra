import { getCorsairPluginIcon } from "../../vault-table/vault-config/constants/corsair-integration-mapper";

/**
 * Maps tool names/ids to their brand icons from corsair DCP generator.
 * These icons are available in the studio public/brand-img folder.
 * Returns undefined when a specific icon is not found, so callers fall back to
 * the shared Wrench glyph used by the studio canvas node.
 */
export const toolIconMapper: Record<string, string> = {
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
  addresszen: "/brand-img/addresszen.svg",
  alttextai: "/brand-img/alttextai.svg",
  apify: "/brand-img/apify.svg",
  ayrshare: "/brand-img/ayrshare.svg",
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

  // Fallback
  default: "/brand-img/default-provider.svg",
};

/**
 * Get the icon path for a tool by name or id.
 * Returns the mapped brand icon, or `undefined` when no specific icon is found
 * so callers can fall back to the shared Wrench glyph (the studio node default)
 * instead of a placeholder image.
 */
export const getToolIcon = (toolName?: string): string | undefined => {
  if (!toolName) return undefined;
  const lowerName = toolName.toLowerCase();
  const shortName = lowerName.replace(/^corsair\s+/, "");

  return toolIconMapper[shortName] || getCorsairPluginIcon(shortName) || undefined;
};
