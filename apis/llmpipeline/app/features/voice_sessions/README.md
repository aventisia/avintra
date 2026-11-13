# Voice sessions

This feature runs one LiveKit voice call against a published or draft `VoiceAgent`
flow. The browser joins a LiveKit room; the `voice_agent` worker turns caller
speech into a conversation turn through the existing LangGraph chat engine and
speaks the answer back.

## Architecture

```
Browser ── LiveKit WebRTC ──> LiveKit room <── voice_agent worker
   │                                │              │
   │ data events (avintra.voice)    │              ├─ pipeline: Silero VAD / LiveKit turn handling
   └────────────────────────────────┘              │    ├─ STT: LiteLLM provider, one WAV per utterance
                                                   │    ├─ VoiceChatBridge -> LangGraph chat engine
                                                   │    │    (persona, KB, skills, tools, memory, history)
                                                   │    └─ TTS: LiteLLM provider, sentence by sentence
                                                   └─ realtime: provider plugin (OpenAI, Azure, Gemini)
                                                        (speech-to-speech, provider turn detection)
WorkspaceAPIs ── settings + conversation row ──> WorkspaceDb
       │
       └── POST /api/v2/voice/sessions ──> llmpipeline ──> LiveKit API
                                              (room, dispatch, caller token)
```

- **WorkspaceAPIs** owns the authenticated bootstrap. `POST /api/assist/voice/sessions`
  resolves the safe settings, creates the `run_Conversations` row with
  `Channel = Voice`, and proxies the session request to llmpipeline with the
  caller's bearer token.
- **llmpipeline** is the only service that holds LiveKit API credentials. It
  creates the room and agent dispatch, mints the caller token, and serves the
  worker's settings requests through WorkspaceAPIs.
- **voice_agent** is a LiveKit Agents worker. It validates its job binding,
  fetches the resolved settings, and runs the caller-bound session. It never
  receives the browser token or a provider secret.
- The chat engine remains the single owner of conversation history, tool
  execution, KB retrieval, skills, and memory for pipeline agents. The voice
  runtime is an adapter around it. Realtime agents run a provider
  speech-to-speech model instead and do not call the chat engine.

## Starting a session

1. The caller opens `POST /api/assist/voice/sessions` with
   `{ "flowVersionId": "<uuid>", "mode": "test" | "live" }` and a normal platform
   bearer token.
2. `test` resolves the current draft and is treated as a temporary chat; `live`
   requires a published, non-archived version.
3. WorkspaceAPIs creates the conversation row and calls llmpipeline
   `POST /api/v2/voice/sessions` with the same bearer token and the caller's
   `X-Env-Type` / `X-Space-Id`.
4. llmpipeline creates a room named `voice-<conversationId>-<suffix>`, dispatches the
   configured agent name with the binding metadata, and returns:

   ```json
   {
     "room_name": "voice-…",
     "server_url": "ws://localhost:7880",
     "client_token": "<LiveKit JWT>",
     "expires_in": 3600,
     "conversation_id": "…",
     "agent_name": "avintra-voice-agent",
     "mode": "test"
   }
   ```

5. The caller joins the room with `server_url` and `client_token`. The worker
   waits for the participant identity `user-<userId>` before starting audio.

WorkspaceAPIs adds the resolved `noiseCancellation` mode (`none` or `auto`) to its
session response. The browser client maps `auto` to browser noise suppression,
echo cancellation, and auto gain control, and turns those constraints off for
every other mode.

## Realtime engine

A realtime agent skips the pipeline: the worker opens a provider
speech-to-speech session through a LiveKit plugin, and that model transcribes,
answers, and speaks in one loop. The worker still owns the room, the stable
events, and clean shutdown.

- Providers: `openai`, `azure`, and `gemini` (Studio saves Gemini as
  `googlegemini`). Realtime is BYOK only; the credential resolves through the
  same path as the pipeline. The full matrix is in
  `apis/llmpipeline/voice_agent/README.md`.
