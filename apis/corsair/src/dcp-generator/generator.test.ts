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
import { github } from "@corsair-dev/github";
import { resend } from "@corsair-dev/resend";
import { tavily } from "@corsair-dev/tavily";
import { slack } from "@corsair-dev/slack";
import { stripe } from "@corsair-dev/stripe";
import { twilio } from "@corsair-dev/twilio";
import { notion } from "@corsair-dev/notion";
import { hubspot } from "@corsair-dev/hubspot";
import { openweathermap } from "@corsair-dev/openweathermap";
import { outlook } from "@corsair-dev/outlook";
import { generateDcpFiles } from "./index.js";

const plugins = [
  github(),
  resend(),
  tavily(),
  slack(),
  stripe(),
  twilio(),
  notion(),
  hubspot(),
  openweathermap(),
  outlook(),
] as const;

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

    console.log(`PASS: ${configFiles.length} configs, ${actionMap.length} invocations, ${appIntegrations.actionCategories.length} categories.`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
