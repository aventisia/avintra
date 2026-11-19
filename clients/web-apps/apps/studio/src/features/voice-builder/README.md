# Voice builder

The Studio VoiceAgent editor. The builder writes into the single Voice AI node;
the saved graph is the only source of runtime settings.

## Layout and gating

`VoiceBuilderForm` binds the node config form to the voice node and shows its
settings in tabs: Prompt, Engine, Context, Tools, and Pronunciation
(`VOICE_BUILDER_SECTION_META`). A tab that fails a required readiness check
carries a dot.

Publish (`PublishFlow`) and the test console (`VoiceTestConsole`) both read
`useVoicePendingChecks`. While the builder form is mounted it publishes its live
pending checks to `voice-builder.store`, because the form commits into the
canvas only at panel boundaries; otherwise, the hook computes the checks from
the voice node saved in the canvas store. The store resets when the form
unmounts.

## Engine modes

| `__EngineMode__Voice` | Builder fields                                                                                                                                                                | Runtime                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `pipeline` (default)  | Language model, TTS model and voice, STT model.                                                                                                                               | `voice_agent` pipeline through the LangGraph chat engine. |
| `realtime`            | Realtime model with provider, model, and BYOK credential, plus language, voice, and speed. STT and TTS are hidden; pronunciation is sent to the model as spoken instructions. | `voice_agent` provider speech-to-speech plugin.           |

The engine choice uses the same two-card selector as Opening. Realtime provider,
model, and credentials come from `ModelConfigField`; language, voice, and speed
come from `__VoiceConfig__RealtimeVoice` for realtime and
`__VoiceConfig__PipelineVoice` for pipeline, so each engine keeps its own choice.
The builder mirrors the active engine's setting into
`__VoiceConfig__TextToSpeech`, which the runtime reads for both modes; agents
saved before this split seed both engines from that shared value on load. The
builder is the only writer of the per-engine copies: the generic node panel
still reads and writes the shared setting alone.
Both engines show the credential picker. Languages and voices load from the
selected model's platform catalog, and from the attached credential's account
catalog once a credential is picked.
Realtime preview is hidden because the preview route synthesizes through a TTS
model, not a realtime model.

Realtime readiness requires a provider, a model, a credential name, and a voice.
The provider allowlist is mirrored in three places: `EXECUTABLE_REALTIME_PROVIDERS`
(`dynamic-config-panel/constants/model-providers.ts`), `AllowedRealtimeProviders`
(WorkspaceAPIs `VoiceAgentGraphHelpers`), and `realtime_adapters.py`. Change all
three together, or Studio will offer a provider that the worker rejects.

The test console reads the saved engine mode and model label through
`VoiceAgentStudio`; it does not infer the engine from a hard-coded default.

## Feedback in the builder

- A template applied on the Prompt tab is announced with an Undo action that
  puts back the goal, role, instructions, first speaker, and introduction. The
  toast no longer tells you to save, because a template is a draft edit like any
  other.
- Changing the provider or language clears the voice (and sometimes the
  language) that belonged to it. A note under the voice pickers says what was
  cleared until the next change. Picking a voice for the first time in a saved
  agent stays silent — those values are corrected, not discarded.
- Starting a test call saves the draft first. The call view shows "Saving
  draft…" while that save runs, and a failed save shows its error without
  starting a call.
- Loading failures are shown, not hidden: a configuration that cannot be loaded
  says "Configuration not found for this node." instead of spinning, a voice list
  that cannot be fetched shows an error line, the Pronunciation tab says its
  settings could not be loaded, and a preview button that cannot play says why.
  Spinners expose an accessible name, and a failed preview is announced to
  screen readers.

## Shared settings

`__PreemptiveGeneration__Voice` applies to pipeline calls only; realtime uses
provider turn detection. Noise cancellation is limited to `none` and `auto`:

- `auto` maps to browser noise suppression, echo cancellation, and auto gain
  control in `@avplatform/voice-client`.
- `none` turns browser capture processing off.
- `standard` and `telephony` are rejected at publish until the self-hosted
  server-side noise-cancellation decision lands. They are not offered in the
  builder.

The builder's readiness checks live in `utils/voice-builder.util.ts`; publish
validation in WorkspaceAPIs is authoritative and runs again on the server.