- The persona, spoken-style guidance, and configured skill instructions become
  the agent instructions; the knowledge-search directive is added when a
  knowledge base is configured. An AI-first introduction is spoken with
  `generate_reply`, so the model delivers it naturally instead of reading a
  fixed string. The spoken introduction is published as an assistant
  `transcript.final`, so the caller sees the text that was actually spoken.
- Captions: caller transcripts come from `user_input_transcribed`; assistant
  transcripts come from `conversation_item_added`. Each assistant response also
  publishes a `timing` turn event with the provider's `ttft_ms` / `duration_ms`.
- Realtime uses the provider's own turn detection and interruption handling; the
  worker does not configure VAD for it.
- Live realtime calls persist finalized caller and assistant items, seed the
  model with the conversation history (capped by `memory.maxShortTermTurns`), and
  post BYOK usage from `RealtimeModelMetrics`. Test calls persist no messages
  but still publish timing and meter usage. Realtime tools run only actions
  configured for automatic approval, and knowledge search is on demand; memory
  summarization lands in a later phase. The conversation status is written on
  close.
- Noise cancellation resolves to `none` or `auto`. Enhanced modes are rejected
  at publish; see [Noise cancellation](#noise-cancellation).

## Noise cancellation

Production LiveKit is self-hosted, so LiveKit Cloud's built-in BVC noise
cancellation is not available. Phase 5 ships only the browser-side split:

| Mode | Behaviour |
| --- | --- |
| `none` | Browser capture processing is turned off. |
| `auto` | Browser noise suppression, echo cancellation, and auto gain control. |
| `standard`, `telephony` | Not implemented; rejected at publish and not offered in the Studio builder. |

`VoiceAgentGraphHelpers.AllowedNoiseCancellationModes` is the publish guard. The
resolved mode still reaches the browser so `none` and `auto` change capture
behaviour. The server-side follow-up is decision-recorded but not implemented:

> **Evaluate server-side noise cancellation for self-hosted LiveKit**
>
> - Production LiveKit runs self-hosted, so BVC is unavailable.
> - Evaluate the Krisp and ai-coustics LiveKit plugins for `standard` and
>   `telephony`, including latency and CPU cost per concurrent call.
> - Wire the chosen plugin in `voice_agent`, keep the browser capture
>   constraints for `auto`, and add a Bruno acceptance asset for each mode.
> - Licensing and cost need approval before implementation.
> - Remove the publish block only when a mode is wired end to end.

## Authentication and session claims

The platform bearer token is validated by both APIs. The caller token is a
LiveKit JWT with identity `user-<userId>`, the caller's username, a one-hour TTL,
and only `roomJoin`, `room`, `canPublish`, `canSubscribe`, and
`canPublishData` grants. It has no room-create or room-admin grant.

For each dispatch, llmpipeline also mints a short-lived worker credential
(HS512, 300 seconds, scope `voice-worker`). It carries the caller's platform
identity (`uid`, `tntid`, `uname`, `email`, space, environment) plus the session
binding (`flow_version_id`, `flow_id`, `conversation_id`, `room_name`, `mode`).
The dispatch metadata repeats that binding and embeds the credential. The worker
rejects the job before any provider call unless:

- the metadata version and all required fields are valid;
- the credential signature, issuer/audience, scope, and expiry are valid;
- every duplicated metadata claim matches the credential;
- the job's agent name matches `LIVEKIT_AGENT_NAME`;
- the job arrives in the room named by the credential.

The worker then fetches
`GET /api/assist/voice/settings/<flowVersionId>?mode=<mode>` with the worker
credential and rejects the job unless `flowVersionId` and `flowId` match and the
resolved `engineMode` is `pipeline` or `realtime`. A realtime provider that the
worker does not wire is rejected before any provider client is constructed; the
provider matrix lives in `apis/llmpipeline/voice_agent/README.md`.

## Local start order

From the checkout or worktree root:

```sh
scripts/setup.sh                 # setup.ps1 on Windows: env files and dependencies
dekit up                         # WorkspaceAPIs, llmpipeline, database-backed services
dekit start livekit              # not autostarted
dekit start voice_agent          # not autostarted; start it after LiveKit
```

LiveKit's dev server is `dekit start livekit` (ports 7880/tcp for HTTP and
WebSocket signaling, 7881/tcp and 7882/udp for WebRTC). `dekit start voice_agent`
must run after LiveKit has registered; if you restart the worker, wait until its
log says `registered worker` before creating a session.

