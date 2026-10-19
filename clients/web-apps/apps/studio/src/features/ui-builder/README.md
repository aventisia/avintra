# UI Builder (studio)

The left-panel prompt / right-panel preview screen reached from a workspace UI Builder
project row (`/studio/ui-builder?id=<projectId>`).

## How it works

- The left panel is a chat transcript: each prompt is a user bubble, and the assistant
  bubble streams generation progress (live output length) until the document is complete.
- Generation streams from the LLM pipeline. While it runs, the Send button becomes
  **Stop**; stopping cancels the request and shows "Generation stopped." with no version
  saved. Partial output is never rendered — the preview updates only once a full document
  is received.
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
  the last 200 messages are kept; **Clear history** empties the chat here, while the saved
  versions stay listed in the header.

## Preview toolbar

The right preview pane has a toolbar at its top.

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
interface; Code shows the same document as read-only HTML with a copy button. The switch lasts
only for the current visit — a reload returns to Preview — and it does not touch the split
layout, the chat, or any other saved setting.

## React output (framework versions)

The toolbar has an **HTML / React** switch. New projects start on HTML (the single-document
path above). Choosing **React** generates a React component instead, and the builder turns it
into the page you see.

- **One action, several steps.** A React turn drafts the component, checks it, and — only when
  the check finds problems — runs one repair step, then saves the result. Each step shows as
  its own line in the chat (`Drafting…`, `Checking quality…`, `Fixing…`). All steps bill
  together as normal UI Builder usage.
- **Nothing broken is saved.** The check runs before a version is written. A React turn that
  still fails the check saves no version and says why. Stopping part-way stops the whole turn.
- **Static page.** The component is rendered once into plain HTML. It does not run effects and
  its event handlers are dropped, so only a component's initial state shows. React versions
  look complete but are not interactive.
- **Edit Text is unavailable on React versions.** Manual text editing rewrites the rendered
  HTML, which the next rebuild would discard, so the button is disabled here.
- **Source / Built.** In Code, a React version switches between **Source** (the generated
  component) and **Built** (the page that is saved and rendered). Source is the default.
- **Restore stays within a format.** A version can be restored only when its format matches the
  current head; otherwise Restore is disabled with the reason.
- The switch follows the current version: after a new version is saved the toolbar shows that
  version's format, and changing the switch clears any unsaved draft.

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
- **Model selection comes from Tenant Admin.** The chat panel has **Model Provider** and
  **Model** dropdowns filled only from the models the tenant has enabled for the `Text`
  capability in Tenant Admin > Models. The Model list shows that provider's models by their
  raw model id, and the builder keys a selection by provider plus model id so the same id on
  two providers cannot be confused. With no enabled supported model, a warning asks you to
  enable models and Send is disabled.
- **Not every provider can be used yet.** Providers the model pipeline does not route (for
  example Groq, Mistral, Bedrock, or Ollama Cloud) appear disabled with the reason "Not
  supported by the builder yet" and are never sent for generation. The builder starts on the
  first supported provider and its first enabled model; no model is hardcoded.
- **Gemini is enabled by default.** Gemini 3.1 Flash Lite is enabled for every tenant for
  the `Text` capability automatically at API startup, using platform credits. A tenant
  admin can still disable it.
- **Platform credits.** Requests force `is_byok_enabled = false`, force `stream = true`,
  and do not send a `conversation_id`.
- **Publishing.** Publishing happens from the studio builder top bar, next to the preferences
  control. Only the project owner sees the button, and the project needs at least one version.
  The button publishes the current version and then shows a disabled **Published**; when a newer
  version exists the button re-enables, and publishing again updates what assignees see.
  **Disable** hides the project instead. Assignees see the published version read-only in
  Assist → User Interfaces. Everything above — versions, restore, split, chat history, sandbox,
  models, credits — is unchanged by publishing.
