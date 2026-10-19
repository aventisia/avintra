# UI Builder (studio)

The left-panel prompt / right-panel preview screen reached from a workspace UI Builder
project row (`/studio/ui-builder?id=<projectId>`).

## How it works

- The left panel is the builder agent: an empty project shows starter prompts, each prompt is a
  user bubble (with the targeted selector when one was selected), and each assistant turn shows a
  live step timeline (see Agentic turns), the model used, and **Retry** on failure. The composer
  holds the model picker and the data-connection chip; Enter sends, Shift + Enter adds a line.
- Generation streams from the LLM pipeline. While it runs, the send button becomes
  **Stop**; stopping cancels the whole turn and shows "Generation stopped." with no version
  saved. Partial output is never rendered — the preview updates only once a checked version
  is ready.
- Each successful generation is saved as a new **version**. If the version save fails, a
  retry banner keeps the generated document in memory so it can be saved again.
- **Versions live in the studio header**, in the same top-bar version control a flow uses.
  The pill shows the current version; opening it lists every version, and each row can
  restore that version as the new current one. Restoring from the header updates the
  preview right away.
- The prompt panel and the preview are split by a draggable divider. Both sides resize,
  the chat never goes below 320px and the preview never below 256px, and neither side
  collapses. The split is remembered per user and project in localStorage under
  `studio-ui-builder-split:<userEmail>:<projectId>` and restored on the next open.
- The builder sends no conversation thread to the server: each request sends the system
  prompt plus the current HTML and the new prompt, and generated pages are never stored in
  the browser. The chat transcript is rebuilt from the saved versions plus this browser's
  own notes for the signed-in user and project, under the key
  `studio-ui-builder-chat:<userEmail>:<projectId>`. It therefore survives reload, leaving and
  returning, and switching projects, in the same browser. Failed, stopped, and error messages
  are kept, and a restored version appears as its own "Restored from version N" message. Only
  the last 200 messages are kept; **Clear history** (trash icon, click twice to confirm) empties the chat here, while the saved
  versions stay listed in the header.

## Preview toolbar

The right preview pane has a toolbar at its top. The preview renders on a canvas framed at
**Desktop**, **Tablet** (820px), or **Mobile** (390px) width; **Reload** remounts the interface.

- **Select.** Turn on Select, then click an element in the rendered interface. A chip showing
  that element's CSS selector appears above the chat box, and the next prompt you send is
  treated as a change to that element: its selector and HTML (capped at 2000 characters) are
  attached to the request, and the result is saved as a new version like any other. Without a
  selection, a prompt changes the whole page. The chip clears when you send, leave Select mode,
  or a newer version becomes current.
- **Edit Text.** With an element selected, Edit Text opens a small dialog pre-filled with that
  element's current text. Saving rewrites only that text and stores the result as a new version.
  The edit happens in the browser: it sends nothing to the model and spends no credits, and the
  transcript shows a marker such as `Manual text edit (<selector>): "<old>" → "<new>"`. Empty
  text is rejected, and a selector that no longer matches shows an error without saving anything.

## Preview / Code

The same toolbar has a **Preview / Code** switch. Preview (the default) shows the rendered
interface; Code shows the source read-only with a copy button. The switch lasts
only for the current visit — a reload returns to Preview — and it does not touch the split
layout, the chat, or any other saved setting.

## Output formats

The toolbar has a **React / HTML** switch. New projects start on **React**.

- **React (live).** The model writes one React function component. The studio only transpiles it
  (sucrase) — it never evaluates generated code on the studio origin. The saved page inlines the React
  18 runtime, the compiled component, and only the design-system CSS rules the source uses, and mounts
  the component **inside the sandboxed frame**, so state, effects, and event handlers work. An error
  boundary shows a friendly message and reports the error to the builder.
- **HTML.** The model writes one standalone document with inline CSS and JavaScript.
- **Switching format** on a project that already has versions rebuilds the current interface in the
  new format on the next prompt (the header says "next turn converts the format").
