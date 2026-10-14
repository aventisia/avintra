# Flow Assistant

Agent-flow chat that turns natural-language requests into reviewable graph proposals, and can
fill node configuration from the graph, curated catalog metadata, and tenant reference data.

## Boundaries and invariants

- **Agent flows only.** The server rejects non-Agent flows (`FlowAssistantService.ResolveAgentFlowAsync`).
- **Preview then apply.** The assistant never mutates the canvas directly; a proposal is shown on
  `GraphProposalCard` and applied as one undoable change via `useApplyGraphProposal`.
- **No secrets.** Prompts, requests, and proposals exclude credentials and credential-config fields.
- **Composite fields are user-managed.** Only scalar/simple field types are emitted by the generator
  (`text`, `textarea`, `number`, `select`, `checkbox`, `switch`, `email`, `color`, `time`, `slider`,
  `prompt-input`, `prompt-input-v2`); composite, `password`, `code-editor`, `json-editor`, queue, and
  credential-config fields are never offered to or set by the model.
- **Partial updates.** An `updateNode` operation changes only the fields present in the proposal spec;
  absent `inputs`/`outputs`/`label`/`name` are preserved (`buildNodePatch`).
- **Output variables stay in sync.** After apply, `applyOutputsToFlowVariables` merges each node's
  enabled outputs into `flowVariablesObject` (before auto-layout, so the single history snapshot
  captures it), matching manual config-panel behavior. Removed nodes are not pruned.
- **Curated model selection.** The panel header offers two curated models — Gemini 3.1 Flash Lite
  (default) and GPT-4o-mini. The choice travels as an opaque `modelId`, is persisted in `localStorage`,
  and is validated server-side against `FlowAssistantConstants.SupportedModels` (absent or unknown falls
  back to the default). OpenAI requests omit the shared `oneOf` proposal schema, which structured outputs
  reject, and rely on JSON mode plus server validation instead.
- **Clarification turns.** Discovery returns either a node selection or a `question`; the
  builder always returns a `proposal`, leaving unknown environment values unset. The server
  converts every missing required input across the proposed nodes into a structured `questions`
  SSE frame (`[{ key, label, nodeName, options }]`, options from select metadata), rendered by
  `QuestionsCard` with option buttons plus free-text inputs; answers return as one user message.
  The JSON schema forces either a `question` (with `question`) or a `proposal` (with non-empty
  `operations`). The server still converts an empty or missing `operations` array into a
  `question` SSE frame instead of a red error. Rejected proposals log the raw model JSON truncated
  to 2000 characters for observability.

## Reference data sources

`useFlowAssistantReferenceData.hook.ts` loads compact name lists, cached 5 minutes:

| Source          | API                                     | Notes                                                                                                                                                                                    |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Queues          | `getQueuesByAgent(flowVersionId)`       | **Intentionally agent-scoped.** The assistant edits one Agent flow, so only that agent's queues are valid choices; the global `getQueues()` list would offer queues the flow cannot use. |
| Agents          | `searchFlowVersions("", "Agent", true)` |                                                                                                                                                                                          |
| Blocks          | `getFlowBlocks(flowVersionId)`          | Non-production only.                                                                                                                                                                     |
| Model providers | `getTenantModelProviders()`             |                                                                                                                                                                                          |
| Skills          | `getSkillSelectOptions()`               |                                                                                                                                                                                          |
| Knowledge bases | `getKnowledgeBaseSelectOptions()`       |                                                                                                                                                                                          |

Reference-load failures degrade to empty lists; the assistant then asks a clarifying question.

## Generated artifacts

Run `npm run generate:flow-assistant-catalog` (studio) to regenerate from the action-selector
catalogs and DCP config JSON. It writes four files:

- `generated/flow-assistant-catalog.ts` and `WorkspaceAPIs/.../Generated/FlowAssistantCatalog.cs`
  (node allowlist + prompt grounding).
- `generated/flow-assistant-config-metadata.ts` and `WorkspaceAPIs/.../Generated/FlowAssistantConfigCatalog.cs`
  (compact fillable-field metadata consumed by client zod validation, server validation, and the prompt).

The generator writes JSON-quoted output, so run `prettier --write` (or studio `npm run pregit`) after
generating; `prettier --check` fails on the raw output. Do not edit generated files manually.
