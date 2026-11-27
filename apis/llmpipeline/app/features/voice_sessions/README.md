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
- **voice_agent** is a LiveKit Agents worker hosted by llmpipeline. It starts in
  the API event loop when LiveKit is configured, validates its job binding,
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
2. `test` resolves the current draft; `live` requires a published, non-archived
   version. Both persist their conversation and messages.
3. WorkspaceAPIs creates the conversation row and calls llmpipeline
   `POST /api/v2/voice/sessions` with the same bearer token and the caller's
   `X-Env-Type` / `X-Space-Id`.
4. llmpipeline verifies that the conversation belongs to the caller (same tenant,
   user, space, and flow version, `Voice` channel, still `Active`) and returns 404
   otherwise; a finished conversation cannot be replayed to start a new room. It
   then creates a room named `voice-<conversationId>-<suffix>`, dispatches the
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
   waits up to 30 seconds for the participant identity `user-<userId>` before
   starting audio; if the caller never arrives, the worker deletes the room and
   marks the conversation `Failed`.

A user may hold at most two active voice conversations. WorkspaceAPIs counts
that user's `Voice` conversations with `Status = Active` and a heartbeat within
the last three minutes; a third concurrent create returns 429. A crashed call
stops blocking after three minutes because its heartbeat stops, and a create
that is cancelled or cannot reach llmpipeline marks its row `Failed` right away.
The count spans every space of the user, so switching spaces does not raise the
cap. Raise `MAX_ACTIVE_VOICE_SESSIONS_PER_USER` (WorkspaceAPIs, default 2) only
for a load test.

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
- Realtime calls persist finalized caller and assistant items, seed the model
  with the conversation history (capped by `memory.maxShortTermTurns`) on live
  calls, and post BYOK usage from `RealtimeModelMetrics`. Test calls persist
  messages and timing too, but start without prior history. Realtime tools run
  only actions configured for automatic approval, and knowledge search is on
  demand; memory summarization lands in a later phase. The conversation status
  is written on close.
