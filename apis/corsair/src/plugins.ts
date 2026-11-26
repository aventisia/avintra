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
import { adyntel } from "@corsair-dev/adyntel";
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
import { akta } from "@corsair-dev/akta";
import { alchemy } from "@corsair-dev/alchemy";
import { algolia } from "@corsair-dev/algolia";
import { alibaba } from "@corsair-dev/alibaba";
import { allimagesai } from "@corsair-dev/allimagesai";
import { alphavantage } from "@corsair-dev/alphavantage";
import { altoviz } from "@corsair-dev/altoviz";
import { alttextai } from "@corsair-dev/alttextai";
import { amara } from "@corsair-dev/amara";
import { ambee } from "@corsair-dev/ambee";
import { ambientweather } from "@corsair-dev/ambientweather";
import { amcards } from "@corsair-dev/amcards";
import { amika } from "@corsair-dev/amika";
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
import { apollo } from "@corsair-dev/apollo";
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
import { beamer } from "@corsair-dev/beamer";
import { beeminder } from "@corsair-dev/beeminder";
import { benchmarkemail } from "@corsair-dev/benchmarkemail";
import { benzinga } from "@corsair-dev/benzinga";
import { bestbuy } from "@corsair-dev/bestbuy";
import { bettercontact } from "@corsair-dev/bettercontact";
import { betterproposals } from "@corsair-dev/betterproposals";
import { betterstack } from "@corsair-dev/betterstack";
import { bigdatacloud } from "@corsair-dev/bigdatacloud";
import { bigmailer } from "@corsair-dev/bigmailer";
import { bigml } from "@corsair-dev/bigml";
import { bigpictureio } from "@corsair-dev/bigpictureio";
import { bitbucket } from "@corsair-dev/bitbucket";
import { bitwarden } from "@corsair-dev/bitwarden";
import { blackbaud } from "@corsair-dev/blackbaud";
import { blazemeter } from "@corsair-dev/blazemeter";
import { blocknative } from "@corsair-dev/blocknative";
import { bluesky } from "@corsair-dev/bluesky";
import { boldsign } from "@corsair-dev/boldsign";
import { boloforms } from "@corsair-dev/boloforms";
import { boltiot } from "@corsair-dev/boltiot";
import { bonsai } from "@corsair-dev/bonsai";
import { bookingmood } from "@corsair-dev/bookingmood";
import { booqable } from "@corsair-dev/booqable";
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
import { browseruse } from "@corsair-dev/browseruse";
import { bubble } from "@corsair-dev/bubble";
import { bugsnag } from "@corsair-dev/bugsnag";
import { buildkite } from "@corsair-dev/buildkite";
import { builtwith } from "@corsair-dev/builtwith";
import { bunnycdn } from "@corsair-dev/bunnycdn";
import { bytedance } from "@corsair-dev/bytedance";
import { byteforms } from "@corsair-dev/byteforms";
import { cal } from "@corsair-dev/cal";
import { calendly } from "@corsair-dev/calendly";
import { callingly } from "@corsair-dev/callingly";
import { callpage } from "@corsair-dev/callpage";
import { campaigncleaner } from "@corsair-dev/campaigncleaner";
import { campayn } from "@corsair-dev/campayn";
import { canny } from "@corsair-dev/canny";
import { canva } from "@corsair-dev/canva";
import { canvas } from "@corsair-dev/canvas";
import { capsulecrm } from "@corsair-dev/capsulecrm";
import { castingwords } from "@corsair-dev/castingwords";
import { cdrplatform } from "@corsair-dev/cdrplatform";
import { celigo } from "@corsair-dev/celigo";
import { certifier } from "@corsair-dev/certifier";
import { certspotter } from "@corsair-dev/certspotter";
import { chaser } from "@corsair-dev/chaser";
import { chatbotkit } from "@corsair-dev/chatbotkit";
import { chatfai } from "@corsair-dev/chatfai";
import { chatwork } from "@corsair-dev/chatwork";
import { chmeetings } from "@corsair-dev/chmeetings";
import { cincopa } from "@corsair-dev/cincopa";
import { circleci } from "@corsair-dev/circleci";
import { claidai } from "@corsair-dev/claidai";
import { classmarker } from "@corsair-dev/classmarker";
import { clay } from "@corsair-dev/clay";
import { clickhouse } from "@corsair-dev/clickhouse";
import { clickmeeting } from "@corsair-dev/clickmeeting";
import { clicksend } from "@corsair-dev/clicksend";
import { clickup } from "@corsair-dev/clickup";
import { clientary } from "@corsair-dev/clientary";
import { clockify } from "@corsair-dev/clockify";
import { cloro } from "@corsair-dev/cloro";
import { close } from "@corsair-dev/close";
import { cloudcart } from "@corsair-dev/cloudcart";
import { cloudconvert } from "@corsair-dev/cloudconvert";
import { cloudflare } from "@corsair-dev/cloudflare";
import { cloudflareapikey } from "@corsair-dev/cloudflareapikey";
import { cloudflarebrowserrendering } from "@corsair-dev/cloudflarebrowserrendering";
import { cloudinary } from "@corsair-dev/cloudinary";
import { coassemble } from "@corsair-dev/coassemble";
import { coda } from "@corsair-dev/coda";
import { codacy } from "@corsair-dev/codacy";
import { codeinterpreter } from "@corsair-dev/codeinterpreter";
import { codereadr } from "@corsair-dev/codereadr";
import { cody } from "@corsair-dev/cody";
import { coinbase } from "@corsair-dev/coinbase";
import { coinmarketcal } from "@corsair-dev/coinmarketcal";
import { coinmarketcap } from "@corsair-dev/coinmarketcap";
import { collegefootballdata } from "@corsair-dev/collegefootballdata";
import { commcare } from "@corsair-dev/commcare";
import { companyenrich } from "@corsair-dev/companyenrich";
import { composio } from "@corsair-dev/composio";
import { confluence } from "@corsair-dev/confluence";
import { connecteam } from "@corsair-dev/connecteam";
import { contactout } from "@corsair-dev/contactout";
import { contentfulgraphql } from "@corsair-dev/contentfulgraphql";
import { contextdev } from "@corsair-dev/contextdev";
import { contextsevenmcp } from "@corsair-dev/contextsevenmcp";
import { convex } from "@corsair-dev/convex";
import { convoloai } from "@corsair-dev/convoloai";
import { cosmic } from "@corsair-dev/cosmic";
import { countdownapi } from "@corsair-dev/countdownapi";
import { craftmypdf } from "@corsair-dev/craftmypdf";
import { crowterminal } from "@corsair-dev/crowterminal";
import { currencyscoop } from "@corsair-dev/currencyscoop";
import { currentsapi } from "@corsair-dev/currentsapi";
import { cursor } from "@corsair-dev/cursor";
import { customerio } from "@corsair-dev/customerio";
import { customgpt } from "@corsair-dev/customgpt";
import { customjs } from "@corsair-dev/customjs";
import { cuttly } from "@corsair-dev/cuttly";
import { d2lbrightspace } from "@corsair-dev/d2lbrightspace";
import { dadataru } from "@corsair-dev/dadataru";
import { daffy } from "@corsair-dev/daffy";
import { databox } from "@corsair-dev/databox";
import { databricks } from "@corsair-dev/databricks";
import { datadog } from "@corsair-dev/datadog";
import { dataforseo } from "@corsair-dev/dataforseo";
import { datarobot } from "@corsair-dev/datarobot";
import { deepline } from "@corsair-dev/deepline";
import { deepseek } from "@corsair-dev/deepseek";
import { demio } from "@corsair-dev/demio";
import { deployhq } from "@corsair-dev/deployhq";
import { desktime } from "@corsair-dev/desktime";
import { devinmcp } from "@corsair-dev/devinmcp";
import { dialpad } from "@corsair-dev/dialpad";
import { diffbot } from "@corsair-dev/diffbot";
import { digicert } from "@corsair-dev/digicert";
import { digitalocean } from "@corsair-dev/digitalocean";
import { discord } from "@corsair-dev/discord";
import { dnsfilter } from "@corsair-dev/dnsfilter";
import { dockerhub } from "@corsair-dev/dockerhub";
import { docmosis } from "@corsair-dev/docmosis";
import { docparser } from "@corsair-dev/docparser";
import { docsbotai } from "@corsair-dev/docsbotai";
import { docsumo } from "@corsair-dev/docsumo";
import { documenso } from "@corsair-dev/documenso";
import { docupost } from "@corsair-dev/docupost";
import { docusign } from "@corsair-dev/docusign";
import { dodopayments } from "@corsair-dev/dodopayments";
import { doppler } from "@corsair-dev/doppler";
import { dopplermarketingautomation } from "@corsair-dev/dopplermarketingautomation";
import { dovetail } from "@corsair-dev/dovetail";
import { draftable } from "@corsair-dev/draftable";
import { dreamstudio } from "@corsair-dev/dreamstudio";
import { dripcel } from "@corsair-dev/dripcel";
import { dropbox } from "@corsair-dev/dropbox";
import { dropboxsign } from "@corsair-dev/dropboxsign";
import { dropcontact } from "@corsair-dev/dropcontact";
import { dynapictures } from "@corsair-dev/dynapictures";
import { e2b } from "@corsair-dev/e2b";
import { echtpost } from "@corsair-dev/echtpost";
import { ecologi } from "@corsair-dev/ecologi";
import { elevenlabs } from "@corsair-dev/elevenlabs";
import { emailable } from "@corsair-dev/emailable";
import { emailoctopus } from "@corsair-dev/emailoctopus";
import { emelia } from "@corsair-dev/emelia";
import { encodian } from "@corsair-dev/encodian";
import { endorsal } from "@corsair-dev/endorsal";
import { enginemailer } from "@corsair-dev/enginemailer";
import { enigma } from "@corsair-dev/enigma";
import { epicgames } from "@corsair-dev/epicgames";
import { erpnext } from "@corsair-dev/erpnext";
import { esignatures } from "@corsair-dev/esignatures";
import { esputnik } from "@corsair-dev/esputnik";
import { etermin } from "@corsair-dev/etermin";
import { eventbrite } from "@corsair-dev/eventbrite";
import { eventee } from "@corsair-dev/eventee";
import { eventzilla } from "@corsair-dev/eventzilla";
import { everhour } from "@corsair-dev/everhour";
import { exa } from "@corsair-dev/exa";
import { excel } from "@corsair-dev/excel";
import { exist } from "@corsair-dev/exist";
import { extractaai } from "@corsair-dev/extractaai";
import { facebook } from "@corsair-dev/facebook";
import { fal } from "@corsair-dev/fal";
import { faraday } from "@corsair-dev/faraday";
import { fathom } from "@corsair-dev/fathom";
import { fathomai } from "@corsair-dev/fathomai";
import { felt } from "@corsair-dev/felt";
import { fibery } from "@corsair-dev/fibery";
import { fidel } from "@corsair-dev/fidel";
import { figma } from "@corsair-dev/figma";
import { filloutforms } from "@corsair-dev/filloutforms";
import { finage } from "@corsair-dev/finage";
import { findymail } from "@corsair-dev/findymail";
import { finerworks } from "@corsair-dev/finerworks";
import { finmei } from "@corsair-dev/finmei";
import { fireberry } from "@corsair-dev/fireberry";
import { firecrawl } from "@corsair-dev/firecrawl";
import { fireflies } from "@corsair-dev/fireflies";
import { fixer } from "@corsair-dev/fixer";
import { flexisign } from "@corsair-dev/flexisign";
import { flutterwave } from "@corsair-dev/flutterwave";
import { fluxguard } from "@corsair-dev/fluxguard";
import { fly } from "@corsair-dev/fly";
import { folk } from "@corsair-dev/folk";
import { followupboss } from "@corsair-dev/followupboss";
import { fomo } from "@corsair-dev/fomo";
import { forcemanager } from "@corsair-dev/forcemanager";
import { formbricks } from "@corsair-dev/formbricks";
import { formdesk } from "@corsair-dev/formdesk";
import { foursquare } from "@corsair-dev/foursquare";
import { freeagent } from "@corsair-dev/freeagent";
import { freshdesk } from "@corsair-dev/freshdesk";
import { fundable } from "@corsair-dev/fundable";
import { gagelist } from "@corsair-dev/gagelist";
import { gamma } from "@corsair-dev/gamma";
import { gatherup } from "@corsair-dev/gatherup";
import { gemini } from "@corsair-dev/gemini";
import { genderapi } from "@corsair-dev/genderapi";
import { genderapiio } from "@corsair-dev/genderapiio";
import { genderize } from "@corsair-dev/genderize";
import { geoapify } from "@corsair-dev/geoapify";
import { geocodio } from "@corsair-dev/geocodio";
import { geokeo } from "@corsair-dev/geokeo";
import { getprospect } from "@corsair-dev/getprospect";
import { giftup } from "@corsair-dev/giftup";
import { gigasheet } from "@corsair-dev/gigasheet";
import { giphy } from "@corsair-dev/giphy";
import { github } from "@corsair-dev/github";
import { gitlab } from "@corsair-dev/gitlab";
import { givebutter } from "@corsair-dev/givebutter";
import { gladia } from "@corsair-dev/gladia";
import { gleap } from "@corsair-dev/gleap";
import { globalping } from "@corsair-dev/globalping";
import { gmail } from "@corsair-dev/gmail";
import { godial } from "@corsair-dev/godial";
import { googleaddressvalidation } from "@corsair-dev/googleaddressvalidation";
import { googleadmin } from "@corsair-dev/googleadmin";
import { googleads } from "@corsair-dev/googleads";
import { googleanalytics } from "@corsair-dev/googleanalytics";
import { googlebigquery } from "@corsair-dev/googlebigquery";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { googleclassroom } from "@corsair-dev/googleclassroom";
import { googlecloudvision } from "@corsair-dev/googlecloudvision";
import { googlecontacts } from "@corsair-dev/googlecontacts";
import { googledocs } from "@corsair-dev/googledocs";
import { googledrive } from "@corsair-dev/googledrive";
import { googlemaps } from "@corsair-dev/googlemaps";
import { googlemeet } from "@corsair-dev/googlemeet";
import { googlesearchconsole } from "@corsair-dev/googlesearchconsole";
import { googlesheets } from "@corsair-dev/googlesheets";
import { googletasks } from "@corsair-dev/googletasks";
import { gorgias } from "@corsair-dev/gorgias";
import { gosquared } from "@corsair-dev/gosquared";
import { grafana } from "@corsair-dev/grafana";
import { griptape } from "@corsair-dev/griptape";
import { grist } from "@corsair-dev/grist";
import { groqcloud } from "@corsair-dev/groqcloud";
import { gumroad } from "@corsair-dev/gumroad";
import { habitica } from "@corsair-dev/habitica";
import { hackernews } from "@corsair-dev/hackernews";
import { handwrytten } from "@corsair-dev/handwrytten";
import { happyscribe } from "@corsair-dev/happyscribe";
import { harvest } from "@corsair-dev/harvest";
import { hashnode } from "@corsair-dev/hashnode";
import { helpscout } from "@corsair-dev/helpscout";
import { helpwise } from "@corsair-dev/helpwise";
import { here } from "@corsair-dev/here";
import { hex } from "@corsair-dev/hex";
import { heygen } from "@corsair-dev/heygen";
import { heyy } from "@corsair-dev/heyy";
import { higgsfield } from "@corsair-dev/higgsfield";
import { honeybadger } from "@corsair-dev/honeybadger";
import { honeyhive } from "@corsair-dev/honeyhive";
import { hookdeck } from "@corsair-dev/hookdeck";
import { hotspotsystem } from "@corsair-dev/hotspotsystem";
import { htmltoimage } from "@corsair-dev/htmltoimage";
import { hubplanner } from "@corsair-dev/hubplanner";
import { hubspot } from "@corsair-dev/hubspot";
import { huggingface } from "@corsair-dev/huggingface";
import { humanitix } from "@corsair-dev/humanitix";
import { hypeauditor } from "@corsair-dev/hypeauditor";
import { hyperbrowser } from "@corsair-dev/hyperbrowser";
import { ignisign } from "@corsair-dev/ignisign";
import { imagekit } from "@corsair-dev/imagekit";
import { imagior } from "@corsair-dev/imagior";
import { imejisio } from "@corsair-dev/imejisio";
import { imgbb } from "@corsair-dev/imgbb";
import { imgix } from "@corsair-dev/imgix";
import { inboxkit } from "@corsair-dev/inboxkit";
import { insightoai } from "@corsair-dev/insightoai";
import { instagram } from "@corsair-dev/instagram";
import { instantly } from "@corsair-dev/instantly";
import { intercom } from "@corsair-dev/intercom";
import { interzoid } from "@corsair-dev/interzoid";
import { ip2proxy } from "@corsair-dev/ip2proxy";
import { ip2whois } from "@corsair-dev/ip2whois";
import { jigsawstack } from "@corsair-dev/jigsawstack";
import { jira } from "@corsair-dev/jira";
import { jobnimbus } from "@corsair-dev/jobnimbus";
import { jotform } from "@corsair-dev/jotform";
import { jumpcloud } from "@corsair-dev/jumpcloud";
import { junglescout } from "@corsair-dev/junglescout";
import { kadoa } from "@corsair-dev/kadoa";
import { kaggle } from "@corsair-dev/kaggle";
import { kalshi } from "@corsair-dev/kalshi";
import { kanbanize } from "@corsair-dev/kanbanize";
import { keen } from "@corsair-dev/keen";
import { keenable } from "@corsair-dev/keenable";
import { keyword } from "@corsair-dev/keyword";
import { kibana } from "@corsair-dev/kibana";
import { kickbox } from "@corsair-dev/kickbox";
import { kit } from "@corsair-dev/kit";
import { klaviyo } from "@corsair-dev/klaviyo";
import { klazify } from "@corsair-dev/klazify";
import { kling } from "@corsair-dev/kling";
import { klipfolio } from "@corsair-dev/klipfolio";
import { knack } from "@corsair-dev/knack";
import { kofi } from "@corsair-dev/kofi";
import { kommo } from "@corsair-dev/kommo";
import { kontentai } from "@corsair-dev/kontentai";
import { krakenio } from "@corsair-dev/krakenio";
import { labs64netlicensing } from "@corsair-dev/labs64netlicensing";
import { laposta } from "@corsair-dev/laposta";
import { launchdarkly } from "@corsair-dev/launchdarkly";
import { leexi } from "@corsair-dev/leexi";
import { leiga } from "@corsair-dev/leiga";
import { lemlist } from "@corsair-dev/lemlist";
import { lemonsqueezy } from "@corsair-dev/lemonsqueezy";
import { lever } from "@corsair-dev/lever";
import { lexoffice } from "@corsair-dev/lexoffice";
import { linear } from "@corsair-dev/linear";
import { linguapop } from "@corsair-dev/linguapop";
import { linkedin } from "@corsair-dev/linkedin";
import { linkup } from "@corsair-dev/linkup";
import { listennotes } from "@corsair-dev/listennotes";
import { livesession } from "@corsair-dev/livesession";
import { logodev } from "@corsair-dev/logodev";
import { loyverse } from "@corsair-dev/loyverse";
import { magichour } from "@corsair-dev/magichour";
import { mailboxlayer } from "@corsair-dev/mailboxlayer";
import { mailcheck } from "@corsair-dev/mailcheck";
import { mailchimp } from "@corsair-dev/mailchimp";
import { mailcoach } from "@corsair-dev/mailcoach";
import { mailsso } from "@corsair-dev/mailsso";
import { mailtrap } from "@corsair-dev/mailtrap";
import { make } from "@corsair-dev/make";
import { mapbox } from "@corsair-dev/mapbox";
import { marketstack } from "@corsair-dev/marketstack";
import { melo } from "@corsair-dev/melo";
import { mem0 } from "@corsair-dev/mem0";
import { memberspot } from "@corsair-dev/memberspot";
import { memberstack } from "@corsair-dev/memberstack";
import { merriamwebsterdict } from "@corsair-dev/merriamwebsterdict";
import { metaads } from "@corsair-dev/metaads";
import { metabase } from "@corsair-dev/metabase";
import { microsoftclarity } from "@corsair-dev/microsoftclarity";
import { minerstat } from "@corsair-dev/minerstat";
import { minimax } from "@corsair-dev/minimax";
import { miro } from "@corsair-dev/miro";
import { missive } from "@corsair-dev/missive";
import { mistralai } from "@corsair-dev/mistralai";
import { mixmax } from "@corsair-dev/mixmax";
import { mixpanel } from "@corsair-dev/mixpanel";
import { modelry } from "@corsair-dev/modelry";
import { monday } from "@corsair-dev/monday";
import { mondaymcp } from "@corsair-dev/mondaymcp";
import { moonclerk } from "@corsair-dev/moonclerk";
import { moosend } from "@corsair-dev/moosend";
import { mopinion } from "@corsair-dev/mopinion";
import { motion } from "@corsair-dev/motion";
import { moz } from "@corsair-dev/moz";
import { mrscraper } from "@corsair-dev/mrscraper";
import { nango } from "@corsair-dev/nango";
import { nanonets } from "@corsair-dev/nanonets";
import { nasa } from "@corsair-dev/nasa";
import { nasdaq } from "@corsair-dev/nasdaq";
import { needle } from "@corsair-dev/needle";
import { neon } from "@corsair-dev/neon";
import { nethunt } from "@corsair-dev/nethunt";
import { neuronwriter } from "@corsair-dev/neuronwriter";
import { neutrino } from "@corsair-dev/neutrino";
import { neverbounce } from "@corsair-dev/neverbounce";
import { newrelic } from "@corsair-dev/newrelic";
import { newsapi } from "@corsair-dev/newsapi";
import { nextdns } from "@corsair-dev/nextdns";
import { ngrok } from "@corsair-dev/ngrok";
import { niftyimages } from "@corsair-dev/niftyimages";
import { ninox } from "@corsair-dev/ninox";
import { northflank } from "@corsair-dev/northflank";
import { notion } from "@corsair-dev/notion";
import { nutshell } from "@corsair-dev/nutshell";
import { ocrspace } from "@corsair-dev/ocrspace";
import { ocrwebservice } from "@corsair-dev/ocrwebservice";
import { octen } from "@corsair-dev/octen";
import { ollama } from "@corsair-dev/ollama";
import { onedesk } from "@corsair-dev/onedesk";
import { onedrive } from "@corsair-dev/onedrive";
import { onepassword } from "@corsair-dev/onepassword";
import { openai } from "@corsair-dev/openai";
import { opengraph } from "@corsair-dev/opengraph";
import { openrouter } from "@corsair-dev/openrouter";
import { opensea } from "@corsair-dev/opensea";
import { openseo } from "@corsair-dev/openseo";
import { openweathermap } from "@corsair-dev/openweathermap";
import { orbit } from "@corsair-dev/orbit";
import { oura } from "@corsair-dev/oura";
import { outlook } from "@corsair-dev/outlook";
import { pagerduty } from "@corsair-dev/pagerduty";
import { pandadoc } from "@corsair-dev/pandadoc";
import { paperform } from "@corsair-dev/paperform";
import { paradym } from "@corsair-dev/paradym";
import { parma } from "@corsair-dev/parma";
import { parsehub } from "@corsair-dev/parsehub";
import { parsera } from "@corsair-dev/parsera";
import { parseur } from "@corsair-dev/parseur";
import { parsio } from "@corsair-dev/parsio";
import { passcreator } from "@corsair-dev/passcreator";
import { payhere } from "@corsair-dev/payhere";
import { payhip } from "@corsair-dev/payhip";
import { paystack } from "@corsair-dev/paystack";
import { pdf4me } from "@corsair-dev/pdf4me";
import { pdfapi } from "@corsair-dev/pdfapi";
import { pdfco } from "@corsair-dev/pdfco";
import { pdfless } from "@corsair-dev/pdfless";
import { pdfmonkey } from "@corsair-dev/pdfmonkey";
import { pdl } from "@corsair-dev/pdl";
import { penpot } from "@corsair-dev/penpot";
import { perigon } from "@corsair-dev/perigon";
import { perplexityai } from "@corsair-dev/perplexityai";
import { persistiq } from "@corsair-dev/persistiq";
import { persona } from "@corsair-dev/persona";
import { pexels } from "@corsair-dev/pexels";
import { phantombuster } from "@corsair-dev/phantombuster";
import { piggy } from "@corsair-dev/piggy";
import { piloterr } from "@corsair-dev/piloterr";
import { pilvio } from "@corsair-dev/pilvio";
import { pinecone } from "@corsair-dev/pinecone";
import { pingdom } from "@corsair-dev/pingdom";
import { pipelinecrm } from "@corsair-dev/pipelinecrm";
import { placid } from "@corsair-dev/placid";
import { plain } from "@corsair-dev/plain";
import { platerecognizer } from "@corsair-dev/platerecognizer";
import { ploid } from "@corsair-dev/ploid";
import { pointagram } from "@corsair-dev/pointagram";
import { polygon } from "@corsair-dev/polygon";
import { polygonio } from "@corsair-dev/polygonio";
import { postalytics } from "@corsair-dev/postalytics";
import { postgrid } from "@corsair-dev/postgrid";
import { posthog } from "@corsair-dev/posthog";
import { postiz } from "@corsair-dev/postiz";
import { postman } from "@corsair-dev/postman";
import { postmark } from "@corsair-dev/postmark";
import { postonce } from "@corsair-dev/postonce";
import { prerender } from "@corsair-dev/prerender";
import { prisma } from "@corsair-dev/prisma";
import { prismic } from "@corsair-dev/prismic";
import { proabono } from "@corsair-dev/proabono";
import { productboard } from "@corsair-dev/productboard";
import { proofly } from "@corsair-dev/proofly";
import { pushbullet } from "@corsair-dev/pushbullet";
import { pushover } from "@corsair-dev/pushover";
import { qdrant } from "@corsair-dev/qdrant";
import { quaderno } from "@corsair-dev/quaderno";
import { quickbooks } from "@corsair-dev/quickbooks";
import { radar } from "@corsair-dev/radar";
import { ragic } from "@corsair-dev/ragic";
import { raisely } from "@corsair-dev/raisely";
import { ramp } from "@corsair-dev/ramp";
import { razorpay } from "@corsair-dev/razorpay";
import { realphonevalidation } from "@corsair-dev/realphonevalidation";
import { reamaze } from "@corsair-dev/reamaze";
import { recallai } from "@corsair-dev/recallai";
import { recruitee } from "@corsair-dev/recruitee";
import { redcircle } from "@corsair-dev/redcircle";
import { reddit } from "@corsair-dev/reddit";
import { referralrock } from "@corsair-dev/referralrock";
import { refiner } from "@corsair-dev/refiner";
import { remarkety } from "@corsair-dev/remarkety";
import { remoet } from "@corsair-dev/remoet";
import { remoteretrieval } from "@corsair-dev/remoteretrieval";
import { removebg } from "@corsair-dev/removebg";
import { render } from "@corsair-dev/render";
import { renderform } from "@corsair-dev/renderform";
import { rentman } from "@corsair-dev/rentman";
import { repairshopr } from "@corsair-dev/repairshopr";
import { replicate } from "@corsair-dev/replicate";
import { replyio } from "@corsair-dev/replyio";
import { resend } from "@corsair-dev/resend";
import { respondio } from "@corsair-dev/respondio";
import { retailed } from "@corsair-dev/retailed";
import { retellai } from "@corsair-dev/retellai";
import { retently } from "@corsair-dev/retently";
import { revai } from "@corsair-dev/revai";
import { revolt } from "@corsair-dev/revolt";
import { ritekit } from "@corsair-dev/ritekit";
import { roam } from "@corsair-dev/roam";
import { roboflow } from "@corsair-dev/roboflow";
import { rocketlane } from "@corsair-dev/rocketlane";
import { rocketreach } from "@corsair-dev/rocketreach";
import { rollbar } from "@corsair-dev/rollbar";
import { rootly } from "@corsair-dev/rootly";
import { rosette } from "@corsair-dev/rosette";
import { route4me } from "@corsair-dev/route4me";
import { rudderstacktransform } from "@corsair-dev/rudderstacktransform";
import { runpod } from "@corsair-dev/runpod";
import { salesflare } from "@corsair-dev/salesflare";
import { salesforce } from "@corsair-dev/salesforce";
import { sanity } from "@corsair-dev/sanity";
import { sapsuccessfactors } from "@corsair-dev/sapsuccessfactors";
import { satismeter } from "@corsair-dev/satismeter";
import { scaleai } from "@corsair-dev/scaleai";
import { scrapedo } from "@corsair-dev/scrapedo";
import { scrapegraphai } from "@corsair-dev/scrapegraphai";
import { scrapingant } from "@corsair-dev/scrapingant";
import { screenshotone } from "@corsair-dev/screenshotone";
import { search1api } from "@corsair-dev/search1api";
import { searchapi } from "@corsair-dev/searchapi";
import { securitytrails } from "@corsair-dev/securitytrails";
import { semanticscholar } from "@corsair-dev/semanticscholar";
import { sendbird } from "@corsair-dev/sendbird";
import { sendgrid } from "@corsair-dev/sendgrid";
import { sensibo } from "@corsair-dev/sensibo";
import { sentry } from "@corsair-dev/sentry";
import { serpapi } from "@corsair-dev/serpapi";
import { serply } from "@corsair-dev/serply";
import { servicem8 } from "@corsair-dev/servicem8";
import { servicenow } from "@corsair-dev/servicenow";
import { sevdesk } from "@corsair-dev/sevdesk";
import { sharepoint } from "@corsair-dev/sharepoint";
import { shipengine } from "@corsair-dev/shipengine";
import { shippo } from "@corsair-dev/shippo";
import { shopify } from "@corsair-dev/shopify";
import { shortcut } from "@corsair-dev/shortcut";
import { shortio } from "@corsair-dev/shortio";
import { signpath } from "@corsair-dev/signpath";
import { signwell } from "@corsair-dev/signwell";
import { similarweb } from "@corsair-dev/similarweb";
import { simlacom } from "@corsair-dev/simlacom";
import { simpleanalytics } from "@corsair-dev/simpleanalytics";
import { simplekpi } from "@corsair-dev/simplekpi";
import { simplero } from "@corsair-dev/simplero";
import { simplesat } from "@corsair-dev/simplesat";
import { slack } from "@corsair-dev/slack";
import { smsalert } from "@corsair-dev/smsalert";
import { snapchat } from "@corsair-dev/snapchat";
import { snowflake } from "@corsair-dev/snowflake";
import { sourcegraph } from "@corsair-dev/sourcegraph";
import { splitwise } from "@corsair-dev/splitwise";
import { spoki } from "@corsair-dev/spoki";
import { spondyr } from "@corsair-dev/spondyr";
import { spotify } from "@corsair-dev/spotify";
import { square } from "@corsair-dev/square";
import { stackai } from "@corsair-dev/stackai";
import { stackexchange } from "@corsair-dev/stackexchange";
import { stannp } from "@corsair-dev/stannp";
import { starton } from "@corsair-dev/starton";
import { statuscake } from "@corsair-dev/statuscake";
import { storeganise } from "@corsair-dev/storeganise";
import { storerocket } from "@corsair-dev/storerocket";
import { stormboard } from "@corsair-dev/stormboard";
import { stormglass } from "@corsair-dev/stormglass";
import { storyblok } from "@corsair-dev/storyblok";
import { strava } from "@corsair-dev/strava";
import { streamtime } from "@corsair-dev/streamtime";
import { stripe } from "@corsair-dev/stripe";
import { studiobyai21labs } from "@corsair-dev/studiobyai21labs";
import { suitedash } from "@corsair-dev/suitedash";
import { supabase } from "@corsair-dev/supabase";
import { supadata } from "@corsair-dev/supadata";
import { superchat } from "@corsair-dev/superchat";
import { supersaas } from "@corsair-dev/supersaas";
import { supportbee } from "@corsair-dev/supportbee";
import { surf } from "@corsair-dev/surf";
import { surveymonkey } from "@corsair-dev/surveymonkey";
import { suzanne } from "@corsair-dev/suzanne";
import { svix } from "@corsair-dev/svix";
import { swaggerhub } from "@corsair-dev/swaggerhub";
import { sympla } from "@corsair-dev/sympla";
import { synthflowai } from "@corsair-dev/synthflowai";
import { taggun } from "@corsair-dev/taggun";
import { tailscale } from "@corsair-dev/tailscale";
import { talenthr } from "@corsair-dev/talenthr";
import { tally } from "@corsair-dev/tally";
import { tapfiliate } from "@corsair-dev/tapfiliate";
import { tave } from "@corsair-dev/tave";
import { tavily } from "@corsair-dev/tavily";
import { tavilymcp } from "@corsair-dev/tavilymcp";
import { taxjar } from "@corsair-dev/taxjar";
import { teamcamp } from "@corsair-dev/teamcamp";
import { teams } from "@corsair-dev/teams";
import { teamwork } from "@corsair-dev/teamwork";
import { telegram } from "@corsair-dev/telegram";
import { telnyx } from "@corsair-dev/telnyx";
import { teltel } from "@corsair-dev/teltel";
import { templated } from "@corsair-dev/templated";
import { textcortex } from "@corsair-dev/textcortex";
import { textrazor } from "@corsair-dev/textrazor";
import { thanksio } from "@corsair-dev/thanksio";
import { thinkific } from "@corsair-dev/thinkific";
import { ticketmaster } from "@corsair-dev/ticketmaster";
import { ticktick } from "@corsair-dev/ticktick";
import { timecamp } from "@corsair-dev/timecamp";
import { timelink } from "@corsair-dev/timelink";
import { timely } from "@corsair-dev/timely";
import { tinyurl } from "@corsair-dev/tinyurl";
import { tisane } from "@corsair-dev/tisane";
import { tldv } from "@corsair-dev/tldv";
import { todoist } from "@corsair-dev/todoist";
import { toggl } from "@corsair-dev/toggl";
import { tokenmetrics } from "@corsair-dev/tokenmetrics";
import { tomba } from "@corsair-dev/tomba";
import { tomtom } from "@corsair-dev/tomtom";
import { toneden } from "@corsair-dev/toneden";
import { tpscheck } from "@corsair-dev/tpscheck";
import { trello } from "@corsair-dev/trello";
import { triggercmd } from "@corsair-dev/triggercmd";
import { tripadvisor } from "@corsair-dev/tripadvisor";
import { trustpilot } from "@corsair-dev/trustpilot";
import { truvera } from "@corsair-dev/truvera";
import { turbotpipes } from "@corsair-dev/turbotpipes";
import { turso } from "@corsair-dev/turso";
import { twelvedata } from "@corsair-dev/twelvedata";
import { twentyonerisk } from "@corsair-dev/twentyonerisk";
import { twilio } from "@corsair-dev/twilio";
import { twitter } from "@corsair-dev/twitter";
import { twitterapiio } from "@corsair-dev/twitterapiio";
import { twittrapi } from "@corsair-dev/twittrapi";
import { twocaptcha } from "@corsair-dev/twocaptcha";
import { twochat } from "@corsair-dev/twochat";
import { typeform } from "@corsair-dev/typeform";
import { u301 } from "@corsair-dev/u301";
import { unione } from "@corsair-dev/unione";
import { unipile } from "@corsair-dev/unipile";
import { unisender } from "@corsair-dev/unisender";
import { uniswapapi } from "@corsair-dev/uniswapapi";
import { updownio } from "@corsair-dev/updownio";
import { uploadcare } from "@corsair-dev/uploadcare";
import { uptimerobot } from "@corsair-dev/uptimerobot";
import { userflow } from "@corsair-dev/userflow";
import { userlist } from "@corsair-dev/userlist";
import { vapi } from "@corsair-dev/vapi";
import { vaquill } from "@corsair-dev/vaquill";
import { vectorshift } from "@corsair-dev/vectorshift";
import { vercel } from "@corsair-dev/vercel";
import { veriphone } from "@corsair-dev/veriphone";
import { vestaboard } from "@corsair-dev/vestaboard";
import { virustotal } from "@corsair-dev/virustotal";
import { waboxapp } from "@corsair-dev/waboxapp";
import { wachete } from "@corsair-dev/wachete";
import { wakatime } from "@corsair-dev/wakatime";
import { wati } from "@corsair-dev/wati";
import { webex } from "@corsair-dev/webex";
import { webflow } from "@corsair-dev/webflow";
import { webscraperio } from "@corsair-dev/webscraperio";
import { webscrapingai } from "@corsair-dev/webscrapingai";
import { webvizio } from "@corsair-dev/webvizio";
import { whatsapp } from "@corsair-dev/whatsapp";
import { whautomate } from "@corsair-dev/whautomate";
import { whoisfreaks } from "@corsair-dev/whoisfreaks";
import { winstonai } from "@corsair-dev/winstonai";
import { wisprflow } from "@corsair-dev/wisprflow";
import { witai } from "@corsair-dev/witai";
import { wix } from "@corsair-dev/wix";
import { wiza } from "@corsair-dev/wiza";
import { woodpeckerco } from "@corsair-dev/woodpeckerco";
import { workable } from "@corsair-dev/workable";
import { workday } from "@corsair-dev/workday";
import { workiom } from "@corsair-dev/workiom";
import { worksnaps } from "@corsair-dev/worksnaps";
import { worldnewsapi } from "@corsair-dev/worldnewsapi";
import { wrike } from "@corsair-dev/wrike";
import { writer } from "@corsair-dev/writer";
import { xero } from "@corsair-dev/xero";
import { xquik } from "@corsair-dev/xquik";
import { yandex } from "@corsair-dev/yandex";
import { ynab } from "@corsair-dev/ynab";
import { youcom } from "@corsair-dev/youcom";
import { youtube } from "@corsair-dev/youtube";
import { zendesk } from "@corsair-dev/zendesk";
import { zenrows } from "@corsair-dev/zenrows";
import { zenserp } from "@corsair-dev/zenserp";
import { zohobigin } from "@corsair-dev/zohobigin";
import { zohobooks } from "@corsair-dev/zohobooks";
import { zohodesk } from "@corsair-dev/zohodesk";
import { zohoinventory } from "@corsair-dev/zohoinventory";
import { zohoinvoice } from "@corsair-dev/zohoinvoice";
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
  adyntel(),
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
  akta(),
  alchemy(),
  algolia(),
  alibaba(),
  allimagesai(),
  alphavantage(),
  altoviz(),
  alttextai(),
  amara(),
  ambee(),
  ambientweather(),
  amcards(),
  amika(),
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
  apollo(),
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
  beamer(),
  beeminder(),
  benchmarkemail(),
  benzinga(),
  bestbuy(),
  bettercontact(),
  betterproposals(),
  betterstack(),
  bigdatacloud(),
  bigmailer(),
  bigml(),
  bigpictureio(),
  bitbucket(),
  bitwarden(),
  blackbaud(),
  blazemeter(),
  blocknative(),
  bluesky(),
  boldsign(),
  boloforms(),
  boltiot(),
  bonsai(),
  bookingmood(),
  booqable(),
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
  browseruse(),
  bubble(),
  bugsnag(),
  buildkite(),
  builtwith(),
  bunnycdn(),
  bytedance(),
  byteforms(),
  cal(),
  calendly(),
  callingly(),
  callpage(),
  campaigncleaner(),
  campayn(),
  canny(),
  canva(),
  canvas(),
  capsulecrm(),
  castingwords(),
  cdrplatform(),
  celigo(),
  certifier(),
  certspotter(),
  chaser(),
  chatbotkit(),
  chatfai(),
  chatwork(),
  chmeetings(),
  cincopa(),
  circleci(),
  claidai(),
  classmarker(),
  clay(),
  clickhouse(),
  clickmeeting(),
  clicksend(),
  clickup(),
  clientary(),
  clockify(),
  cloro(),
  close(),
  cloudcart(),
  cloudconvert(),
  cloudflare(),
  cloudflareapikey(),
  cloudflarebrowserrendering(),
  cloudinary(),
  coassemble(),
  coda(),
  codacy(),
  codeinterpreter(),
  codereadr(),
  cody(),
  coinbase(),
  coinmarketcal(),
  coinmarketcap(),
  collegefootballdata(),
  commcare(),
  companyenrich(),
  composio(),
  confluence(),
  connecteam(),
  contactout(),
  contentfulgraphql(),
  contextdev(),
  contextsevenmcp(),
  convex(),
  convoloai(),
  cosmic(),
  countdownapi(),
  craftmypdf(),
  crowterminal(),
  currencyscoop(),
  currentsapi(),
  cursor(),
  customerio(),
  customgpt(),
  customjs(),
  cuttly(),
  d2lbrightspace(),
  dadataru(),
  daffy(),
  databox(),
  databricks(),
  datadog(),
  dataforseo(),
  datarobot(),
  deepline(),
  deepseek(),
  demio(),
  deployhq(),
  desktime(),
  devinmcp(),
  dialpad(),
  diffbot(),
  digicert(),
  digitalocean(),
  discord(),
  dnsfilter(),
  dockerhub(),
  docmosis(),
  docparser(),
  docsbotai(),
  docsumo(),
  documenso(),
  docupost(),
  docusign(),
  dodopayments(),
  doppler(),
  dopplermarketingautomation(),
  dovetail(),
  draftable(),
  dreamstudio(),
  dripcel(),
  dropbox(),
  dropboxsign(),
  dropcontact(),
  dynapictures(),
  e2b(),
  echtpost(),
  ecologi(),
  elevenlabs(),
  emailable(),
  emailoctopus(),
  emelia(),
  encodian(),
  endorsal(),
  enginemailer(),
  enigma(),
  epicgames(),
  erpnext(),
  esignatures(),
  esputnik(),
  etermin(),
  eventbrite(),
  eventee(),
  eventzilla(),
  everhour(),
  exa(),
  excel(),
  exist(),
  extractaai(),
  facebook(),
  fal(),
  faraday(),
  fathom(),
  fathomai(),
  felt(),
  fibery(),
  fidel(),
  figma(),
  filloutforms(),
  finage(),
  findymail(),
  finerworks(),
  finmei(),
  fireberry(),
  firecrawl(),
  fireflies(),
  fixer(),
  flexisign(),
  flutterwave(),
  fluxguard(),
  fly(),
  folk(),
  followupboss(),
  fomo(),
  forcemanager(),
  formbricks(),
  formdesk(),
  foursquare(),
  freeagent(),
  freshdesk(),
  fundable(),
  gagelist(),
  gamma(),
  gatherup(),
  gemini(),
  genderapi(),
  genderapiio(),
  genderize(),
  geoapify(),
  geocodio(),
  geokeo(),
  getprospect(),
  giftup(),
  gigasheet(),
  giphy(),
  github(),
  gitlab(),
  givebutter(),
  gladia(),
  gleap(),
  globalping(),
  gmail(),
  godial(),
  googleaddressvalidation(),
  googleadmin(),
  googleads(),
  googleanalytics(),
  googlebigquery(),
  googlecalendar(),
  googleclassroom(),
  googlecloudvision(),
  googlecontacts(),
  googledocs(),
  googledrive(),
  googlemaps(),
  googlemeet(),
  googlesearchconsole(),
  googlesheets(),
  googletasks(),
  gorgias(),
  gosquared(),
  grafana(),
  griptape(),
  grist(),
  groqcloud(),
  gumroad(),
  habitica(),
  hackernews(),
  handwrytten(),
  happyscribe(),
  harvest(),
  hashnode(),
  helpscout(),
  helpwise(),
  here(),
  hex(),
  heygen(),
  heyy(),
  higgsfield(),
  honeybadger(),
  honeyhive(),
  hookdeck(),
  hotspotsystem(),
  htmltoimage(),
  hubplanner(),
  hubspot(),
  huggingface(),
  humanitix(),
  hypeauditor(),
  hyperbrowser(),
  ignisign(),
  imagekit(),
  imagior(),
  imejisio(),
  imgbb(),
  imgix(),
  inboxkit(),
  insightoai(),
  instagram(),
  instantly(),
  intercom(),
  interzoid(),
  ip2proxy(),
  ip2whois(),
  jigsawstack(),
  jira(),
  jobnimbus(),
  jotform(),
  jumpcloud(),
  junglescout(),
  kadoa(),
  kaggle(),
  kalshi(),
  kanbanize(),
  keen(),
  keenable(),
  keyword(),
  kibana(),
  kickbox(),
  kit(),
  klaviyo(),
  klazify(),
  kling(),
  klipfolio(),
  knack(),
  kofi(),
  kommo(),
  kontentai(),
  krakenio(),
  labs64netlicensing(),
  laposta(),
  launchdarkly(),
  leexi(),
  leiga(),
  lemlist(),
  lemonsqueezy(),
  lever(),
  lexoffice(),
  linear(),
  linguapop(),
  linkedin(),
  linkup(),
  listennotes(),
  livesession(),
  logodev(),
  loyverse(),
  magichour(),
  mailboxlayer(),
  mailcheck(),
  mailchimp(),
  mailcoach(),
  mailsso(),
  mailtrap(),
  make(),
  mapbox(),
  marketstack(),
  melo(),
  mem0(),
  memberspot(),
  memberstack(),
  merriamwebsterdict(),
  metaads(),
  metabase(),
  microsoftclarity(),
  minerstat(),
  minimax(),
  miro(),
  missive(),
  mistralai(),
  mixmax(),
  mixpanel(),
  modelry(),
  monday(),
  mondaymcp(),
  moonclerk(),
  moosend(),
  mopinion(),
  motion(),
  moz(),
  mrscraper(),
  nango(),
  nanonets(),
  nasa(),
  nasdaq(),
  needle(),
  neon(),
  nethunt(),
  neuronwriter(),
  neutrino(),
  neverbounce(),
  newrelic(),
  newsapi(),
  nextdns(),
  ngrok(),
  niftyimages(),
  ninox(),
  northflank(),
  notion(),
  nutshell(),
  ocrspace(),
  ocrwebservice(),
  octen(),
  ollama(),
  onedesk(),
  onedrive(),
  onepassword(),
  openai(),
  opengraph(),
  openrouter(),
  opensea(),
  openseo(),
  openweathermap(),
  orbit(),
  oura(),
  outlook(),
  pagerduty(),
  pandadoc(),
  paperform(),
  paradym(),
  parma(),
  parsehub(),
  parsera(),
  parseur(),
  parsio(),
  passcreator(),
  payhere(),
  payhip(),
  paystack(),
  pdf4me(),
  pdfapi(),
  pdfco(),
  pdfless(),
  pdfmonkey(),
  pdl(),
  penpot(),
  perigon(),
  perplexityai(),
  persistiq(),
  persona(),
  pexels(),
  phantombuster(),
  piggy(),
  piloterr(),
  pilvio(),
  pinecone(),
  pingdom(),
  pipelinecrm(),
  placid(),
  plain(),
  platerecognizer(),
  ploid(),
  pointagram(),
  polygon(),
  polygonio(),
  postalytics(),
  postgrid(),
  posthog(),
  postiz(),
  postman(),
  postmark(),
  postonce(),
  prerender(),
  prisma(),
  prismic(),
  proabono(),
  productboard(),
  proofly(),
  pushbullet(),
  pushover(),
  qdrant(),
  quaderno(),
  quickbooks(),
  radar(),
  ragic(),
  raisely(),
  ramp(),
  razorpay(),
  realphonevalidation(),
  reamaze(),
  recallai(),
  recruitee(),
  redcircle(),
  reddit(),
  referralrock(),
  refiner(),
  remarkety(),
  remoet(),
  remoteretrieval(),
  removebg(),
  render(),
  renderform(),
  rentman(),
  repairshopr(),
  replicate(),
  replyio(),
  resend(),
  respondio(),
  retailed(),
  retellai(),
  retently(),
  revai(),
  revolt(),
  ritekit(),
  roam(),
  roboflow(),
  rocketlane(),
  rocketreach(),
  rollbar(),
  rootly(),
  rosette(),
  route4me(),
  rudderstacktransform(),
  runpod(),
  salesflare(),
  salesforce(),
  sanity(),
  sapsuccessfactors(),
  satismeter(),
  scaleai(),
  scrapedo(),
  scrapegraphai(),
  scrapingant(),
  screenshotone(),
  search1api(),
  searchapi(),
  securitytrails(),
  semanticscholar(),
  sendbird(),
  sendgrid(),
  sensibo(),
  sentry(),
  serpapi(),
  serply(),
  servicem8(),
  servicenow(),
  sevdesk(),
  sharepoint(),
  shipengine(),
  shippo(),
  shopify(),
  shortcut(),
  shortio(),
  signpath(),
  signwell(),
  similarweb(),
  simlacom(),
  simpleanalytics(),
  simplekpi(),
  simplero(),
  simplesat(),
  slack(),
  smsalert(),
  snapchat(),
  snowflake(),
  sourcegraph(),
  splitwise(),
  spoki(),
  spondyr(),
  spotify(),
  square(),
  stackai(),
  stackexchange(),
  stannp(),
  starton(),
  statuscake(),
  storeganise(),
  storerocket(),
  stormboard(),
  stormglass(),
  storyblok(),
  strava(),
  streamtime(),
  stripe(),
  studiobyai21labs(),
  suitedash(),
  supabase(),
  supadata(),
  superchat(),
  supersaas(),
  supportbee(),
  surf(),
  surveymonkey(),
  suzanne(),
  svix(),
  swaggerhub(),
  sympla(),
  synthflowai(),
  taggun(),
  tailscale(),
  talenthr(),
  tally(),
  tapfiliate(),
  tave(),
  tavily(),
  tavilymcp(),
  taxjar(),
  teamcamp(),
  teams(),
  teamwork(),
  telegram(),
  telnyx(),
  teltel(),
  templated(),
  textcortex(),
  textrazor(),
  thanksio(),
  thinkific(),
  ticketmaster(),
  ticktick(),
  timecamp(),
  timelink(),
  timely(),
  tinyurl(),
  tisane(),
  tldv(),
  todoist(),
  toggl(),
  tokenmetrics(),
  tomba(),
  tomtom(),
  toneden(),
  tpscheck(),
  trello(),
  triggercmd(),
  tripadvisor(),
  trustpilot(),
  truvera(),
  turbotpipes(),
  turso(),
  twelvedata(),
  twentyonerisk(),
  twilio(),
  twitter(),
  twitterapiio(),
  twittrapi(),
  twocaptcha(),
  twochat(),
  typeform(),
  u301(),
  unione(),
  unipile(),
  unisender(),
  uniswapapi(),
  updownio(),
  uploadcare(),
  uptimerobot(),
  userflow(),
  userlist(),
  vapi(),
  vaquill(),
  vectorshift(),
  vercel(),
  veriphone(),
  vestaboard(),
  virustotal(),
  waboxapp(),
  wachete(),
  wakatime(),
  wati(),
  webex(),
  webflow(),
  webscraperio(),
  webscrapingai(),
  webvizio(),
  whatsapp(),
  whautomate(),
  whoisfreaks(),
  winstonai(),
  wisprflow(),
  witai(),
  wix(),
  wiza(),
  woodpeckerco(),
  workable(),
  // workday requires tenant/host at construction time; use placeholders that
  // are overridden per-tenant at runtime via the integration key manager.
  workday({ tenant: "placeholder", host: "placeholder.workday.com" }),
  workiom(),
  worksnaps(),
  worldnewsapi(),
  wrike(),
  writer(),
  xero(),
  xquik(),
  yandex(),
  ynab(),
  youcom(),
  youtube(),
  zendesk(),
  zenrows(),
  zenserp(),
  zohobigin(),
  zohobooks(),
  zohodesk(),
  zohoinventory(),
  zohoinvoice(),
  zohomail(),
  zoom(),
  zoominfo(),
] as const;
