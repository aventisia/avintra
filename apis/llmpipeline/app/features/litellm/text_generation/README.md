# Text generation

`POST /v2/llm/prompts/generate` (through the gateway: `POST /api/v2/llm/prompts/generate`) writes or refines a Studio prompt for you. Studio calls it for the Chat Agent and Voice Agent "Generate" / "Improve with AI" buttons and for the save-as-template dialog's "Generate". The service picks the prompt template, asks the model, cleans the answer, and bills the call; nothing else is needed from the caller.

## Request

```json
{
  "refType": "Agent",
  "promptTarget": "ChatAgentSystemPrompt",
  "refId": "<flow version id>",
  "refName": "Chat agent prompt",
  "payload": "existing prompt text, or empty to generate a new one"
}
```

`refName` and `payload` are required; `refType` defaults to empty and `promptTarget` may be left out. `refType` must be `Agent` or `Platform` whenever `promptTarget` is `Template` (the default), otherwise the request is rejected with 400.

## Templates, model and temperature

| `promptTarget` | Empty `payload` | `payload` present | Temperature |
| --- | --- | --- | --- |
| `ChatAgentSystemPrompt` | `GenerateChatAgentPromptInstructions.txt` | `ImproveChatAgentPromptInstructions.txt` | 0.4 |
| `VoiceAgentSystemPrompt` | `GenerateVoiceAgentPromptInstructions.txt` | `ImproveVoiceAgentPromptInstructions.txt` | 0.4 |
| `Template`, or absent | `refType` picks the template | same | 1 |

`promptTarget` matching is case-insensitive. With `Template` (or no target), `refType` decides: `Agent` uses `GenerateAgentTemplateDescriptionPrompt.txt`, `Platform` uses `ImprovedPromptInstructions.txt`. An unknown `promptTarget` or `refType` is rejected with 400. Every call uses `openai` / `gpt-4o-mini`, and `{{PAYLOAD_CONTENT}}` in the template is replaced with `payload`.

## Answer and errors

The reply is `{ "data": "<prompt text>", "statusCode": 200, "message": "..." }`; `statusCode` repeats the HTTP status only so Studio's `IHttpResponse<string>` handling works unchanged. Reasoning blocks and the first fence pair are stripped before returning, so `data` is plain text ready for the editor. Failures answer 400: not enough credits, template missing, unknown `promptTarget`, unsupported `refType`, empty model answer, or a failed generation. Provider failures keep their own status (for example 502).

## Credits

Each call is billed as action `TemplateDescriptionGeneration`, with the caller's `refType`, `refId` and `refName` recorded for the ledger, under the caller's tenant and `X-Space-Id`. The balance is checked before the model call and the call at or below 10 credits is refused.

## Community gate

Commercial deployments set `ON_PREM_TENANT_ID` and `ON_PREM_INSTANCE_KEY` in the service environment. When either is blank the deployment is Community and the endpoint answers 403 before any credit or model work, so a Community caller cannot reach the AI path even by calling the API directly. A fresh local stack boots as Community because `.env.example` leaves both blank; set both in `apis/llmpipeline/.env.local` to exercise the AI path locally.

## Headers

- `Authorization: Bearer <access token>` — required, same token the other AI-service calls use.
- `X-Space-Id` — the space to charge; omit for the default (Central) space.
- `X-Env-Type` — the environment the caller is acting in; defaults to `dev`.

The prompt templates live next to this file as `prompts/*.txt`. Change wording there, not in code.
