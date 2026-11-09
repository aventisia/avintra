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
microphone, and piles up remote audio in hidden `<audio>` elements. Snapshot
`state` is one of `idle`, `connecting`, `listening`, `thinking`, `speaking`,
`ended`, `error`; `needsAudioResume` is set when the browser blocks playback.

## Worker events

`parseVoiceEvent` decodes the worker's `avintra.voice` data packets and ignores
unknown topics, malformed JSON, and unknown types. `applyVoiceEvent` is a pure
reducer over the call snapshot:

- `session.state` maps `processing` to `thinking` and `idle` to `listening`.
- `transcript.final` adds caller turns and agent turns keyed by `turnId`.
- `tool.call` attaches to its agent turn, or creates a placeholder turn when the
  tool runs before the reply text.
- `timing` attaches display latency only when every displayed value is present.
- `error` keeps the call active until a close arrives.
- `session.closed` `1000` ends the call; any other code is an error.

## Scripts

```sh
npm run test --workspace=@avplatform/voice-client
npx turbo run typecheck --filter=@avplatform/voice-client
npx turbo run lint --filter=@avplatform/voice-client
```

Tests cover only the pure reducer; the LiveKit wrapper is browser-only.
