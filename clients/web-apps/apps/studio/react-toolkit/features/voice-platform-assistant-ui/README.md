# Voice Platform Assistant UI (Voice Test)

This feature is the Voice Test panel on the right side of a Voice Agent flow. It lets you talk to
the agent before deploying it. Nothing from a Test session is saved.

It is separate from the Chat feature (`av-platform-assistant-ui`). The Voice feature never imports
from the Chat feature; both keep their own speech helpers, playback queue, and context.

## Starting and ending a session

Choose **Start Session**. The browser asks for the microphone, then the panel opens a hands-free
conversation: just speak, and the agent answers aloud. There is no send button and no record button.

While a session is running the same button reads **Disconnect**. Choose it to stop listening, stop the
audio, close the voice connection, and return to the start. The plus button in the header also starts
a fresh transcript.

The Test borrows your speak-aloud setting so replies play during the session, and puts your previous
setting back when the session ends. Your saved preference is not changed.

## The status line

The pill shows what the Test is doing:

- **Idle** — no session is running.
- **Connecting** — the microphone and voice connection are opening.
- **Connected** — the session is running; you may be listened to, processed, or answered. Speaking
  over the reply interrupts it.
- **Reconnecting** — the realtime connection dropped briefly and is retrying.

The tag next to it names the engine: **Pipeline** or **Realtime**.

## Pipeline and Realtime

The Test follows the agent's `Engine mode` setting and reads it again at every Start Session. The two
engines never mix:

- **Pipeline** records what you say, turns it into text, runs the agent, and speaks the reply.
- **Realtime** streams audio both ways over a WebSocket and plays the agent's audio as it arrives.

On Realtime, your speech and the agent's reply both appear in the conversation while they are still
being transcribed. The live text sits at the end of the conversation in italics and turns into a
normal message when the provider finishes that turn. A draft is never saved as a message, and a turn
is never added twice.

All transcript text stays in the conversation area above the session controls. Nothing from the
transcript appears below the Start Session button.

User transcription is turned on when the session opens. OpenAI and Azure are expected to show your
words while you speak. Gemini and Vertex AI are expected to show only the finished sentence. xAI and
Bedrock do not provide user transcription in this version; audio and the agent's reply still work.

Realtime support can only be checked against a mocked gateway in this environment. Live provider
support is not verified. If a realtime session cannot start, the panel says so and offers
**Switch to Pipeline for this session**. That switch only affects the current session and never
changes the saved engine mode; it never happens automatically.

## What is hidden

For a Voice Agent the Test shows only voice controls: the message box, attachments, microphone
button, speaker button, and send/cancel controls are hidden. The transcript stays visible so you can
read what was said, but it cannot be edited or re-run from the thread. Chat Agent tests are
unchanged.

## When something goes wrong

Each problem shows a way forward:

- Microphone blocked: allow the microphone, then choose **Try again**.
- No microphone or an unsupported browser: the panel says the microphone is unavailable.
- Transcription failed: choose **Retry transcription**; the last recording is kept.
- Reply failed: choose **Retry reply**.
- Audio did not start: choose **Tap to resume audio**.
- Offline: the connection dot turns red; check the network and retry.
- Realtime failure: read the notice, then either switch this session to Pipeline or stay on Realtime
  and retry.

The Test never switches engines on its own.

## Simulated actions

The Test never performs external actions. Every tool or escalation result is marked **Test mode**
and labelled as simulated. A telephone transfer is only simulated; test it in a proper test
environment before relying on it.

## Transcript webhook

No webhook is delivered from a Voice Test session. When a webhook URL is configured, the panel says
it is suppressed and recorded as a simulated event instead.

## Not available in the Test

Avatar, screen share, camera feed, call recording, noise cancellation, and preemptive generation
are display-only: they are listed when configured, but they do not run.

## Shared helpers

`utils/voice-controls.util.ts` and `utils/text-chunker.util.ts` are pure helpers that also exist in
the Chat feature. Fix a shared bug in both copies, or consolidate them deliberately.

## What still needs a person

Some things cannot be checked automatically: how the voice actually sounds, microphone permission
wording, how easy the status pill is to read, how natural interrupting feels, and how quickly the
agent takes its turn.
