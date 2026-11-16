import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

import { uiBuilderRuntimePlugin } from "../../clients/web-apps/apps/studio/ui-builder-runtime.plugin";
import {
  UI_BUILDER_ARCHETYPE_SKILL_NAME,
  UI_BUILDER_FRAMEWORK_SKILL_NAMES,
  buildUiBuilderFrameworkSystemPrompt,
  buildUiBuilderFrameworkUserContent,
} from "../../clients/web-apps/apps/studio/src/features/ui-builder/constants/ui-builder-framework.constant";
import {
  getUiBuilderLiteLlmProvider,
  toUiBuilderModelId,
} from "../../clients/web-apps/apps/studio/src/features/ui-builder/utils/ui-builder-model-routing.util";
import {
  UI_BUILDER_DEFAULT_THEME,
  describeUiBuilderTheme,
} from "../../clients/web-apps/apps/studio/src/features/ui-builder/constants/ui-builder-theme.constant";

type EvalPrompt = { id: string; archetype: string; prompt: string };

type Violation = { code: string; detail: string };

type EvalResult = {
  buildError?: string;
  staticResult?: { violations: Violation[]; warnings: Violation[] };
  diagnostics?: (Violation & { blocking: boolean })[];
  rendered?: { violations: Violation[] };
  runtimeErrors?: string[];
  timedOut?: boolean;
  builtBytes?: number;
  screenshots?: { desktop?: string; mobile?: string };
  milliseconds?: number;
};

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WEB_APPS = path.resolve(ROOT, "../../clients/web-apps");
const HOST_DIRECTORY = path.join(WEB_APPS, "packages/ui/src/components/ui-builder-host");
const { build } = createRequire(path.join(WEB_APPS, "package.json"))("esbuild") as typeof import("esbuild");

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};

const runName = option("run") ?? new Date().toISOString().replace(/[:.]/g, "-");
const runDirectory = path.join(ROOT, "outputs", runName);
const onlyIds = option("only")?.split(",");
const prompts = (JSON.parse(readFileSync(path.join(ROOT, "prompts.json"), "utf8")) as EvalPrompt[]).filter(
  (entry) => !onlyIds || onlyIds.includes(entry.id),
);

type EvalModel = { provider: string; model: string; credential: string | null; envType: string };

const ACCOUNTS_URL = process.env.UI_EVAL_ACCOUNTS_URL ?? "https://local-avintra.aventisia.com/accounts/api";
const WORKSPACE_URL = process.env.UI_EVAL_WORKSPACE_URL ?? "https://local-avintra.aventisia.com/workspace/api";
const LLM_URL = process.env.UI_EVAL_LLM_URL ?? "https://local-avintra.aventisia.com/llmpipeline/api/v2/llm/generate";

let requestHeaders: Record<string, string> = {};
let evalModel: EvalModel | null = null;

