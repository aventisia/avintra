// IMPORTANT NOTE: Run via `npm run generate:flow-assistant-catalog`; the studio
// `pregit` script regenerates the committed artifacts so they never drift.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const studioRoot = resolve(scriptDirectory, "..");
const repositoryRoot = resolve(studioRoot, "../../../..");

const baseCatalogPath = resolve(
  studioRoot,
  "src/features/action-selector/constants/_ActionSelectorData.json",
);
const aiCatalogPath = resolve(
  studioRoot,
  "src/features/action-selector/constants/_AIIntegrationsActionSelectorData.json",
);
const activityConfigDirectory = resolve(
  studioRoot,
  "src/features/dynamic-config-panel/constants/config-json",
);
const customConfigDirectory = resolve(
  studioRoot,
  "src/features/dynamic-config-panel/constants/custom-config-json",
);
const typescriptOutputPath = resolve(
  studioRoot,
  "src/features/flow-assistant/generated/flow-assistant-catalog.ts",
);
const csharpOutputPath = resolve(
  repositoryRoot,
  "apis/WorcBackend-legacy/WorkspaceAPIs/Features/FlowAssistant/Generated/FlowAssistantCatalog.cs",
);
const configTypescriptOutputPath = resolve(
  studioRoot,
  "src/features/flow-assistant/generated/flow-assistant-config-metadata.ts",
);
const configCsharpOutputPath = resolve(
  repositoryRoot,
  "apis/WorcBackend-legacy/WorkspaceAPIs/Features/FlowAssistant/Generated/FlowAssistantConfigCatalog.cs",
);

const ALLOWED_TYPES = new Set(["activityNode", "aiNode", "conditionalNode", "forLoopNode"]);

const EXCLUDED_NODE_KEYS = new Set([
  "aiNode:CreateConversationAIAgent",
  "aiNode:CreateVoiceAIAgent",
  "breakLoopNode:BreakLoopNode",
  "callAgentNode:CallAgentNode",
  "blockNode:CallBlockNode",
]);

const CUSTOM_CONFIG_NODE_NAMES = new Set([
  "ConditionalActivity",
  "ConditionalBranchActivity",
  "LoopActivity",
]);

const FILLABLE_FIELD_TYPES = new Set([
  "text",
  "textarea",
  "number",
  "select",
  "checkbox",
  "switch",
  "email",
  "color",
  "time",
  "slider",
  "prompt-input",
  "prompt-input-v2",
]);

const AI_NODE_INPUTS = {
  CreateInferencingAIAgent: [
    {
      key: "__ModelConfig__Inferencing",
      value: {
        is_byok_enabled: false,
        provider: "openai",
        credential_name: "",
        model: "gpt-4o-mini",
        temperature: 1,
        top_p: 1,
        max_output_tokens: null,
        reasoning_effort: "medium",
      },
    },
  ],
  CreateSTTAIAgent: [
    {
      key: "__ModelConfig__SpeechToText",
      value: {
        is_byok_enabled: false,
        provider: "elevenlabs",
        credential_name: "",
        model: "scribe_v2",
      },
    },
  ],
  CreateTTSAIAgent: [
    {
      key: "__ModelConfig__TextToSpeech",
      value: {
        is_byok_enabled: false,
        provider: "elevenlabs",
        credential_name: "",
        model: "eleven_v3",
      },
    },
  ],
};

const readCatalog = (path) => JSON.parse(readFileSync(path, "utf8"));

const flattenCatalog = (catalog) => {
  const actions = [];
  for (const levelOne of catalog) {
    for (const levelTwo of levelOne.actionCategories ?? []) {
      for (const action of levelTwo.actions ?? []) {
        actions.push(action);
      }
    }
  }
  return actions;
};

const isProductionHidden = (action) =>
  Array.isArray(action.doNotRenderIf) && action.doNotRenderIf.includes("production");

const toCatalogEntry = (action) => {
  const entry = {
    type: action.type,
    name: action.name,
    label: action.label,
    description: action.description,
  };

  if (action.img !== undefined) entry.img = action.img;
  if (action.icon !== undefined) entry.icon = action.icon;
  if (action.supportedPlatforms !== undefined) entry.supportedPlatforms = action.supportedPlatforms;
  if (AI_NODE_INPUTS[action.name]) entry.inputs = AI_NODE_INPUTS[action.name];

  return entry;
};

