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

## Rules that are easy to get wrong

- **Preview sandbox.** The generated HTML is rendered only through an iframe with
  `sandbox="allow-scripts"`. Never add `allow-same-origin`, `allow-top-navigation`, or any
  other sandbox token, and never render generated HTML with `dangerouslySetInnerHTML`.
- **Two models only.** GPT-4o mini (`openai`) and Gemini 3.1 Flash Lite (`googlegemini`).
  A model is selectable only when the tenant has it enabled for the `Text` capability;
  otherwise it is shown disabled with a reason, and generation is blocked when neither is
  enabled. The switcher ignores casing and extra spaces when checking enabled models; the
  exact model id is still sent for generation.
- **Gemini is enabled by default.** Gemini 3.1 Flash Lite is enabled for every tenant for
  the `Text` capability automatically at API startup, using platform credits. A tenant
  admin can still disable it.
- **Platform credits.** Requests force `is_byok_enabled = false`, force `stream = true`,
  and do not send a `conversation_id`.