const login = async () => {
  const email = process.env.UI_EVAL_EMAIL;
  const password = process.env.UI_EVAL_PWD;
  if (!email || !password) return {};
  const response = await fetch(`${ACCOUNTS_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pwd: password }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: { accessToken?: string };
  };
  if (body.message === "TwoFA is enabled") {
    throw new Error("This account uses two-factor login; pass a session in UI_EVAL_HEADERS instead.");
  }
  if (!response.ok || !body.data?.accessToken) {
    throw new Error(`Login failed (${response.status}): ${body.message ?? "no access token"}`);
  }
  return { Authorization: `Bearer ${body.data.accessToken}` };
};

const resolveModel = async (): Promise<EvalModel> => {
  if (process.env.UI_EVAL_PROVIDER && process.env.UI_EVAL_MODEL) {
    return {
      provider: process.env.UI_EVAL_PROVIDER,
      model: process.env.UI_EVAL_MODEL,
      credential: process.env.UI_EVAL_CREDENTIAL ?? null,
      envType: requestHeaders["X-Env-Type"] ?? "dev",
    };
  }
  const response = await fetch(`${WORKSPACE_URL}/ui-builder/models`, { headers: requestHeaders });
  if (!response.ok) throw new Error(`Listing models failed (${response.status}).`);
  const rows = ((await response.json()) as {
    data?: { providerType: string; modelId: string; credentialName?: string | null; credentialEnvType?: string | null }[];
  }).data ?? [];
  const usable = rows.filter((row) => row.credentialName?.trim());
  const wanted = process.env.UI_EVAL_MODEL?.toLowerCase();
  const row = usable.find((entry) => !wanted || entry.modelId.toLowerCase().includes(wanted));
  if (!row) {
    throw new Error(
      `No tenant model with a credential${wanted ? ` matching "${wanted}"` : ""}. Available: ${usable.map((entry) => entry.modelId).join(", ") || "none"}.`,
    );
  }
  const provider = getUiBuilderLiteLlmProvider(row.providerType);
  return {
    provider,
    model: toUiBuilderModelId(provider, row.modelId),
    credential: row.credentialName ?? null,
    envType: row.credentialEnvType ?? "dev",
  };
};

const unwrapCodeFence = (output: string) =>
  (/^\s*```[a-zA-Z]*\s*\n([\s\S]*?)\n?```\s*$/.exec(output)?.[1] ?? output).trim();

const generate = async (entry: EvalPrompt) => {
  const model = evalModel!;
  const response = await fetch(LLM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...requestHeaders, "X-Env-Type": model.envType },
    body: JSON.stringify({
      provider: model.provider,
      model: model.model,
      input: [
        {
          role: "system",
          content: buildUiBuilderFrameworkSystemPrompt(describeUiBuilderTheme(UI_BUILDER_DEFAULT_THEME)),
        },
        { role: "user", content: buildUiBuilderFrameworkUserContent("", entry.prompt) },
      ],
      stream: false,
      is_byok_enabled: Boolean(model.credential),
      credential_name: model.credential,
      max_output_tokens: Number(process.env.UI_EVAL_MAX_OUTPUT_TOKENS ?? 16000),
      skill_names: [...UI_BUILDER_FRAMEWORK_SKILL_NAMES, UI_BUILDER_ARCHETYPE_SKILL_NAME],
      ref_type: "UiBuilder",
      ref_id: "ui-builder-eval",
      ref_name: "UI builder evaluation",
      action: "UiBuilderGeneration",
    }),
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  const body = (await response.json()) as { output?: unknown; error?: string | null };
  if (body.error) throw new Error(body.error);
  return unwrapCodeFence(String(body.output ?? ""));
};

const bundleHarness = async () => {
  const runtime = uiBuilderRuntimePlugin() as unknown as { load: (id: string) => Promise<string> | string };
  const result = await build({
    entryPoints: [path.join(ROOT, "harness/entry.ts")],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    nodePaths: [path.join(WEB_APPS, "node_modules")],
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "error",
    plugins: [
      {
        name: "ui-builder-eval",
        setup: (pluginBuild) => {
          pluginBuild.onResolve({ filter: /^virtual:ui-builder-runtime\// }, (resolveArgs) => ({
            path: resolveArgs.path,
            namespace: "ui-builder-runtime",
          }));
          pluginBuild.onLoad({ filter: /.*/, namespace: "ui-builder-runtime" }, async (loadArgs) => ({
            contents: await runtime.load(`\0${loadArgs.path}`),
            loader: "js",
          }));
          pluginBuild.onResolve({ filter: /^@avplatform\/ui\/ui-builder-host$/ }, () => ({
            path: "ui-builder-host",
            namespace: "ui-builder-host",
          }));
          pluginBuild.onLoad({ filter: /.*/, namespace: "ui-builder-host" }, () => ({
            contents: [
              `export * from ${JSON.stringify(path.join(HOST_DIRECTORY, "ui-builder-runtime.ts"))};`,
              `export * from ${JSON.stringify(path.join(HOST_DIRECTORY, "ui-builder-data.ts"))};`,
            ].join("\n"),
            resolveDir: HOST_DIRECTORY,
            loader: "ts",
          }));
        },
      },
    ],
  });
  return result.outputFiles[0].text;
};

const summarize = (entry: EvalPrompt, result: EvalResult) => {
  const blocking = [
    ...(result.buildError ? [{ code: "BUILD", detail: result.buildError }] : []),
    ...(result.staticResult?.violations ?? []),
    ...(result.diagnostics ?? []).filter((diagnostic) => diagnostic.blocking),
    ...(result.rendered?.violations ?? []),
  ];
  const notes = [
    ...(result.staticResult?.warnings ?? []),
    ...(result.diagnostics ?? []).filter((diagnostic) => !diagnostic.blocking),
  ];
  return {
    id: entry.id,
    archetype: entry.archetype,
    firstPassValid: blocking.length === 0,
    blocking: blocking.map((violation) => `${violation.code}: ${violation.detail}`),
    notes: notes.map((violation) => `${violation.code}: ${violation.detail}`),
    a11yViolations: (result.rendered?.violations ?? []).filter((violation) => violation.code === "V10").length,
    runtimeErrors: result.runtimeErrors?.length ?? 0,
    builtKb: Math.round((result.builtBytes ?? 0) / 1024),
    milliseconds: result.milliseconds ?? 0,
  };
};

const writeImage = (file: string, dataUrl?: string) => {
  if (dataUrl) writeFileSync(file, Buffer.from(dataUrl.split(",")[1] ?? "", "base64"));
};

const main = async () => {
  mkdirSync(runDirectory, { recursive: true });

  if (!flag("score-only")) {
    requestHeaders = { ...(await login()), ...JSON.parse(process.env.UI_EVAL_HEADERS ?? "{}") };
    evalModel = await resolveModel();
    console.log(`model: ${evalModel.provider} · ${evalModel.model} (credential ${evalModel.credential ?? "none"})`);
    writeFileSync(path.join(runDirectory, "model.json"), JSON.stringify(evalModel, null, 2));
    for (const entry of prompts) {
      process.stdout.write(`generate ${entry.id} … `);
      try {
        writeFileSync(path.join(runDirectory, `${entry.id}.jsx`), await generate(entry));
        console.log("ok");
      } catch (error) {
        writeFileSync(path.join(runDirectory, `${entry.id}.error.txt`), String(error));
        console.log(`failed: ${String(error).slice(0, 160)}`);
      }
    }
  }

  const executablePath =
    process.env.UI_EVAL_CHROMIUM ??
    readdirSync(path.join(homedir(), ".cache/ms-playwright"))
      .filter((name) => /^chromium-\d+$/.test(name))
      .map((name) => path.join(homedir(), ".cache/ms-playwright", name, "chrome-linux64/chrome"))
      .find((candidate) => existsSync(candidate));
  if (!executablePath) throw new Error("Set UI_EVAL_CHROMIUM to a Chromium executable.");

  const harness = await bundleHarness();
  const browser = await chromium.launch({ executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent("<!doctype html><html><body></body></html>", { waitUntil: "load" });
  await page.addScriptTag({ content: harness });

  const rows: ReturnType<typeof summarize>[] = [];
  for (const entry of prompts) {
    const sourceFile = path.join(runDirectory, `${entry.id}.jsx`);
    if (!existsSync(sourceFile)) continue;
    const source = readFileSync(sourceFile, "utf8");
    const result = (await page.evaluate(
      (code) => (window as unknown as { evaluateSource: (value: string) => Promise<unknown> }).evaluateSource(code),
      source,
    )) as EvalResult;
    writeImage(path.join(runDirectory, `${entry.id}.desktop.jpg`), result.screenshots?.desktop);
    writeImage(path.join(runDirectory, `${entry.id}.mobile.jpg`), result.screenshots?.mobile);
    const row = summarize(entry, result);
    rows.push(row);
    console.log(`score ${entry.id}: ${row.firstPassValid ? "valid" : `${row.blocking.length} blocking`}`);
  }
  await browser.close();

  const validCount = rows.filter((row) => row.firstPassValid).length;
  const report = [
    `# UI builder evaluation — ${runName}`,
    "",
    `Model: ${existsSync(path.join(runDirectory, "model.json")) ? JSON.parse(readFileSync(path.join(runDirectory, "model.json"), "utf8")).model : "?"}`,
    "",
    `First-pass valid: **${validCount}/${rows.length}** · a11y violations: ${rows.reduce((sum, row) => sum + row.a11yViolations, 0)} · runtime errors: ${rows.reduce((sum, row) => sum + row.runtimeErrors, 0)}`,
    "",
    "| Prompt | Archetype | Valid | Blocking | Notes | Built KB |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${row.id} | ${row.archetype} | ${row.firstPassValid ? "yes" : "no"} | ${row.blocking.length} | ${row.notes.length} | ${row.builtKb} |`,
    ),
    "",
    "## Problems",
    "",
    ...rows.flatMap((row) =>
      row.blocking.length + row.notes.length === 0
        ? []
        : [`### ${row.id}`, ...row.blocking.map((item) => `- **${item}**`), ...row.notes.map((item) => `- ${item}`), ""],
    ),
  ].join("\n");

  writeFileSync(path.join(runDirectory, "results.json"), JSON.stringify(rows, null, 2));
  writeFileSync(path.join(runDirectory, "report.md"), report);
  console.log(`\n${validCount}/${rows.length} first-pass valid. Report: ${path.join(runDirectory, "report.md")}`);
};

await main();