In `apis/llmpipeline/.env.local` set the dev key pair that matches the LiveKit
server, and point the worker at the local WorkspaceAPIs when the local stack is
not reached through nginx:

```sh
LIVEKIT_WS_URL=ws://localhost:7880
LIVEKIT_HTTP_URL=http://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_AGENT_NAME=avintra-voice-agent

# Direct local APIs (the default builds https://<APP_BASE_URL>/api instead)
WORKSPACE_API_URL=https://localhost:4001/api
```

Only llmpipeline and the worker need the `LIVEKIT_*` values. WorkspaceAPIs
reaches llmpipeline through its existing `LLMPIPELINE_API_BASE_URL`; it never
holds a LiveKit credential.

Restart `llmpipeline_apis` and `voice_agent` after changing `.env.local`.

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `LIVEKIT_HTTP_URL` | llmpipeline | LiveKit HTTP API URL (room and dispatch). |
| `LIVEKIT_WS_URL` | llmpipeline, worker | WebSocket URL returned to the caller and used by the worker. |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | llmpipeline, worker | LiveKit API credentials. Never expose these to the browser. |
| `LIVEKIT_AGENT_NAME` | llmpipeline, worker | Dispatch/registration name; defaults to `avintra-voice-agent`. |
| `WORKSPACE_API_URL` | worker | WorkspaceAPIs base including `/api`; defaults to `https://<APP_BASE_URL>/api`. |
| `APP_BASE_URL` | llmpipeline, worker | Default WorkspaceAPIs host and worker-token issuer/audience. |
| `JWT_SECRET_KEY` | llmpipeline, worker | Signs the short-lived worker credential. |
| `SSL_VERIFY` | worker | Set `false` only for a local self-signed WorkspaceAPIs certificate. |
| `POSTGRESQL_WORKSPACE_DB_NAME` | worker | Workspace database holding conversations and messages. |
| Provider keys / BYOK credential names | llmpipeline | Resolved by the existing LiteLLM STT/TTS/LLM providers; no separate voice provider configuration. |

## Event and error contract

The worker publishes JSON events on the LiveKit data topic `avintra.voice`.
Every event carries `type`, `conversationId`, and `timestamp`.

| Type | Fields | Meaning |
| --- | --- | --- |
| `session.state` | `state`, `previousState` | Stable state: `connecting`, `idle`, `listening`, `processing`, `speaking`. |
| `transcript.final` | `role`, `text`, `turnId` (pipeline assistant only) | One final caller or assistant transcript. Realtime assistant transcripts carry no `turnId` yet. |
| `transcript.interim` | `role`, `text` | Live caller caption from a streaming STT; replaced by the final transcript. |
| `timing` | `stage`, `durationMs`, and turn fields | `stage = "session"` at close, or `stage = "turn"` with `turnId`, `interrupted`, and `voice_turn_timing`. Realtime turn events carry no `turnId` yet. |
| `tool.call` | `tool`, `turnId` | One engine tool call reported for the turn. |
| `skill.call` | `skill`, `turnId` | One configured skill active for the call; emitted when the session starts. |
| `error` | `code`, `message`, `retryable`, `turnId` | A non-silent failure report; the session may continue. |
| `session.closed` | `reason`, `code` | Terminal close with a close code. |

Pipeline `voice_turn_timing` contains `stt_ms`, `llm_first_token_ms`,
`tts_first_audio_ms`, `turn_total_ms`, `endpointing_ms` (caller stopped to final
transcript), and `caller_to_speaking_ms` (caller stopped to first audio).
Realtime timing leaves those fields `null` and fills `ttft_ms` and `duration_ms`
from `RealtimeModelMetrics`. A failed or interrupted turn can leave individual
fields `null`.

