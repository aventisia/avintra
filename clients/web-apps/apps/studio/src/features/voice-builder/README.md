# Voice builder

The Studio VoiceAgent editor. The builder writes into the single Voice AI node;
the saved graph is the only source of runtime settings.

## Engine modes

| `__EngineMode__Voice` | Builder fields                                                                                                                     | Runtime                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `pipeline` (default)  | Language model, TTS model and voice, STT model.                                                                                    | `voice_agent` pipeline through the LangGraph chat engine. |
| `realtime`            | Realtime model with provider, model, and BYOK credential, plus language, voice, and speed. STT, TTS, and pronunciation are hidden. | `voice_agent` provider speech-to-speech plugin.           |

The engine choice uses the same two-card selector as Opening. Realtime provider,
model, and credentials come from `ModelConfigField`; language, voice, and speed
come from the shared `__VoiceConfig__TextToSpeech` setting, so switching engines
reuses one voice configuration instead of duplicating it. Realtime preview is
hidden because the preview route synthesizes through a TTS model, not a realtime
model.

Realtime readiness requires a provider, a model, and a credential (name or id). The
provider allowlist is mirrored in three places: `EXECUTABLE_REALTIME_PROVIDERS`
(`dynamic-config-panel/constants/model-providers.ts`), `AllowedRealtimeProviders`
(WorkspaceAPIs `VoiceAgentGraphHelpers`), and `realtime_adapters.py`. Change all
three together, or Studio will offer a provider that the worker rejects.

The test console reads the saved engine mode and model label through
`VoiceAgentStudio`; it does not infer the engine from a hard-coded default.

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