const buildCatalog = () => {
  const actions = [
    ...flattenCatalog(readCatalog(baseCatalogPath)),
    ...flattenCatalog(readCatalog(aiCatalogPath)),
  ];

  const entries = [];
  const seen = new Set();
  for (const action of actions) {
    const key = `${action.type}:${action.name}`;
    if (!ALLOWED_TYPES.has(action.type)) continue;
    if (action.disabled === true) continue;
    if (isProductionHidden(action)) continue;
    if (EXCLUDED_NODE_KEYS.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push(toCatalogEntry(action));
  }

  return entries;
};

const resolveConfigPath = (nodeName) => {
  if (CUSTOM_CONFIG_NODE_NAMES.has(nodeName)) {
    return resolve(customConfigDirectory, `${nodeName}.json`);
  }
  if (nodeName.includes("AIAgent")) {
    return resolve(customConfigDirectory, "ai-config-json", `${nodeName}.json`);
  }
  return resolve(activityConfigDirectory, `${nodeName}.json`);
};

const readConfigFields = (nodeName) => {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(resolveConfigPath(nodeName), "utf8"));
  } catch {
    return [];
  }
  const fields = Array.isArray(parsed) ? parsed : parsed.fields;
  return Array.isArray(fields) ? fields : [];
};

const isEmptyDefault = (value) => value === undefined || value === null || value === "";

const isScalarDefault = (value) =>
  (typeof value === "string" && value.length > 0) ||
  typeof value === "number" ||
  typeof value === "boolean";

const toConfigField = (field) => {
  const meta = {
    name: field.name,
    direction: field.direction,
    type: field.type,
    label: field.label ?? field.name,
  };

  if (
    field.direction === "Input" &&
    field.required === true &&
    !field.renderIf &&
    isEmptyDefault(field.defaultValue)
  ) {
    meta.required = true;
  }

  if (isScalarDefault(field.defaultValue)) meta.defaultValue = field.defaultValue;

  if (field.type === "select" && Array.isArray(field.selectOptions)) {
    const options = field.selectOptions
      .map((option) => option?.value)
      .filter((value) => value !== undefined);
    if (options.length > 0) meta.selectOptions = options;
  }

  return meta;
};

const buildConfigMetadata = (entries) =>
  entries.map((entry) => ({
    type: entry.type,
    name: entry.name,
    fields: readConfigFields(entry.name)
      .filter((field) => FILLABLE_FIELD_TYPES.has(field.type))
      .map(toConfigField),
  }));

const csharpStringLiteral = (value) => JSON.stringify(value);

const buildTypescript = (entries) => {
  const header = [
    "// IMPORTANT NOTE: Generated by scripts/generate-flow-assistant-catalog.mjs. Do not edit manually.",
    "",
    'import { NodeDataType } from "@/types/node-data-type";',
    "",
    "/** Production node catalog the flow assistant may propose. */",
    "export const FLOW_ASSISTANT_NODE_ALLOWLIST: NodeDataType[] = ",
  ].join("\n");

  return `${header}${JSON.stringify(entries, null, 2)};\n`;
};

const buildConfigTypescript = (configMetadata) => {
  const header = [
    "// IMPORTANT NOTE: Generated by scripts/generate-flow-assistant-catalog.mjs. Do not edit manually.",
    "",
    'import { CustomNodeType } from "@/types/custom-node-type";',
    "",
    "/** A fillable node configuration field the flow assistant may set. */",
    "export type FlowAssistantConfigField = {",
    "  name: string;",
    '  direction: "Input" | "Output";',
    "  type: string;",
    "  label: string;",
    "  required?: boolean;",
    "  defaultValue?: string | number | boolean;",
    "  selectOptions?: string[];",
    "};",
    "",
    "/** Fillable configuration metadata for one grounded node. */",
    "export type FlowAssistantNodeConfigMetadata = {",
    "  type: CustomNodeType;",
    "  name: string;",
    "  fields: FlowAssistantConfigField[];",
    "};",
    "",
    "/** Fillable node configuration the flow assistant may set. */",
    "export const FLOW_ASSISTANT_CONFIG_METADATA: FlowAssistantNodeConfigMetadata[] = ",
  ].join("\n");

  return `${header}${JSON.stringify(configMetadata, null, 2)};\n`;
};

