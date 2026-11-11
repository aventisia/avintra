# Voice agent worker

`voice_agent` is the LiveKit Agents worker that serves one dispatched voice
call. `agent.py` validates the job binding and fetches the resolved settings;
`session_runtime.py` joins the room, runs the configured engine, publishes the
stable event contract, and cleans up once.

## Engines

| `engineMode` | Runtime |
| --- | --- |
| `pipeline` | Silero VAD + `stt_adapter` (LiteLLM, or ElevenLabs realtime Scribe) + `llm_adapter` (LangGraph chat engine) + `tts_adapter` (LiteLLM). |
| `realtime` | A LiveKit provider plugin that transcribes, reasons, and speaks end to end. No LiteLLM STT/TTS and no chat-engine call. |

Both engines publish the same `avintra.voice` events. Pipeline assistant
transcripts come from the chat-engine deltas; realtime assistant transcripts
come from LiveKit's `conversation_item_added`, and caller transcripts from
`user_input_transcribed`.

## Pipeline latency

`stt_adapter.py` selects `elevenlabs.STT(model="scribe_v2_realtime")` for that
model, resolving the key through the shared credential path. It streams interim
`transcript.interim` captions and keeps VAD turn detection; every other model
keeps `StreamAdapter(LiteLLMSTT)`. Streaming STT seconds are metered from
`STTMetrics`; the batch path meters itself inside the LiteLLM STT provider, so
the two never double-count. `preemptiveGeneration` in the resolved settings enables
LiveKit's preemptive LLM and TTS generation for pipeline agents only; realtime ignores it.

Turn timing adds `endpointing_ms` (caller stopped to final transcript) and
`caller_to_speaking_ms` (caller stopped to first audio) beside the existing
`stt_ms`, `llm_first_token_ms`, `tts_first_audio_ms`, and `turn_total_ms`. The
p50/p95 benchmark built on these fields is in
`app/features/voice_sessions/README.md`.

## Realtime providers

`realtime_adapters.py` is the only mapping from a resolved realtime setting to an
executable plugin. Realtime voice is BYOK only; the credential goes through the
same `resolve_credentials` path as the pipeline.

| Studio provider | Executed as | LiveKit plugin | Credential fields used |
| --- | --- | --- | --- |
| `openai` | `openai` | `openai.realtime.RealtimeModel` | `ApiKey`, optional `Url`/`Host` as base URL. |
| `azure` | `azure` | `openai.realtime.RealtimeModel.with_azure` | `ApiKey`, `Endpoint`, `ApiVersion`. The model is the Azure deployment name. |
| `googlegemini` (also `gemini`, `google`, `google_gemini`, `googleai`) | `gemini` | `google.beta.realtime.RealtimeModel` | `ApiKey`. |

Tenant model lists store LiteLLM model IDs (`openai/...`, `gemini/...`), so the
adapter strips the provider prefix before handing the model to the plugin.

The realtime voice and language come from the same TTS voice setting the Studio
realtime panel shows (`ttsVoice.voice` / `ttsVoice.language`).
`ttsVoice.speed` applies to the OpenAI and Azure realtime models, which expose a
speed multiplier; Gemini Live uses voice and language only. Provider-side turn
detection is used; the worker does not configure VAD for realtime.

An unknown or unwired provider is rejected before any provider client is
constructed. The allowlist mirrors `VoiceAgentGraphHelpers.AllowedRealtimeProviders`
in WorkspaceAPIs and `EXECUTABLE_REALTIME_PROVIDERS` in Studio, so publish and
runtime accept exactly the same providers.

## Realtime limits

- Live calls seed `ChatContext` from history capped by `memory.maxShortTermTurns`
  and persist finalized caller and assistant items. Test calls persist nothing;
  both modes write the terminal conversation status on close.
- BYOK usage posts `RealtimeModelMetrics` at session end and periodically on long
  calls, and does not fail the call when posting fails.
- Realtime exposes only `approval == "auto"` tool actions as LiveKit function
  tools and runs them through the shared `ToolExecutor`, so credentials, Corsair,
  Outlook, and custom OpenAPI behaviour match chat. Human-approval actions are
  omitted because a call has no approval UI.
- With `knowledgeBase.names` set, `search_knowledge` is registered and the model
  is told to search before product answers; retrieval happens on demand, not on
  every turn. Memory summarization arrives in a later phase.
- Enhanced noise cancellation (`standard` / `telephony`) is not wired in the
  worker. WorkspaceAPIs rejects both modes at publish, so only `none` and `auto`
  reach a session; the browser capture constraints follow the resolved mode.
