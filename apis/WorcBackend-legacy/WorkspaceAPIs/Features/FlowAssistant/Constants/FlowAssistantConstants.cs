using WorkspaceAPIs.Features.FlowAssistant.Generated;

using JsonSerializer = System.Text.Json.JsonSerializer;

namespace WorkspaceAPIs.Features.FlowAssistant.Constants;

/// <summary>
/// Fixed configuration and prompt/schema text for the flow assistant.
/// </summary>
public static class FlowAssistantConstants
{
    public const string Provider = "gemini";

    public const string Model = "gemini-3.1-flash-lite";

    public const int MaxGraphNodes = 300;

    public const int MaxGraphEdges = 600;

    public const int MaxOutputTokens = 4096;

    public const double Temperature = 1.0;

    public const double TopP = 1.0;

    /// <summary>
    /// System prompt grounding the model on the curated allowlist and output rules.
    /// </summary>
    public static string SystemPrompt { get; } = BuildSystemPrompt();

    /// <summary>
    /// JSON schema constraining the model output to a graph proposal.
    /// </summary>
    public static string ProposalJsonSchema { get; } = BuildProposalJsonSchema();

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

        return $@"You are the Flow Assistant for an automation platform. Translate the user's natural-language request into a single JSON graph proposal for a React Flow agent.

Respond with a JSON object only, matching the required schema. Never include markdown or prose.

Allowed node types. Use these exact type and name values and never invent others. Pick the entry whose label and description best match the user's intent:
{allowlist}

Output fields:
- id: a unique string for this proposal.
- summary: one short sentence describing the change.
- mode: create to build a new action chain, or edit for incremental changes to the existing graph.
- operations: an array of change operations. Each operation has a type:
  - addNode: include a node object with id, type and name, plus optional label, description, inputs and position.
  - updateNode: include a node object with the existing node id and the fields to change.
  - removeNode: include the existing node id.
  - addEdge: include an edge object with id, source and target, plus optional handles.
  - removeEdge: include the existing edge id.

Rules:
- Use create only when the current graph has no action nodes; otherwise use edit.
- For create, propose the complete action chain. Do not add trigger or flow-end nodes or their edges; the application wires them automatically.
- For edit, propose only the incremental operations needed.
- New node id values are proposal-local; reference them consistently from edges.
- Edges must connect only existing node ids or new node ids from this proposal.
- Prefer a small, valid graph over an exhaustive one.";
    }

    private static string BuildProposalJsonSchema()
    {
        var schema = new
        {
            type = "object",
            properties = new
            {
                id = new { type = "string" },
                summary = new { type = "string" },
                mode = new { type = "string", @enum = new[] { "create", "edit" } },
                operations = new
                {
                    type = "array",
                    minItems = 1,
                    items = new
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
                                    inputs = new { type = "array", items = new { type = "object" } },
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
                    },
                },
            },
            required = new[] { "id", "summary", "mode", "operations" },
        };

        return JsonSerializer.Serialize(schema);
    }
}