Error codes come from `voice_agent/contracts.py`:

| Code | Close | Meaning |
| --- | --- | --- |
| `invalid_config` | `4400` | A required provider/model setting is missing. |
| `unsupported_provider` | `4400` | The realtime provider has no wired LiveKit plugin. |
| `credentials_unavailable` | `4403` | BYOK is enabled but the credential name is missing or unresolvable. |
| `upstream_error` | `1011` | Provider, join, or runtime failure. `retryable` is currently `false`. |

A normal caller disconnect, job shutdown, or completed task closes with `1000`.
Provider failures are reported as `error` events and a `1011` close; a missing
provider configuration closes before the worker connects. A rejected job
(invalid metadata, expired credential, unreachable settings) emits no room
events because the worker never joins.

## Persistence and cleanup

- WorkspaceAPIs creates `run_Conversations` before dispatch with
  `Channel = Voice`, `FlowVersionId`, `UserId`, and `Status = Active`.
- Live sessions persist messages: the chat engine writes pipeline turns, and the
  realtime worker writes finalized caller and assistant items. Pipeline turn
  timing is merged into the latest assistant UI transcript row's metadata as
  `voice_turn_timing`; realtime timing stays in the assistant message metadata.
  `test` sessions are temporary chats: they create and close the conversation
  row but do not persist messages or turn timing.
- On normal disconnect or job shutdown the worker closes the agent session,
  flushes queued events, deletes the LiveKit room, and writes `Completed`.
  Configuration errors, join failures, and runtime errors write `Failed`.
- The terminal status is written once even if several disconnect/error callbacks
  fire. Room deletion is also attempted on every failure path.
- If the API accepts a dispatch but no worker ever joins, no worker lifecycle
  runs; the conversation can remain `Active` after the room's 120-second empty
  timeout. Check the worker registration when a session has no agent participant.

## Metering

- Realtime: `RealtimeUsageRecorder` accumulates audio tokens (input and output)
  and provider-reported session seconds from `RealtimeModelMetrics`, then posts
  BYOK usage at session end and every `USAGE_FLUSH_INTERVAL_SECONDS` on a long
  call. It posts only when BYOK is enabled with a credential name; a failed post
  is logged and never breaks the call.
- Streaming pipeline STT: `StreamingSTTUsageRecorder` posts the `STTMetrics`
  audio seconds. The batch LiteLLM STT path posts its own usage inside the
  provider, so the two paths never double-count.
- Pipeline LLM and TTS usage stays on the existing chat and LiteLLM paths.
- `test` calls meter the same way as `live` calls; only message persistence
  differs.

## Testing

From `apis/llmpipeline`:

```sh
# Every voice suite (sessions, binding, STT, TTS, bridge, orchestration,
# persistence, interaction, and realtime)
./venv/Scripts/python.exe -m pytest tests -k voice -q

# Focused suites
./venv/Scripts/python.exe -m pytest tests/test_voice_sessions.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_worker_binding.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_stt.py tests/test_voice_tts.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_chat_bridge.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_orchestration.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_persistence.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_realtime.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_latency.py -q
```

On Linux/macOS use `./venv/bin/python`. The settings-resolution harness runs
from the repository root:

```sh
dotnet run --project shared/ExecutorLibrary.Tests
```

For a manual acceptance run, use the Bruno requests in
`tests/bruno/WorkspaceAPIs/voice-sessions/` to log in, read the settings, and
create a session. Join the returned room with the LiveKit console/CLI, then
verify the row in `run_Conversations`, its `Voice` channel and `FlowVersionId`,
and (for live mode) the final messages and `voice_turn_timing` metadata.

## Latency measurement

The `timing` event and each live turn's persisted `voice_turn_timing` are the
measurement source. The claim is caller speech end to first audio, so report
these fields per stage:

