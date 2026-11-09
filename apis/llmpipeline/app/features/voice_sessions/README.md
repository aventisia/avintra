# Voice sessions

This feature runs one LiveKit voice call against a published or draft `VoiceAgent`
flow. The browser joins a LiveKit room; the `voice_agent` worker turns caller
speech into a conversation turn through the existing LangGraph chat engine and
speaks the answer back.

## Architecture

```
Browser ── LiveKit WebRTC ──> LiveKit room <── voice_agent worker
   │                                │              │
   │ data events (avintra.voice)    │              ├─ Silero VAD / LiveKit turn handling
   └────────────────────────────────┘              ├─ STT: LiteLLM provider, one WAV per utterance
                                                   ├─ VoiceChatBridge -> LangGraph chat engine
                                                   │    (persona, KB, skills, tools, memory, history)
                                                   └─ TTS: LiteLLM provider, sentence by sentence
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
  execution, KB retrieval, skills, and memory. The voice runtime is an adapter
  around it.

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
credential and rejects the job unless `flowVersionId`, `flowId`, and
`engineMode = pipeline` match.

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

`REALTIME_VOICE_ENABLED` belongs to the separate realtime gateway and does not
enable pipeline voice sessions.

## Event and error contract

The worker publishes JSON events on the LiveKit data topic `avintra.voice`.
Every event carries `type`, `conversationId`, and `timestamp`.

| Type | Fields | Meaning |
| --- | --- | --- |
| `session.state` | `state`, `previousState` | Stable state: `connecting`, `idle`, `listening`, `processing`, `speaking`. |
| `transcript.final` | `role`, `text`, `turnId` (assistant) | One final caller or assistant transcript. |
| `timing` | `stage`, `durationMs`, and turn fields | `stage = "session"` at close, or `stage = "turn"` with `turnId`, `interrupted`, and `voice_turn_timing`. |
| `tool.call` | `tool`, `turnId` | One engine tool call reported for the turn. |
| `error` | `code`, `message`, `retryable`, `turnId` | A non-silent failure report; the session may continue. |
| `session.closed` | `reason`, `code` | Terminal close with a close code. |

`voice_turn_timing` contains `stt_ms`, `llm_first_token_ms`,
`tts_first_audio_ms`, and `turn_total_ms`. The worker anchors turn timing after
the final STT response, so caller-speech-end to first audio is
`stt_ms + tts_first_audio_ms`; VAD endpointing time is not included. A failed or
interrupted turn can leave individual fields `null`.

Error codes reuse the realtime voice taxonomy:

| Code | Close | Meaning |
| --- | --- | --- |
| `invalid_config` | `4400` | STT, LLM, or TTS provider/model is missing. |
| `credentials_unavailable` | `4403` | BYOK is enabled but the credential name is missing. |
| `upstream_error` | `1011` | Provider, join, or runtime failure. `retryable` is currently `false`. |

A normal caller disconnect, job shutdown, or completed task closes with `1000`.
Provider failures are reported as `error` events and a `1011` close; a missing
provider configuration closes before the worker connects. A rejected job
(invalid metadata, expired credential, unreachable settings) emits no room
events because the worker never joins.

## Persistence and cleanup

- WorkspaceAPIs creates `run_Conversations` before dispatch with
  `Channel = Voice`, `FlowVersionId`, `UserId`, and `Status = Active`.
- The chat engine writes normal conversation messages for live sessions. Turn
  timing is merged into the latest assistant UI transcript row's metadata as
  `voice_turn_timing`. `test` sessions are temporary chats: they create and close
  the conversation row but do not persist messages or turn timing.
- On normal disconnect or job shutdown the worker closes the agent session,
  flushes queued events, deletes the LiveKit room, and writes `Completed`.
  Configuration errors, join failures, and runtime errors write `Failed`.
- The terminal status is written once even if several disconnect/error callbacks
  fire. Room deletion is also attempted on every failure path.
- If the API accepts a dispatch but no worker ever joins, no worker lifecycle
  runs; the conversation can remain `Active` after the room's 120-second empty
  timeout. Check the worker registration when a session has no agent participant.

## Testing

From `apis/llmpipeline`:

```sh
# Every voice suite (sessions, binding, STT, TTS, bridge, orchestration,
# persistence, interaction, and the realtime gateway)
./venv/Scripts/python.exe -m pytest tests -k voice -q

# Focused suites
./venv/Scripts/python.exe -m pytest tests/test_voice_sessions.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_worker_binding.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_stt.py tests/test_voice_tts.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_chat_bridge.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_orchestration.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_persistence.py -q
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

The `timing` event is the measurement source. For each completed non-interrupted
turn, use `voice_turn_timing`:

- caller speech end to first audio: `stt_ms + tts_first_audio_ms`;
- first token after STT: `llm_first_token_ms`;
- full turn: `turn_total_ms`.

Record at least ten representative turns across the supported first-speaker
modes and report p50 and p95. The target is approximately 1.5 seconds from
caller speech end to first audio. Split the result by stage before optimizing:
STT provider/network latency is outside the worker's turn loop, and a slow STT
call alone can exceed the target.

`tts_first_audio_ms` is recorded when TTS uses its streaming sentence path.
When LiveKit selects the chunked synthesis path the field is `null`; measure the
first audible agent frame in the client for those turns instead. Do not hide a
provider-limited result by reporting only `turn_total_ms`.

## Known v1 limits

- Pipeline mode only. The settings resolver rejects realtime agents; the
  realtime gateway is a separate feature.
- Voice conversations have no tool-approval UI. A tool action configured for
  human approval cannot be approved during a call: the worker speaks a fallback
  and keeps the turn closed. Only automatic actions run.
- Interrupted turns are not persisted; partial assistant audio/transcript is
  discarded. `resume_false_interruption` and preemptive generation are disabled.
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
