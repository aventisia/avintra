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
        var allowlist = JsonSerializer.Serialize(
            FlowAssistantCatalog.AllowedNodesForPrompt.Select(node => new
            {
                type = node.Type,
                name = node.Name,
                label = node.Label,
                description = node.Description,
            }));

        var configCatalog = JsonSerializer.Serialize(
            FlowAssistantConfigCatalog.Nodes.Select(node => new
            {
                type = node.Type,
                name = node.Name,
                fields = node.Fields.Select(field => new
                {
                    name = field.Name,
                    direction = field.Direction,
                    type = field.Type,
                    label = field.Label,
                    required = field.Required,
                    defaultValue = ParseDefaultValue(field.DefaultValueJson),
                    selectOptions = field.SelectOptions.Count > 0 ? field.SelectOptions : null,
                }),
            }));

        return $@"You are the Flow Assistant for an automation platform. Translate the user's natural-language request into a single JSON graph proposal for a React Flow agent.

Respond with a JSON object only, matching the required schema. Never include markdown or prose.

Allowed node types. Use these exact type and name values and never invent others. Pick the entry whose label and description best match the user's intent:
{allowlist}

Configuration fields. Each node may set ""inputs"" and ""outputs"" using only the exact field names listed below. Fields marked required must be filled for new nodes unless a non-empty default is listed. Composite fields are managed by the user and must never be set. Choose select values from the listed options. Fill values you can infer from the conversation, the current graph, or the reference values; do not invent values.
{configCatalog}

Output fields:
- kind: either ""question"" or ""proposal"". Always set this.
- question: a single clarifying question. Use this instead of a proposal when a required value cannot be inferred from the conversation or the graph, or when no allowed node matches the request. Do not guess.
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
- Ask a clarifying question instead of guessing when a required value cannot be inferred or no allowed node matches the request.
- Use create only when the current graph has no action nodes; otherwise use edit.
- For create, propose the complete action chain. Do not add trigger or flow-end nodes or their edges; the application wires them automatically.
- For edit, propose only the incremental operations needed.
- New node id values are proposal-local; reference them consistently from edges.
- Edges must connect only existing node ids or new node ids from this proposal.
- Prefer a small, valid graph over an exhaustive one.";
    }

    private static object? ParseDefaultValue(string? defaultValueJson)
    {
        if (string.IsNullOrEmpty(defaultValueJson))
            return null;

        using var document = JsonDocument.Parse(defaultValueJson);
        return document.RootElement.Clone();
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
                            items = BuildOperationSchema(),
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
                    items = BuildOperationSchema(),
                },
            },
            required = new[] { "kind" },
        };

        return JsonSerializer.Serialize(schema);
    }

    private static object BuildOperationSchema() =>
        new
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
                        type = new { type = "string" },
                        name = new { type = "string" },
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
                    required = new[] { "id", "type" },
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