| Stage | Field |
| --- | --- |
| Endpointing | `endpointing_ms` — caller stopped speaking to final transcript |
| STT | `stt_ms` — final speech-to-text call duration |
| First token | `llm_first_token_ms` (realtime: `ttft_ms`) |
| First audio | `tts_first_audio_ms` |
| End-to-end | `caller_to_speaking_ms` (realtime: `ttft_ms`) |

Target: p95 end-to-end ≤ 800 ms over at least ten representative turns per
configuration. Split the result by stage before optimizing: provider and network
latency is outside the worker's turn loop, and a slow STT or endpointing wait
alone can exceed the target.

`tts_first_audio_ms` is recorded when TTS uses its streaming sentence path.
When LiveKit selects the chunked synthesis path the field is `null`; measure the
first audible agent frame in the client for those turns instead. Never report a
latency number from `turn_total_ms` alone: it measures the completed turn, not
the wait the caller hears.

### Benchmark

Run one local call per configuration (batch pipeline, streaming pipeline, and
realtime) with at least ten turns each, then from `apis/llmpipeline`:

```sh
./venv/Scripts/python.exe -m voice_agent.latency \
  batch=<conversationId,...> streaming=<conversationId,...> realtime=<conversationId,...>
```

Conversation ids come from `run_Conversations` (`Channel = Voice`); only `live`
calls persist timing. The script prints the table below. Realtime reports
provider `ttft_ms` as both first token and end-to-end, because it has no
caller-speech-end reference.

| Configuration | Turns | STT p50 / p95 (ms) | Endpointing p50 / p95 (ms) | First token p50 / p95 (ms) | First audio p50 / p95 (ms) | End-to-end p50 / p95 (ms) |
| --- | --- | --- | --- | --- | --- | --- |
| batch | — | — | — | — | — | — |
| streaming | — | — | — | — | — | — |
| realtime | — | — | — | — | — | — |

The table is not yet recorded on this checkout. Fill it from a local stack run
before quoting a latency number.

## Remaining manual checks

1. Publish a realtime draft with `none` and then `auto`; both must succeed.
2. Change the draft's noise cancellation to `standard`; publish must return
   `Voice agent noise cancellation mode 'standard' is not available yet.
   Supported modes: auto, none.`
3. Run a Studio `test` call and a Workspace `live` call against a realtime agent
   with a BYOK OpenAI or Gemini key; confirm audio, captions, `Completed`
   status, persisted live messages, and one BYOK usage row per call.
4. Run the same calls for a pipeline agent and confirm the pipeline path,
   interim captions, and `voice_turn_timing` are unchanged.
5. Run at least ten turns per configuration and fill the benchmark table. Until
   then, do not quote an 800 ms result.

## Known v1 limits

- Realtime agents apply configured skills, run `approval == "auto"` tools, and
  search knowledge on demand, but do not summarize memory yet; memory arrives in
  a later phase.
  Persistence, history seeding, and BYOK usage already work, but realtime
  assistant transcripts carry no `turnId`.
- Voice conversations have no tool-approval UI. A tool action configured for
  human approval cannot be approved during a call: the worker speaks a fallback
  and keeps the turn closed. Only automatic actions run.
- Interrupted turns are not persisted; partial assistant audio/transcript is
  discarded. `resume_false_interruption` is disabled; preemptive generation
  follows the agent setting, which defaults on for new agents.
- Turn timing is best-effort metadata. A missing assistant transcript row or a
  failed TTS call leaves timing fields unset.
- `test` sessions deliberately do not persist messages or turn timing, so a
  full persistence check needs a published `live` version.
- Events are live data packets, not a replay log; a UI that joins late misses
  earlier events and must load persisted messages separately.
- A dispatch that never reaches a worker leaves the conversation `Active`; there
  is no reconciler yet.
- No SIP/telephony entry point is included; callers must join the returned
  LiveKit room.
- Enhanced noise cancellation is not implemented. `standard` and `telephony`
  are rejected at publish; only the browser-level `none` / `auto` split exists.
