# Workspace Voice Assistant UI

This feature is the Voice route in the workspace app (`/assist/voice`). It lets a signed-in user
talk to a published voice agent in the browser. Nothing from a voice session is saved; the transcript
lives only while the page is open.

It is separate from the workspace Chat feature (`av-platform-assistant-ui`). The Voice feature never
imports from Chat, and Chat never imports from Voice. Both keep their own speech helpers, playback
queue, and context.

## Choosing an agent

`/assist/voice` lists the available voice agents. Pick one to open
`/assist/voice/<agent id>`. If the agent cannot be found (archived, removed, or a hand-typed URL), the
page says so and links back to the list instead of failing.

## Starting and ending a session

Choose **Start Session**. The browser asks for the microphone, then the page opens a hands-free
conversation: just speak, and the agent answers aloud. There is no message box, no send button, and
no record button.

Choose **End Session** to stop listening, stop the audio, close the voice connection, and return to
the start. Leaving the page also stops everything.

The session borrows your speak-aloud setting so replies play, and puts your previous setting back when
the session ends. Your saved preference is not changed.

## The status line

The pill shows what the page is doing:

- **Idle** — no session is running.
- **Connecting** — the microphone and voice connection are opening.
- **Listening–Recording** — hands-free listening is on; speak normally.
- **Processing** — your words are being turned into a reply.
- **Speaking** — the reply is playing. Speaking over it interrupts the reply.
- **Reconnecting** — the realtime connection dropped briefly and is retrying.

The tag next to it names the engine: **Pipeline** or **Realtime**. The dot shows whether the browser
is online.

## Pipeline and Realtime

- **Pipeline** records what you say, turns it into text, runs the agent, and speaks the reply.
- **Realtime** streams audio both ways and plays the agent audio as it arrives. A draft line reading
  **Hearing… (interim — not final)** appears while your speech is still being transcribed; it is
  replaced by the final reply and is never saved as a message.

Realtime is used only when the agent actually has a realtime provider and model. If a realtime session
cannot start, the page offers **Switch to Pipeline for this session**. That switch only affects the
current session and never happens on its own.

## When an agent is not configured

The workspace agent data does not include speech model settings yet. So most agents open with a
notice saying which capabilities are missing — Speech-to-Text, Text-to-Speech, and/or Realtime — and
**Start Session** stays disabled. This is expected: the page does not invent model settings. Once the
agent data carries those settings, the same page starts a normal session.

## When something goes wrong

Each problem shows a way forward:

- Microphone blocked: allow the microphone, then choose **Try again**.
- No microphone or an unsupported browser: the page says the microphone is unavailable.
- Transcription failed: choose **Retry transcription**; the last recording is kept.
- Reply failed: choose **Retry reply**.
- Audio did not start: choose **Tap to resume audio**.
- Offline: the connection dot turns red; check the network and retry.
- Realtime failure: read the notice, then either switch this session to Pipeline or stay on Realtime
  and retry.

## What still needs a person

Some things cannot be checked automatically: how the voice actually sounds, microphone permission
wording, how easy the status pill is to read, how natural interrupting feels, and how quickly the
agent takes its turn. Microphones also need the page to be served from HTTPS or localhost.
