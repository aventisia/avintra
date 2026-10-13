using WorkspaceAPIs.Features.FlowAssistant.Generated;

using JsonSerializer = System.Text.Json.JsonSerializer;

namespace WorkspaceAPIs.Features.FlowAssistant.Constants;

/// <summary>
/// Fixed configuration and prompt/schema text for the flow assistant.
/// </summary>
public static class FlowAssistantConstants
{
    public const string DefaultModelId = "gemini-3.1-flash-lite";

    /// <summary>
    /// A curated chat model the flow assistant may call.
    /// </summary>
    public sealed record FlowAssistantModelOption(string Id, string Provider, string Model, string Label);

    public static readonly IReadOnlyList<FlowAssistantModelOption> SupportedModels = new FlowAssistantModelOption[]
    {
        new("gemini-3.1-flash-lite", "gemini", "gemini-3.1-flash-lite", "Gemini 3.1 Flash Lite"),
        new("gpt-4o-mini", "openai", "gpt-4o-mini", "GPT-4o-mini"),
    };

    public const int MaxGraphNodes = 300;

    public const int MaxGraphEdges = 600;

    public const int MaxOutputTokens = 4096;

    public const double Temperature = 1.0;

    public const double TopP = 1.0;

    private static readonly string[] AllowedNodeNames = FlowAssistantCatalog.AllowedNodes
        .Select(node => node.Name)
        .Distinct(StringComparer.Ordinal)
        .ToArray();

    private static readonly string[] AllowedNodeTypes = FlowAssistantCatalog.AllowedNodes
        .Select(node => node.Type)
        .Distinct(StringComparer.Ordinal)
        .ToArray();

    /// <summary>
    /// System prompt grounding the model on the curated allowlist, configuration fields, and output rules.
    /// </summary>
    public static string SystemPrompt { get; } = BuildSystemPrompt();

    /// <summary>
    /// JSON schema constraining the model output to a graph proposal or a clarification question.
    /// </summary>
    public static string ProposalJsonSchema { get; } = BuildProposalJsonSchema();

    /// <summary>
    /// OpenAI-compatible proposal schema whose root is an object, as OpenAI structured outputs require.
    /// </summary>
    public static string OpenAiProposalJsonSchema { get; } = BuildOpenAiProposalJsonSchema();

    private static string BuildSystemPrompt()
    {
        var allowlist = BuildAllowlistText();
        var configCatalog = BuildConfigCatalogText();

        return $@"You are the Flow Assistant for an automation platform. Translate the user's natural-language request into a single JSON graph proposal for a React Flow agent.

Respond with a JSON object only, matching the required schema. Never include markdown or prose.

Your goal is to return a proposal that builds the requested flow, filling every value you can infer. Return a question only to request an environment-specific value that the user alone can supply, such as a folder path, URL, credential, or environment name. Never ask the user for configuration values; fill them from the request or leave them unset for the user to configure in the panel.

Allowed node types. Use these exact type and name values and never invent others. Each entry is: node.type | node.name | label | description, where node.type and node.name are the exact tokens to emit and the label and description are display text for matching:
{allowlist}

Configuration fields. Each node may set ""inputs"" and ""outputs"" using only the exact field names listed below. Each entry is: NodeName: Field:type=default ...; a select field lists its options as type(option/option), and a trailing ! marks a required field. A required field with no non-empty default must be provided for new nodes; every other field is optional, and omitting it is valid and preferred because the user fills it later. Composite fields are managed by the user and must never be set. Choose select values from the listed options. Fill every value you can infer from the user's request, the conversation, the current graph, or the reference values, including instruction and prompt fields. Never invent values or use placeholder or example values.
{configCatalog}

Output fields:
- kind: either ""question"" or ""proposal"". Always set this.
- question: a single clarifying question. Ask only when the user must supply a value you cannot know, such as a folder path, URL, credential, or environment-specific name. Ask for those user-supplied values only. Do not guess.
- id: a unique string for this proposal.
- summary: one short sentence describing the change.
- mode: create to build a new action chain, or edit for incremental changes to the existing graph.
- operations: an array of change operations. Each operation has a type:
  - addNode: include a node object with id, type and name, plus optional label, description, inputs, outputs, and position.
  - updateNode: include a node object with the existing node id and the fields to change.
  - removeNode: include the existing node id.
  - addEdge: include an edge object with id, source and target, plus optional handles.
  - removeEdge: include the existing edge id.

Input and output values:
- inputs: an array of {{ ""key"": ""<field name>"", ""value"": <value> }} objects.
- outputs: an array of {{ ""key"": ""<field name>"", ""value"": {{ ""value"": <value>, ""enabled"": true|false }} }} objects.

Rules:
- Always set kind to ""question"" or ""proposal"".
- A question output contains only kind and question.
- A proposal output must include at least one operation. Never emit an empty or missing operations array; ask a clarifying question instead.
- Prefer a proposal. Fill every field you can infer and choose select values from the listed options.
- Never invent, guess, or placeholder an environment-specific value, even when the user's request names one. File system paths, folder paths, URLs, hostnames, credentials, and account or tenant names must come from the user.
- Ask a clarifying question instead of proposing only when the user must supply one or more of those environment-specific values. Ask for those values only and never about any other field.
- Never ask more than one question. Once the user answers your question, always return the proposal and omit the remaining optional fields.
- Never ask about prompt, instruction, filter, select, boolean, numeric, schema, output-format, or any other configuration field; infer it from the user's request or leave it unset.
- Fill prompt and instruction fields, including AI extraction prompts, from the user's request. Omit fields that reference another node's output, such as Files or a loop's items, and fields made irrelevant by other settings; never fabricate a reference expression.
- Only reference fields listed in the configuration catalog; never ask about providers, models, or other settings that are not listed.
- Example: for ""pick the docs from our shared drive and extract their text with AI"", ask only for the shared drive folder path.
- Use create only when the current graph has no action nodes; otherwise use edit.
- For create, propose the complete action chain. Do not add trigger or flow-end nodes or their edges; the application wires them automatically.
- For edit, propose only the incremental operations needed.
- New node id values are proposal-local; reference them consistently from edges.
- Edges must connect only existing node ids or new node ids from this proposal.
- Prefer a small, valid graph over an exhaustive one.";
    }