const buildCsharp = (entries) => {
  const nodeLines = entries
    .map(
      (entry) =>
        `            (${csharpStringLiteral(entry.type)}, ${csharpStringLiteral(entry.name)}),`,
    )
    .join("\n");
  const promptLines = entries
    .map(
      (entry) =>
        `            (${csharpStringLiteral(entry.type)}, ${csharpStringLiteral(entry.name)}, ${csharpStringLiteral(entry.label)}, ${csharpStringLiteral(entry.description)}),`,
    )
    .join("\n");

  return `// IMPORTANT NOTE: Generated by clients/web-apps/apps/studio/scripts/generate-flow-assistant-catalog.mjs. Do not edit manually.

namespace WorkspaceAPIs.Features.FlowAssistant.Generated;

/// <summary>
/// Generated grounding catalog for the flow assistant.
/// </summary>
public static class FlowAssistantCatalog
{
    /// <summary>
    /// Node type and name pairs the assistant may propose.
    /// </summary>
    public static readonly IReadOnlyList<(string Type, string Name)> AllowedNodes =
        new List<(string Type, string Name)>
        {
${nodeLines}
        };

    /// <summary>
    /// Node type, name, label, and description tuples that ground the system prompt.
    /// </summary>
    public static readonly IReadOnlyList<(string Type, string Name, string Label, string Description)> AllowedNodesForPrompt =
        new List<(string Type, string Name, string Label, string Description)>
        {
${promptLines}
        };
}
`;
};

const buildConfigCsharp = (configMetadata) => {
  const nodeBlocks = configMetadata
    .map((node) => {
      const fieldLines = node.fields
        .map((field) => {
          const defaultValueJson =
            field.defaultValue === undefined
              ? "null"
              : csharpStringLiteral(JSON.stringify(field.defaultValue));
          const selectOptions =
            field.selectOptions && field.selectOptions.length > 0
              ? `new List<string> { ${field.selectOptions.map((option) => csharpStringLiteral(option)).join(", ")} }`
              : "new List<string>()";
          return `                new(${csharpStringLiteral(field.name)}, ${csharpStringLiteral(field.direction)}, ${csharpStringLiteral(field.type)}, ${csharpStringLiteral(field.label)}, ${field.required === true ? "true" : "false"}, ${defaultValueJson}, ${selectOptions}),`;
        })
        .join("\n");

      return `            new(${csharpStringLiteral(node.type)}, ${csharpStringLiteral(node.name)}, new List<FlowAssistantConfigField>
            {
${fieldLines}
            }),`;
    })
    .join("\n");

  return `// IMPORTANT NOTE: Generated by clients/web-apps/apps/studio/scripts/generate-flow-assistant-catalog.mjs. Do not edit manually.

namespace WorkspaceAPIs.Features.FlowAssistant.Generated;

/// <summary>
/// A fillable node configuration field the flow assistant may set.
/// </summary>
public sealed record FlowAssistantConfigField(
    string Name,
    string Direction,
    string Type,
    string Label,
    bool Required,
    string? DefaultValueJson,
    IReadOnlyList<string> SelectOptions);

/// <summary>
/// Fillable configuration metadata for one grounded node.
/// </summary>
public sealed record FlowAssistantNodeConfig(string Type, string Name, IReadOnlyList<FlowAssistantConfigField> Fields);

/// <summary>
/// Generated fillable node configuration catalog for the flow assistant.
/// </summary>
public static class FlowAssistantConfigCatalog
{
    /// <summary>
    /// Fillable configuration metadata for grounded nodes.
    /// </summary>
    public static readonly IReadOnlyList<FlowAssistantNodeConfig> Nodes =
        new List<FlowAssistantNodeConfig>
        {
${nodeBlocks}
        };
}
`;
};

const entries = buildCatalog();
const configMetadata = buildConfigMetadata(entries);

mkdirSync(dirname(typescriptOutputPath), { recursive: true });
mkdirSync(dirname(csharpOutputPath), { recursive: true });
mkdirSync(dirname(configTypescriptOutputPath), { recursive: true });
mkdirSync(dirname(configCsharpOutputPath), { recursive: true });
writeFileSync(typescriptOutputPath, buildTypescript(entries));
writeFileSync(csharpOutputPath, buildCsharp(entries));
writeFileSync(configTypescriptOutputPath, buildConfigTypescript(configMetadata));
writeFileSync(configCsharpOutputPath, buildConfigCsharp(configMetadata));

const fieldCount = configMetadata.reduce((total, node) => total + node.fields.length, 0);
console.log(
  `Generated ${entries.length} grounded nodes and ${fieldCount} fillable configuration fields.`,
);
