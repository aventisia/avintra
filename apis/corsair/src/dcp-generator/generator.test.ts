/**
 * Validation test for the Corsair → Studio Cloud Connector DCP generator.
 *
 * Runs generation to a temp directory and asserts:
 *   - every plugin has at least one action config
 *   - generated configs contain only the standard Cloud Connector schema
 *   - the dedicated Corsair mapping file is valid JSON with an "App Integrations" L1 category
 *
 * Usage:
 *   npm run test:dcp
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createCorsair } from "corsair";
import { plugins } from "../plugins.js";
import { PLUGIN_DISPLAY_NAMES } from "./plugin-metadata.js";
import { humanizeFieldKey } from "./schema-to-fields.js";
import { generateDcpFiles } from "./index.js";

const corsair = createCorsair({
  multiTenancy: true,
  plugins,
  database: undefined,
  kek: "0000000000000000000000000000000000000000000000000000000000000000",
});

/** The only top-level keys allowed in a generated Cloud Connector config. */
const ALLOWED_CONFIG_KEYS = new Set([
  "name",
  "description",
  "version",
  "author",
  "supportedPlatforms",
  "errorHandling",
  "testScreenType",
  "fields",
]);

function assert(cond: boolean, message: string): void {
  if (!cond) throw new Error(`ASSERTION FAILED: ${message}`);
}

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "corsair-dcp-test-"));
  try {
    await generateDcpFiles({ outputDir: tmpDir, plugins, corsair });

    const configRoot = path.join(tmpDir, "Corsair");
    const mappingFile = path.join(tmpDir, "CorsairActionSelectorMappingFile.json");

    // 1. Every plugin produced at least one action config.
    for (const p of plugins) {
      const id = (p as any).id as string;
      const pluginDir = path.join(configRoot, id.charAt(0).toUpperCase() + id.slice(1));
      const files = fs.existsSync(pluginDir)
        ? fs.readdirSync(pluginDir).filter((f) => f.endsWith(".json"))
        : [];
      assert(files.length > 0, `plugin '${id}' produced no action configs`);
    }

    // 2. Every config contains only allowed top-level keys and has the
    //    standard Cloud Connector schema. Walk only the plugin directories
    //    (exclude the `openapi` subfolder).
    const walk = (dir: string): string[] =>
      fs.existsSync(dir)
        ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
            e.isDirectory() && e.name === "openapi"
              ? []
              : e.isDirectory()
                ? walk(path.join(dir, e.name))
                : [path.join(dir, e.name)],
          )
        : [];
    const configFiles = walk(configRoot).filter((f) => f.endsWith(".json"));
    assert(configFiles.length > 0, "no config files generated");

    for (const file of configFiles) {
      const config = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const key of Object.keys(config)) {
        assert(ALLOWED_CONFIG_KEYS.has(key), `config ${file} has unexpected key '${key}'`);
      }
      assert(Array.isArray(config.fields), `config ${file} missing fields`);
      assert(
        config.fields.some((f: any) => f.direction === "Output" && f.type === "config-panel-output"),
        `config ${file} missing standard output field`,
      );
      assert(
        config.fields.every((f: any) => "defaultValue" in f),
        `config ${file} has fields without defaultValue`,
      );
    }

    // 3. Backend action map is generated and contains invocation metadata.
    const actionMapFile = path.join(tmpDir, "CorsairActionMap.json");
    assert(fs.existsSync(actionMapFile), "action map file not generated");
    const actionMap = JSON.parse(fs.readFileSync(actionMapFile, "utf8"));
    assert(Array.isArray(actionMap), "action map is not an array");
    assert(actionMap.length > 0, "action map is empty");
    for (const entry of actionMap) {
      assert(entry.nodeName, `action map entry missing nodeName`);
      assert(entry.plugin, `action map entry missing plugin`);
      assert(entry.action, `action map entry missing action`);
      assert(entry.authType, `action map entry missing authType`);
      assert(Array.isArray(entry.configKeys), `action map entry missing configKeys`);
    }

    // 4. Mapping file is valid JSON with an "App Integrations" L1 category.
    assert(fs.existsSync(mappingFile), "mapping file not generated");
    const mapping = JSON.parse(fs.readFileSync(mappingFile, "utf8"));
    assert(Array.isArray(mapping), "mapping is not an array");
    const appIntegrations = mapping.find((l1: any) => l1.label === "App Integrations");
    assert(appIntegrations, "mapping missing 'App Integrations' L1 category");
    assert(
      appIntegrations.actionCategories.length > 0,
      "App Integrations has no Corsair action categories",
    );

    // 5. Microsoft plugins use distinct labels while sharing the M365 vault credential.
    const microsoftLabels = new Map(
      appIntegrations.actionCategories
        .filter((category: any) => ["outlook", "teams", "onedrive", "sharepoint"].some(
          (id) => category.actions.some((action: any) => action.name.includes(`/${id.charAt(0).toUpperCase() + id.slice(1)}/`)),
        ))
        .map((category: any) => [category.actions[0].name.split("/")[1], category.label]),
    );
    assert(microsoftLabels.get("Outlook") === "Outlook", "Outlook category is not named Outlook");
    assert(microsoftLabels.get("Teams") === "Microsoft Teams", "Teams category has no canonical name");
    assert(microsoftLabels.get("Onedrive") === "OneDrive", "OneDrive category has no canonical name");
    assert(microsoftLabels.get("Sharepoint") === "SharePoint", "SharePoint category has no canonical name");

    // 5b. Google plugins use distinct labels while sharing the Google vault credential.
    const googleLabels = new Map(
      appIntegrations.actionCategories
        .filter((category: any) => ["gmail", "googlecalendar", "googlesheets", "googledocs", "googledrive", "googlemeet", "googlebigquery", "googlecloudvision", "googlemaps", "googleaddressvalidation", "youtube"].some(
          (id) => category.actions.some((action: any) => action.name.includes(`/${id.charAt(0).toUpperCase() + id.slice(1)}/`)),
        ))
        .map((category: any) => [category.actions[0].name.split("/")[1], category.label]),
    );
    assert(googleLabels.get("Gmail") === "Gmail", "Gmail category is not named Gmail");
    assert(googleLabels.get("Googlecalendar") === "Google Calendar", "Google Calendar category has no canonical name");
    assert(googleLabels.get("Googlesheets") === "Google Sheets", "Google Sheets category has no canonical name");
    assert(googleLabels.get("Googledocs") === "Google Docs", "Google Docs category has no canonical name");
    assert(googleLabels.get("Googledrive") === "Google Drive", "Google Drive category has no canonical name");
    assert(googleLabels.get("Googlemeet") === "Google Meet", "Google Meet category has no canonical name");
    assert(googleLabels.get("Googlebigquery") === "Google BigQuery", "Google BigQuery category has no canonical name");
    assert(googleLabels.get("Googlecloudvision") === "Google Cloud Vision", "Google Cloud Vision category has no canonical name");
    assert(googleLabels.get("Googlemaps") === "Google Maps", "Google Maps category has no canonical name");
    assert(googleLabels.get("Googleaddressvalidation") === "Google Address Validation", "Google Address Validation category has no canonical name");
    assert(googleLabels.get("Youtube") === "YouTube", "YouTube category has no canonical name");

    // 5c. Every plugin has an explicit, non-empty, unique user-facing name, and
    //     the generated App Integrations categories never collide.
    for (const p of plugins) {
      const id = (p as any).id as string;
      assert(id in PLUGIN_DISPLAY_NAMES, `plugin '${id}' is missing from PLUGIN_DISPLAY_NAMES`);
      assert((PLUGIN_DISPLAY_NAMES[id] ?? "").trim().length > 0, `plugin '${id}' has an empty display name`);
    }
    const displayNames = Object.values(PLUGIN_DISPLAY_NAMES);
    assert(new Set(displayNames).size === displayNames.length, "PLUGIN_DISPLAY_NAMES contains duplicate display names");
    const pluginIds = new Set(plugins.map((p: any) => p.id as string));
    const unknownIds = Object.keys(PLUGIN_DISPLAY_NAMES).filter((id) => !pluginIds.has(id));
    assert(unknownIds.length === 0, `PLUGIN_DISPLAY_NAMES has unknown plugin ids: ${unknownIds.join(", ")}`);
    const categoryLabels = appIntegrations.actionCategories.map((c: any) => c.label);
    assert(new Set(categoryLabels).size === categoryLabels.length, "App Integrations has duplicate category labels");

    const catalog = JSON.parse(fs.readFileSync(path.join(tmpDir, "CorsairIntegrationCatalog.json"), "utf8"));
    const microsoftEntries = catalog.filter((entry: any) =>
      ["outlook", "teams", "onedrive", "sharepoint"].includes(entry.pluginId),
    );
    assert(microsoftEntries.length === 4, "M365 catalog is missing a Microsoft plugin");
    assert(microsoftEntries.every((entry: any) => entry.vaultCredentialType === "M365"), "Microsoft plugins do not share M365");
    assert(
      microsoftEntries.every((entry: any) => entry.pluginIds.join(",") === "onedrive,outlook,sharepoint,teams"),
      "M365 catalog does not contain the complete shared plugin family",
    );
    const m365Scopes = new Set(microsoftEntries[0].oauthConfig?.scopes ?? []);
    assert(m365Scopes.has("Mail.ReadWrite"), "M365 scopes are missing Outlook permissions");
    assert(m365Scopes.has("Chat.ReadWrite"), "M365 scopes are missing Teams permissions");
    assert(m365Scopes.has("Sites.FullControl.All"), "M365 scopes are missing SharePoint permissions");

    // 6. Every credential-select field name must use the canonical catalog vault credential
    //    type (VaultCredentialTypesEnum-compatible), never the display providerName.
    const vaultCredentialTypeByPlugin = new Map(
      catalog.map((entry: any) => [entry.pluginId, entry.vaultCredentialType]),
    );
    for (const file of configFiles) {
      const config = JSON.parse(fs.readFileSync(file, "utf8"));
      const credField = config.fields.find((f: any) => f.type === "credentials-select");
      if (!credField) continue;
      const pluginId = config.name.split("/")[1]?.toLowerCase();
      const expected = `__CredentialName__${vaultCredentialTypeByPlugin.get(pluginId)}`;
      assert(
        credField.name === expected,
        `config ${file} credential field '${credField.name}' does not match canonical vault credential type '${expected}'`,
      );
    }

    // 7. Gmail uses the hand-authored field mapping: shared fields resolve from
    //    one source, node-level overrides win, and other plugins are untouched.
    const gmailDir = path.join(configRoot, "Gmail");
    const readGmail = (file: string) =>
      JSON.parse(fs.readFileSync(path.join(gmailDir, file), "utf8"));
    const fieldOf = (config: any, name: string) =>
      config.fields.find((f: any) => f.name === name);

    const messagesList = readGmail("MessagesListConnector.json");
    assert(fieldOf(messagesList, "userId")?.label === "User", "Gmail userId label is not mapped");
    assert(
      (fieldOf(messagesList, "userId")?.description ?? "").length > 0,
      "Gmail userId description is empty",
    );
    assert(fieldOf(messagesList, "q")?.label === "Search Query", "Gmail q label is not mapped");

    // Raw message field documents its rules, example and Google reference.
    const messagesSend = readGmail("MessagesSendConnector.json");
    const rawField = fieldOf(messagesSend, "raw");
    assert(
      (rawField?.description ?? "").includes(
        "developers.google.com/workspace/gmail/api/guides/sending",
      ),
      "Gmail raw description is missing the Google reference URL",
    );
    assert(
      (rawField?.description ?? "").includes("Content-Type: text/plain") &&
        (rawField?.description ?? "").includes("{{body}}") &&
        (rawField?.description ?? "").includes("Content-Disposition: attachment") &&
        (rawField?.description ?? "").includes("Cc: {{cc}}") &&
        (rawField?.description ?? "").includes("Bcc: {{bcc}}") &&
        (rawField?.description ?? "").includes("Base64 Variant") &&
        (rawField?.description ?? "").includes("URL-safe"),
      "Gmail raw description is missing the message example or encoding rules",
    );

    // Shared field: same metadata resolves in a different node.
    const labelsList = readGmail("LabelsListConnector.json");
    assert(
      fieldOf(labelsList, "userId")?.description === fieldOf(messagesList, "userId")?.description,
      "Gmail userId does not resolve from a single shared source",
    );

    // Node-level field override: threads.get excludes the 'raw' format.
    const messagesGet = readGmail("MessagesGetConnector.json");
    assert(
      fieldOf(messagesGet, "format")?.label === "Response Format",
      "Gmail format label is not mapped",
    );
    const threadsGet = readGmail("ThreadsGetConnector.json");
    assert(
      (fieldOf(threadsGet, "format")?.description ?? "").includes("not supported for threads"),
      "Gmail ThreadsGet format node override was not applied",
    );

    // Node (command) description override.
    const messagesDelete = readGmail("MessagesDeleteConnector.json");
    assert(
      messagesDelete.description === "Permanently delete a message. This cannot be undone.",
      "Gmail MessagesDelete description override was not applied",
    );
    assert(
      !JSON.stringify(messagesDelete).includes("[DESTRUCTIVE"),
      "Gmail MessagesDelete still contains the bracketed Corsair marker",
    );

    // Selector mapping reflects the node override too.
    const gmailCategory = appIntegrations.actionCategories.find((c: any) => c.label === "Gmail");
    const deleteAction = gmailCategory?.actions.find(
      (a: any) => a.name === "Corsair/Gmail/MessagesDeleteConnector",
    );
    assert(
      deleteAction?.description === "Permanently delete a message. This cannot be undone.",
      "Gmail selector mapping did not apply the node description override",
    );

    // The same mapping enriches the generated tool OpenAPI specs (seeded into ai_Tools).
    const gmailSpec = JSON.parse(
      fs.readFileSync(path.join(configRoot, "openapi", "gmail.openapi.json"), "utf8"),
    );
    const schemaProps = (pathKey: string) =>
      gmailSpec.paths[pathKey].post.requestBody.content["application/json"].schema.properties;
    const listProps = schemaProps("/corsair/gmail/messages.list");
    assert(listProps.q?.title === "Search Query", "Gmail tool q title is not mapped");
    assert(
      (listProps.q?.description ?? "").includes("Gmail search query"),
      "Gmail tool q description is not mapped",
    );
    assert(listProps.userId?.title === "User", "Gmail tool userId title is not mapped");
    assert(
      schemaProps("/corsair/gmail/messages.get").format?.title === "Response Format",
      "Gmail tool format title is not mapped",
    );
    assert(
      gmailSpec.paths["/corsair/gmail/messages.delete"].post.description ===
        "Permanently delete a message. This cannot be undone.",
      "Gmail tool operation description override was not applied",
    );

    // 7d. Repo-wide OpenAPI behavior: field titles/descriptions are emitted for
    //     every plugin (previously the specs carried neither). Mapping wins where
    //     authored; otherwise the Corsair schema description is surfaced.
    const abstractSpec = JSON.parse(
      fs.readFileSync(path.join(configRoot, "openapi", "abstract.openapi.json"), "utf8"),
    );
    const abstractEmail =
      abstractSpec.paths["/corsair/abstract/email.validate"].post.requestBody.content[
        "application/json"
      ].schema.properties.email;
    assert(
      abstractEmail?.description === "The email address to validate",
      "non-mapped plugin schema field description was not surfaced in the tool OpenAPI spec",
    );

    // Fields with no authored/schema text stay unannotated (no invented titles).
    const githubSpec = JSON.parse(
      fs.readFileSync(path.join(configRoot, "openapi", "github.openapi.json"), "utf8"),
    );
    const githubOwner =
      githubSpec.paths["/corsair/github/issues.list"].post.requestBody.content["application/json"]
        .schema.properties.owner;
    assert(
      githubOwner?.title === undefined && githubOwner?.description === undefined,
      "field without authored or schema text should not gain a title/description",
    );

    // Non-mapped plugin keeps the humanized fallback.
    const githubDir = path.join(configRoot, "Github");
    const githubFile = fs.readdirSync(githubDir).find((f) => f.endsWith(".json"));
    assert(!!githubFile, "no Github config generated");
    const githubConfig = JSON.parse(fs.readFileSync(path.join(githubDir, githubFile as string), "utf8"));
    for (const field of githubConfig.fields) {
      if (field.type === "credentials-select" || field.direction === "Output") continue;
      assert(
        field.label === humanizeFieldKey(field.name),
        `non-mapped plugin field '${field.name}' label is not humanized`,
      );
    }

    console.log(`PASS: ${configFiles.length} configs, ${actionMap.length} invocations, ${appIntegrations.actionCategories.length} categories.`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