    private static string BuildAllowlistText()
    {
        var builder = new StringBuilder();
        foreach (var node in FlowAssistantCatalog.AllowedNodesForPrompt)
            builder.Append(node.Type).Append(" | ").Append(node.Name).Append(" | ").Append(node.Label).Append(" | ").Append(node.Description).Append('\n');

        return builder.ToString().TrimEnd('\n');
    }

    private static string BuildConfigCatalogText()
    {
        var builder = new StringBuilder();
        foreach (var node in FlowAssistantConfigCatalog.Nodes)
        {
            builder.Append(node.Name).Append(':');
            foreach (var field in node.Fields)
            {
                builder.Append(' ').Append(field.Name).Append(':').Append(field.Type);
                if (field.SelectOptions.Count > 0)
                    builder.Append('(').Append(string.Join('/', field.SelectOptions)).Append(')');
                if (field.DefaultValueJson is { Length: > 0 })
                    builder.Append('=').Append(field.DefaultValueJson);
                if (field.Required)
                    builder.Append('!');
            }

            builder.Append('\n');
        }

        return builder.ToString().TrimEnd('\n');
    }

    private static string BuildProposalJsonSchema()
    {
        var schema = new
        {
            oneOf = new object[]
            {
                new
                {
                    type = "object",
                    properties = new
                    {
                        kind = new { type = "string", @enum = new[] { "question" } },
                        question = new { type = "string", minLength = 1 },
                    },
                    required = new[] { "kind", "question" },
                },
                new
                {
                    type = "object",
                    properties = new
                    {
                        kind = new { type = "string", @enum = new[] { "proposal" } },
                        id = new { type = "string" },
                        summary = new { type = "string", maxLength = 400 },
                        mode = new { type = "string", @enum = new[] { "create", "edit" } },
                        operations = new
                        {
                            type = "array",
                            minItems = 1,
                            items = BuildOperationSchema(restrictNodesToAllowlist: false),
                        },
                    },
                    required = new[] { "kind", "id", "summary", "mode", "operations" },
                },
            },
        };

        return JsonSerializer.Serialize(schema);
    }

    private static string BuildOpenAiProposalJsonSchema()
    {
        var schema = new
        {
            type = "object",
            properties = new
            {
                kind = new { type = "string", @enum = new[] { "question", "proposal" } },
                question = new { type = "string" },
                id = new { type = "string" },
                summary = new { type = "string", maxLength = 400 },
                mode = new { type = "string", @enum = new[] { "create", "edit" } },
                operations = new
                {
                    type = "array",
                    minItems = 1,
                    items = BuildOperationSchema(restrictNodesToAllowlist: true),
                },
            },
            required = new[] { "kind" },
        };

        return JsonSerializer.Serialize(schema);
    }

    private static object BuildOperationSchema(bool restrictNodesToAllowlist)
    {
        object nodeTypeSchema = restrictNodesToAllowlist
            ? new { type = "string", @enum = AllowedNodeTypes }
            : new { type = "string" };
        object nodeNameSchema = restrictNodesToAllowlist
            ? new { type = "string", @enum = AllowedNodeNames }
            : new { type = "string" };

        return new
        {
            type = "object",
            properties = new
            {
                type = new
                {
                    type = "string",
                    @enum = new[] { "addNode", "updateNode", "removeNode", "addEdge", "removeEdge" },
                },
                node = new
                {
                    type = "object",
                    properties = new
                    {
                        id = new { type = "string" },
                        type = nodeTypeSchema,
                        name = nodeNameSchema,
                        label = new { type = "string" },
                        description = new { type = "string" },
                        inputs = new
                        {
                            type = "array",
                            items = new
                            {
                                type = "object",
                                properties = new
                                {
                                    key = new { type = "string" },
                                    value = new { },
                                },
                                required = new[] { "key", "value" },
                            },
                        },
                        outputs = new
                        {
                            type = "array",
                            items = new
                            {
                                type = "object",
                                properties = new
                                {
                                    key = new { type = "string" },
                                    value = new
                                    {
                                        type = "object",
                                        properties = new
                                        {
                                            value = new { },
                                            enabled = new { type = "boolean" },
                                        },
                                        required = new[] { "value", "enabled" },
                                    },
                                },
                                required = new[] { "key", "value" },
                            },
                        },
                        position = new
                        {
                            type = "object",
                            properties = new
                            {
                                x = new { type = "number" },
                                y = new { type = "number" },
                            },
                        },
                    },
                    required = new[] { "id", "type", "name" },
                },
                edge = new
                {
                    type = "object",
                    properties = new
                    {
                        id = new { type = "string" },
                        source = new { type = "string" },
                        target = new { type = "string" },
                        sourceHandle = new { type = "string" },
                        targetHandle = new { type = "string" },
                    },
                    required = new[] { "id", "source", "target" },
                },
                id = new { type = "string" },
            },
            required = new[] { "type" },
        };
    }
}