- Noise cancellation resolves to `none` or `auto`. Enhanced modes are rejected
  at publish; see [Noise cancellation](#noise-cancellation).

## Noise cancellation

Voice sessions use only the `none` and `auto` modes, so LiveKit Cloud's built-in
BVC noise cancellation is not wired in. Phase 5 ships only the browser-side split:

| Mode | Behaviour |
| --- | --- |
| `none` | Browser capture processing is turned off. |
| `auto` | Browser noise suppression, echo cancellation, and auto gain control. |
| `standard`, `telephony` | Not implemented; rejected at publish and not offered in the Studio builder. |

`VoiceAgentGraphHelpers.AllowedNoiseCancellationModes` is the publish guard. The
resolved mode still reaches the browser so `none` and `auto` change capture
behaviour. The server-side follow-up is decision-recorded but not implemented:

> **Evaluate server-side noise cancellation**
>
> - BVC is available on LiveKit Cloud but is not wired into the session; a
>   self-hosted deployment needs a plugin.
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
scripts/setup.sh                                      # setup.ps1 on Windows: env files and dependencies
docker compose -f deploy/livekit/docker-compose.yml up -d
dekit up                                              # WorkspaceAPIs, llmpipeline, database-backed services
```

LiveKit runs independently in Docker (ports 7880/tcp for HTTP and WebSocket
signaling, 7881/tcp and 7882/udp for WebRTC). `llmpipeline_apis` starts the
voice worker automatically once `LIVEKIT_WS_URL`, `LIVEKIT_API_KEY`, and
`LIVEKIT_API_SECRET` are set, and stops it with the API. No separate worker
service is needed.

In `apis/llmpipeline/.env.local` set the dev key pair that matches the LiveKit
server, and point the worker at the local WorkspaceAPIs when the local stack is
not reached through nginx:

```sh
LIVEKIT_WS_URL=ws://localhost:7880
LIVEKIT_HTTP_URL=http://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_AGENT_NAME=avintra-voice-agent

# Direct local APIs (the default builds https://<APP_BASE_URL>/workspace/api instead;
# local bypasses nginx, so the path is /api, not /workspace/api)
WORKSPACE_API_URL=https://localhost:4001/api
```

Only llmpipeline and the worker need the `LIVEKIT_*` values. WorkspaceAPIs
reaches llmpipeline through its existing `LLMPIPELINE_API_BASE_URL`; it never
holds a LiveKit credential.

Restart `llmpipeline_apis` after changing `.env.local`.

### LiveKit Cloud

The same worker runs against LiveKit Cloud; only the URL pair and key pair change.
Setting one URL derives the other, so the cloud project's WebSocket URL is enough:

```sh
LIVEKIT_WS_URL=wss://<project>.livekit.cloud
LIVEKIT_API_KEY=<cloud key>
LIVEKIT_API_SECRET=<cloud secret>
```

Production sets these in the process environment, not `.env.local`, which loads only
when `ENV=local`; the root `README.md` lists the outbound rules voice media needs.
Clients join `wss://<project>.livekit.cloud` directly; do not run `deploy/livekit`
in production.

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `LIVEKIT_HTTP_URL` | llmpipeline, worker | Server-side LiveKit URL: rooms, dispatch, and the worker's registration (as `ws://`/`wss://`). Set it to an internal address, such as `http://livekit:7880` in Docker, so the worker joins the server that hosts the rooms. Derived from `LIVEKIT_WS_URL` when unset. |
| `LIVEKIT_WS_URL` | llmpipeline | WebSocket URL returned to the caller; derived from `LIVEKIT_HTTP_URL` when unset. |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | llmpipeline, worker | LiveKit API credentials. Never expose these to the browser. |
| `LIVEKIT_AGENT_NAME` | llmpipeline, worker | Dispatch/registration name; defaults to `avintra-voice-agent`. |
| `LIVEKIT_NUM_IDLE_PROCESSES` | worker | Warm job processes kept ready; defaults to `2`. Each one holds its full RSS. |
| `LIVEKIT_JOB_MEMORY_WARN_MB` / `LIVEKIT_JOB_MEMORY_LIMIT_MB` | worker | Per-job memory warning and hard kill threshold; the limit defaults to `0` (off). |
| `WORKSPACE_API_URL` | worker | WorkspaceAPIs base including `/workspace/api`; defaults to `https://<APP_BASE_URL>/workspace/api`. |
| `APP_BASE_URL` | llmpipeline, worker | Default WorkspaceAPIs host and worker-token issuer/audience. |
| `JWT_SECRET_KEY` | llmpipeline, worker | Signs the short-lived worker credential. |
| `SSL_VERIFY` | worker | Set `false` only for a local self-signed WorkspaceAPIs certificate. |
| `POSTGRESQL_WORKSPACE_DB_NAME` | worker | Workspace database holding conversations and messages. |
| `MAX_ACTIVE_VOICE_SESSIONS_PER_USER` | WorkspaceAPIs | Concurrent active calls one user may hold; defaults to `2`. Raise only for a load test. |
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
- Sessions persist messages: the chat engine writes pipeline turns, and the
  realtime worker writes finalized caller, assistant, and tool items. Pipeline
  turn timing is merged into the latest assistant UI transcript row's metadata as
  `voice_turn_timing`; realtime timing stays in the assistant message metadata.
  `test` and `live` sessions share this path.
- On normal disconnect or job shutdown the worker closes the agent session,
  flushes queued events, deletes the LiveKit room, and writes `Completed`.
  Configuration errors, join failures, and runtime errors write `Failed`.
- The caller join is bounded. If the worker joins the room but never sees
  `user-<userId>`, it waits `CALLER_JOIN_TIMEOUT_SECONDS` (30 seconds), publishes
  an `error` and `session.closed`, deletes the room, and writes `Failed`, so the
  agent participant cannot keep an abandoned room open.
- If the caller leaves after joining but before the agent session starts, the
  worker skips or cancels the pending start, deletes the room, and writes
  `Completed` with reason `participant_disconnected`. `RoomIO` waits for a linked
  participant without a timeout, so the worker races that wait against the
  disconnect.
- The terminal status is written once even if several disconnect/error callbacks
  fire. Room deletion is also attempted on every failure path.
- The browser also ends the row through
  `POST /assist/voice/sessions/{conversationId}/end` on hang-up, start timeout,
  failed join, or dispose. WorkspaceAPIs marks it `Completed` at once, so a
  dispatch that never got a worker cannot hold the per-user cap for the sweep
  window.
- Teardown is bounded by `FINISH_TIMEOUT_SECONDS` (20 seconds), and the terminal
  status is persisted before the slow provider/room closes. A close that never
  returns therefore cannot hold a worker job process and starve later dispatches.
  A timed-out teardown retries room deletion best-effort, itself bounded by
  `DELETE_ROOM_TIMEOUT_SECONDS` (5 seconds).
- A call is capped at `MAX_CALL_DURATION_SECONDS` (1 hour, aligned to the caller
  token TTL). The worker closes it with reason `max_duration`, writes
  `Completed`, and deletes the room.
- While a call is live, the worker refreshes the conversation's
  `LastModifiedOn` every `USAGE_FLUSH_INTERVAL_SECONDS` (60 seconds). A quiet
  call is therefore never mistaken for a dead one.
- llmpipeline runs a reconciler every `VOICE_RECONCILE_INTERVAL_SECONDS`
  (300 seconds). It marks `Voice` conversations that are still `Active` with a
  heartbeat older than `VOICE_HEARTBEAT_STALE_SECONDS` (600 seconds) as
  `Failed`, which covers a dispatch or worker that dies without running
  teardown. Several replicas may run the sweep; the update is idempotent.
- llmpipeline supervises its worker: an unexpected `run()` exit is restarted
  after a 5 s to 60 s capped backoff, and a requested shutdown never restarts.
- If the API accepts a dispatch but no worker ever picks it up, no worker
  lifecycle runs; the reconciler marks the row `Failed` within about 15 minutes
  (10 minutes stale plus the 5-minute sweep). LiveKit reclaims the room on its
  own timers (20 seconds after the last participant leaves, 120 seconds if
  nobody ever joins). Check the worker registration when a session has no agent
  participant.

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
- `test` calls meter the same way as `live` calls.

## Testing

From `apis/llmpipeline`:

```sh
# Every voice suite (sessions, binding, STT, TTS, bridge, orchestration,
# persistence, reconciler, interaction, and realtime)
./venv/Scripts/python.exe -m pytest tests -k voice -q

# Focused suites
./venv/Scripts/python.exe -m pytest tests/test_voice_sessions.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_worker_binding.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_stt.py tests/test_voice_tts.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_chat_bridge.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_orchestration.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_persistence.py -q
./venv/Scripts/python.exe -m pytest tests/test_voice_reconciler.py -q
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
and the final messages and `voice_turn_timing` metadata.

## Stress and teardown verification

`voice_agent.stress` measures concurrent-call setup and teardown against a live
stack. It creates sessions through WorkspaceAPIs, joins each room as the caller,
holds the calls, disconnects, and polls the LiveKit room list until every room
is gone. A call counts as joined only when the agent participant appears within
`--join-timeout`.

```sh
./venv/Scripts/python.exe -m voice_agent.stress \
  --flow-version-id <flow-version-id> \
  --sessions 8 --ramp 5 --hold 120 --join-timeout 120
```

`--ramp` spaces session starts; without it every session is created at once and
the result includes the worker's cold-process spawn burst. `MY_EMAIL` and
`MY_PWD` (or `--email` and `--password`) authenticate the run; the default URLs
and LiveKit dev credentials target the local stack.

Add `--abandon N` to create N extra sessions that never join. The worker's
30-second join timeout must delete each room; the run fails if any room is left
behind.

A capacity run needs the per-user cap raised: set
`MAX_ACTIVE_VOICE_SESSIONS_PER_USER` in `apis/WorcBackend-legacy/WorkspaceAPIs/.env.local`
to at least `--sessions` and restart WorkspaceAPIs. The default of `2` returns
429 on the third call.

Results below are from local `test`-mode pipeline calls (BYOK OpenAI and
ElevenLabs) on 2026-11-23, on an AMD Ryzen 5 5600H (6 cores / 12 threads),
15.3 GB RAM, Windows, with LiveKit, WorkspaceAPIs, Postgres, and llmpipeline on
the same host. Every run held its joined calls for the full hold.

| Concurrent calls | Hold | Joined | Agent join p50 / p95 (ms) | Teardown p50 / p95 (ms) | Leftover rooms |
| --- | --- | --- | --- | --- | --- |
| 3 | 5 s | 3 | 547 / 14208 | 4556 / 5062 | 0 |
| 8 | 120 s | 8 | 560 / 5355 | 4065 / 5083 | 0 |
| 10 | 120 s | 10 | 1380 / 13435 | 4076 / 6131 | 0 |
| 10 (cold repeat) | 120 s | 9 | 590 / 12039 | 4571 / 5589 | 0 |

The largest run that held every call was 10 concurrent calls for two minutes,
with all 10 joining and all 10 rooms deleted within 6.2 seconds of the callers
leaving. A cold repeat of the same size bound 9/10: the missed dispatch never
got a worker process, and its room was still reclaimed. The repeatable ceiling
from the default worker pool is therefore 8 concurrent calls on this host.

Capacity is memory-bound, not LiveKit-bound: the Agents process pool runs one
job process per call at roughly 0.5 GB RSS, so each call reserves about 0.5 GB
above the API/worker baseline. Size production workers from measured RSS instead
of copying this dev-host number.

Teardown evidence for a run: the room list is empty at the end, and the worker
log for the same window logs `ended conversation=<id>` for each call. LiveKit's
own timers are 120 seconds for a room nobody ever joined and 20 seconds after
the last participant departs, so a missed worker deletion would still be
visible long after the measured teardown percentiles.

Regression coverage lives in `tests/test_voice_orchestration.py`: a caller who
never joins must fail and delete the room, a caller who leaves while joining
must skip the agent session, and a caller who leaves during the start must
cancel it. A live no-caller check on the same stack connected the worker at
+2 seconds and logged `caller did not join` at +30 seconds; the room was gone
from the LiveKit list at +32 seconds and the conversation was `Failed`.

The BYOK ElevenLabs key on the test flow allows three concurrent TTS requests.
Calls beyond that stay connected, but some turns log
`concurrent_limit_exceeded` and lose audio; that is a provider quota, not a
session leak.

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
| End-to-end | `caller_to_speaking_ms` (realtime: finalized caller transcript to agent `speaking`) |

Target: p95 end-to-end ≤ 800 ms over at least ten representative turns per
configuration. Split the result by stage before optimizing: provider and network
latency is outside the worker's turn loop, and a slow STT or endpointing wait
alone can exceed the target.

In the pipeline, `tts_first_audio_ms` is recorded when TTS uses its streaming
sentence path. When LiveKit selects the chunked synthesis path the field is
`null`; measure the first audible agent frame in the client for those turns
instead. Never report a latency number from `turn_total_ms` alone: it measures
the completed turn, not the wait the caller hears.

### Benchmark

Run one local call per configuration (batch pipeline, streaming pipeline, and
realtime) with at least ten turns each, then from `apis/llmpipeline`:

```sh
./venv/Scripts/python.exe -m voice_agent.latency \
  batch=<conversationId,...> streaming=<conversationId,...> realtime=<conversationId,...>
```

Conversation ids come from `run_Conversations` (`Channel = Voice`); both `test`
and `live` calls persist timing. The script prints the table below. Realtime
records first audio from the finalized caller transcript to the agent's first
`speaking` state; it also reports provider `ttft_ms` as end-to-end because it has
no caller-speech-end reference.

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
   status, persisted messages, and one BYOK usage row per call.
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
- Events are live data packets, not a replay log; a UI that joins late misses
  earlier events and must load persisted messages separately.
- A worker that dies is reconciled only on the 5-minute sweep after a 10-minute
  stale cutoff, so the UI can show the call as active for up to ~15 minutes.
- The two-call per-user cap is a cost guard that spans all of the user's spaces.
  Raise `MAX_ACTIVE_VOICE_SESSIONS_PER_USER` only for a load test.
- Concurrent capacity is memory-bound: each call holds one worker job process at
  roughly 0.5 GB RSS. The measured dev-host ceiling and method are in
  [Stress and teardown verification](#stress-and-teardown-verification).
- No SIP/telephony entry point is included; callers must join the returned
  LiveKit room.
- Enhanced noise cancellation is not implemented. `standard` and `telephony`
  are rejected at publish; only the browser-level `none` / `auto` split exists.
