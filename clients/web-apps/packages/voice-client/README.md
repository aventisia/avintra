# @avplatform/voice-client

Headless browser client for one voice call. It owns the LiveKit room, microphone,
remote audio, event parsing, and the call snapshot; it has no React and no app
auth. Apps supply the authenticated session bootstrap.

## Usage

```ts
import { VoiceSessionClient } from "@avplatform/voice-client";

const client = new VoiceSessionClient({
  createSession: (request) => postSession(request),
  onSnapshot: (snapshot) => render(snapshot),
});

await client.start({ flowVersionId, mode: "test" });
await client.toggleMute();
await client.resumeAudio();
await client.end();
await client.dispose();
```

`start` bootstraps through `createSession`, joins the room, enables the default
microphone with the capture constraints of the resolved `noiseCancellation` mode
(`auto` keeps browser processing on; every other mode turns it off), and piles up
remote audio in hidden `<audio>` elements. Snapshot `state` is one of `idle`,
`connecting`, `listening`, `thinking`, `speaking`, `ended`, `error`;
`needsAudioResume` is set when the browser blocks playback. While the worker
reports `speaking`, the client mutes the microphone so the agent cannot transcribe
its own playback, then resumes shortly after the state changes so buffered audio
drains first.

## Worker events

`parseVoiceEvent` decodes the worker's `avintra.voice` data packets and ignores
unknown topics, malformed JSON, and unknown types. `applyVoiceEvent` is a pure
reducer over the call snapshot:

- `session.state` maps `processing` to `thinking` and `idle` to `listening`.
- `transcript.final` adds caller turns and agent turns keyed by `turnId`.
- `transcript.interim` keeps one caller caption that is replaced as the
  streaming STT revises it, then replaced by the final transcript.
- `tool.call` attaches to its agent turn, or creates a placeholder turn when the
  tool runs before the reply text.
- `skill.call` adds the active skill to its agent turn, or creates a placeholder
  turn when the worker reports it before the first reply.
- `transcript.final` without a `turnId` fills a blank agent placeholder turn, so
  realtime tool and skill calls stay on the reply they belong to.
- `timing` attaches display latency for the turn when it carries any measurement:
  the pipeline stages (`stt_ms`, `endpointing_ms`, `llm_first_token_ms`,
  `tts_first_audio_ms`, `caller_to_speaking_ms`) or the realtime
  `ttft_ms`/`duration_ms` pair.
- `error` keeps the call active until a close arrives.
- `session.closed` `1000` ends the call; any other code is an error.

## Scripts

```sh
npm run test --workspace=@avplatform/voice-client
npx turbo run typecheck --filter=@avplatform/voice-client
npx turbo run lint --filter=@avplatform/voice-client
```

Tests cover the pure reducer and the wrapper's speech gate against a fake room;
the real LiveKit wrapper is browser-only.