- **Edit Text** works on HTML versions only; on React, select the element and describe the change.
- **Source / Built.** In Code, a React version switches between the component source and the saved
  page.

## Agentic turns

Every prompt runs as one agent turn, shown as a step timeline in the chat:

1. **Draft** — a new page (or a format conversion) streams the full component or document. A prompt
   on an existing page runs as an **edit**: the model returns only `SEARCH`/`REPLACE` blocks for the
   lines it changes, the studio applies them to the head version, and everything else stays exactly
   as it was. A block whose `SEARCH` matches nowhere or more than once triggers one retry; if it
   still does not apply, nothing is saved. A reply that is a full document is accepted as a rewrite.
2. **Check in a sandbox** — static rules (single default export, no imports, no network APIs or
   external URLs, size caps), then a real render in an off-screen `allow-scripts` frame that catches
   runtime errors and feeds the rendered markup to accessibility checks. Data requests in this render
   get empty pages, so empty states are exercised. Utility classes outside the design system are
   reported as a note, not a failure.
3. **Repair** — only when the check fails: one repair pass with the numbered problems (as edit
   blocks on edit turns).
4. **Save** — nothing that still fails is saved.

All passes bill together as UI Builder usage. Stop cancels the whole turn. A pass is also stopped,
with nothing saved, when the model writes past its budget (edits: the larger of 20,000 characters
and the current code size; full drafts: 200,000) or sends nothing for 90 seconds. If the live preview later
hits a runtime error, a banner offers **Fix with AI**, which sends the error as the next prompt.

## Data connections

**Connect data** (header, composer, or toolbar) opens the data panel. Only the owner changes
connections; they are stored on the project (`PUT ui-builder/{id}/data-connections`).

- **Use an existing queue** — pick an environment (Development/Production) and a queue; its work item
  schema is shown read-only.
- **Design a new queue** — describe what the queue should hold; the model proposes a work item schema
  (fields, types, required, unique reference, extra outcome statuses) from the current interface. Edit
  it, choose who processes it (AI agents or people), and **Create queue & connect** creates the queue
  in place and binds it.
- **Generate sample data** (checked by default, 5/10/20 items) appears under the work item schema in
  both flows. On **Connect queue** / **Create queue & connect**, the selected model writes realistic
  items for the schema (a local generator fills in if no model is selected or the call fails); every
  item is coerced to the schema — field names, `int`/`Date`/`Array` types, required values, and unique
  references — and inserted through `POST queue/workitem`, so the queue's own validation applies. The
  preview reloads afterwards. Sample items are real work items: the panel warns that assigned agents
  may process them, and warns more strongly for Production queues. A seeding failure never undoes the
  saved connection.
- Each connection has a code name (`orders`), allowed operations (`list`, `get`, `add`, `update`),
  and a load mode (**automatically** on open, or **on request** from a button). After connecting,
  **Wire it up** prefills a prompt that asks the agent to bind the interface to the queue.
- Every generation receives the bound queues, their live schemas, statuses, and the runtime API, so
  generated code uses the exact field names:
  - React: `const orders = Avintra.useQueue("orders", { params: { status: "Pending", top: 50 } })`
    → `items`, `loading`, `error`, `refresh()`, `add(data)`, `update(id, { status, data })`.
  - HTML: `await Avintra.data.queue("orders").list({ status, top })`, `.get(id)`, `.add(data)`,
    `.update(id, patch)`.
- **Analytics run on the server.** Dashboards, KPIs, breakdowns, trends, and date-range views use
  `query(spec)` / `Avintra.useQueueQuery(key, spec)`, not `list`. A spec has shared `filters` (for
  example the selected date range on a schema date field) and up to 10 named `queries`, each either an
  aggregate (`groupBy` with optional `day|week|month|year` buckets, plus `metrics`: `count`,
  `countDistinct`, `sum`, `avg`, `min`, `max`, each with an optional `where` for conditional counts) or
  filtered rows (`sort`, `limit`). The backend validates every field against the queue schema, scans up
  to 100,000 newest items, and returns only the result rows, so the page never downloads the queue. A
  query is a read and is allowed whenever the connection allows `list`. Generation is told to use it
  for every aggregate and to route filter controls into the spec.
