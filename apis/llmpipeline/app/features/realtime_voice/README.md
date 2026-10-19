# Realtime voice gateway

This feature lets a browser hold a live, two-way voice conversation with a
provider's realtime voice model.

## How a conversation starts

1. The Studio agent is configured with Engine Mode = Realtime, a realtime
   provider, a model, and a BYOK credential.
2. When the agent runs, the browser opens one WebSocket connection to
   `wss://<host>/llmpipeline/api/v2/llm/realtime/session`.
3. The connection is authenticated by the `AccessToken` cookie the browser sends
   with the upgrade. No token is ever placed in the URL, and there is no ticket
   exchange.
4. The first message the browser must send is `session.start` with the provider,
   model, credential name, and optional voice and language. The tenant and
   environment are scoped with the `space_id` and `env_type` query parameters,
   because a browser cannot set custom headers on a WebSocket handshake.
5. Before any provider traffic flows, the gateway re-checks, on every connect,
   that the token is valid, that the provider is in the executable list, that the
   BYOK credential resolves, and that the tenant has that model enabled for the
   Realtime capability.
6. When everything passes, the gateway answers with `session.ready` and the
   conversation begins.

## Audio format

Audio always travels as base64 text inside JSON frames. The browser sends PCM16
mono at 16 kHz. The gateway hands provider audio back at the provider's own rate,
so the browser resamples for playback using the `sample_rate` reported in each
`output_audio_chunk`.

## Message types

Browser to gateway:

| Type | Purpose |
| --- | --- |
| `session.start` | Opens the provider session. |
| `input_audio_chunk` | One chunk of caller audio, with an optional `commit`. |
| `session.stop` | Ends the conversation gracefully. |

Gateway to browser:

| Type | Purpose |
| --- | --- |
| `session.ready` | The provider session is live. |
| `output_audio_chunk` | Provider audio for playback. |
| `transcript.delta` | A transcript fragment, with a `final` flag. |
| `session.closed` | Acknowledges a graceful `session.stop`. |
| `error` | A non-silent failure report with a `retryable` flag. |

An unknown or malformed frame always produces an `error` frame; it is never
dropped silently.

## When a session ends

| Close code | Meaning | What the browser does |
| --- | --- | --- |
| `1000` | Normal end or a `session.stop`. | Nothing. |
| `4400` | Bad configuration (unknown model, provider not executable, missing BYOK, mode mismatch). | Shows a blocking error and stops. Never retries. |
| `4401` | The token could not be validated. | Shows a blocking error and stops. Never retries. |
| `4403` | The model is not enabled for the tenant, or the credential cannot be resolved. | Shows a blocking error and stops. Never retries. |
| `1011` | The provider failed mid-session. | Reconnects silently, up to five times. |
| `1006` | The connection dropped. | Reconnects silently, up to five times. |

Silent reconnects use a short backoff (about one second growing to about eight
seconds) and only show a small "Reconnecting…" indicator. When the attempts run
out, the user gets an explicit error and the mode does not change. A "Switch to
Pipeline mode" suggestion is offered after a blocking failure, but the user must
confirm it; the mode is never switched automatically.

## Supported providers

Realtime voice can be executed with these providers, all through a BYOK
credential and tenant Realtime enablement:

`openai`, `azure`, `gemini`, `vertex_ai`, `xai`, `bedrock`.

Ultravox is **not** supported. It is not published by LiteLLM and has no
integration here, so it is never offered as a selectable option and publishing an
agent that names it is rejected.

Some provider names are stored in Studio with a different spelling than the name
the provider is executed under. Studio saves `googlegemini` for Gemini and
`amazon_nova` for Amazon Nova. The gateway and the publish validator accept both
spellings by mapping them to `gemini` and `bedrock`, so an agent configured in
Studio connects and publishes without changing the saved value. Only these known
spellings are mapped; any other name, including Ultravox, is rejected.

## Operational notes

- Platform-hosted realtime voice is not offered in this version; a realtime
  session always requires a BYOK credential.
- The service runs with a single worker, so long-lived sockets do not need
  sticky sessions.
- Abuse is bounded by the cookie-authenticated route, the per-connect tenant
  check, and the fact that `44xx` failures are never retried.
