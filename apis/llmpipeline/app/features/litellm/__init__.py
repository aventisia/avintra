# LiteLLM feature — the renamed and reorganized successor to `llm_providers_v2`.
#
# This feature is intentionally isolated from the legacy `llm_providers` feature.
# All request/response DTOs are self-contained here and must NOT import from the
# legacy `llm_providers_schemas` module (or the ElevenLabs `stt_providers` /
# `tts_providers` schemas). This keeps provider-specific contracts independent so
# future changes do not impact existing integrations.
#
# Structure — one folder per capability plus a shared `core/`:
#
#   core/              shared infrastructure (LiteLLM transport, credential
#                      resolution, provider registry, DTOs, streaming manager)
#   text_generation/   chat / completion orchestration
#   embeddings/        embedding orchestration
#   stt/               Speech-to-Text (LiteLLM) — coexists with ElevenLabs
#   tts/               Text-to-Speech (LiteLLM) — coexists with ElevenLabs
#
# Extensibility: add a new capability as its own folder under this package and a
# matching sub-router aggregated in `router.py`. Do NOT add a placeholder folder
# or extend the `ProviderCapability` enum until the capability is actually
# implemented.