- **Every computed figure is explained.** Each query result carries a plain-language `description`
  per named query and a `formulas` entry per metric, written by the backend from the spec and the
  queue's field labels, including every filter in force (for example the selected date range). The
  host frame records each query it answers, and a **How numbers are calculated** button (studio header
  and Assist → User Interfaces) lists them, labelled with the spec's `title` / metric `label` hints,
  plus any page-computed values the spec declares under `derived` (`{ label, formula }`). Generated
  pages are also told to show an info hint beside each KPI, chart, and computed column, using
  `stats.formula(query, metric)`. The list resets when the version or preview reloads.
- **How data flows.** The frame posts a request to its host page (`@avplatform/ui/ui-builder-host`).
  The host refuses any connection key or operation the project does not allow, then calls the
  project-scoped proxy `ui-builder/{id}/data/{key}/...` with the connection's `X-Env-Type`. The
  backend authorizes by project access (builders, or assignees of the published interface), so the
  same interface works in the studio preview and in Assist → User Interfaces.

## Rules that are easy to get wrong

- **Preview sandbox.** The generated HTML is rendered only through an iframe with
  `sandbox="allow-scripts"`. Never add `allow-same-origin`, `allow-top-navigation`, or any
  other sandbox token, and never render generated HTML with `dangerouslySetInnerHTML`.
  - **Element-selection bridge.** Select mode works by injecting a small script into the HTML
    string just before it is displayed, so a click inside the sandboxed document can report the
    chosen element back. The script is added only at render time and is stripped before anything
    is saved, sent to the model, or shown in Code, so saved versions never contain it. The page
    accepts such a report only when it comes from the preview iframe and has the expected shape;
    anything else is ignored. The sandbox stays `allow-scripts`-only.
  - **React versions use the same sandbox.** A React version's built page is rendered in the same
    `allow-scripts`-only iframe as an HTML version. Its styles are precompiled and inlined, so it
    makes no external requests, and the saved page never contains the selection bridge.
- **Network is blocked inside the frame.** The host injects a content security policy
  (`default-src 'none'`, inline scripts and styles only, `data:`/`blob:` images) before rendering, and
  strips it before anything is saved. Data reaches an interface only through the host bridge.
- **Only tenant-credential models.** The composer's model picker lists only the `Text` models
  enabled in Tenant Admin > Models whose provider has a vault credential (`GET ui-builder/models`,
  available to every builder, not only tenant admins), grouped by provider with the credential name
  shown. Every generation sends `is_byok_enabled = true` with that `credential_name` and the
  credential's `X-Env-Type`, so it is billed by the provider. Models enabled without a credential —
  including platform models that would consume credits — are never offered. Generation uses the
  LiteLLM route `/v2/llm/generate`, so any provider LiteLLM supports works. With no such model, a
  warning explains how to add one and sending is disabled. The last chosen model is remembered per
  user.
- **The default Gemini model is not offered.** Gemini 3.1 Flash Lite is enabled for every tenant
  at API startup without a credential (platform credits), so the builder hides it. Configure the
  Gemini provider with a credential in Tenant Admin to use Gemini here.
- **Requests.** Generations stream (`stream = true`), send no `conversation_id`, and attach the
  `ui-design-system` and `ui-a11y-review` skills on React turns. Anthropic, Bedrock, and Vertex
  requests carry an explicit 16k output cap.
- **Publishing.** Publishing happens from the studio builder top bar, next to the preferences
  control. Only the project owner sees the button, and the project needs at least one version.
  The button publishes the current version and then shows a disabled **Published**; when a newer
  version exists the button re-enables, and publishing again updates what assignees see.
  **Disable** hides the project instead. Assignees see the published version read-only in
  Assist → User Interfaces. Everything above — versions, restore, split, chat history, sandbox,
  models, credits — is unchanged by publishing.
