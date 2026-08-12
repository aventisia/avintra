# LLM Providers v2 feature — built on LiteLLM.
# This feature is intentionally isolated from the legacy `llm_providers` feature.
# All request/response DTOs are defined here and must NOT import from the legacy
# `llm_providers_schemas` module. This keeps provider-specific contracts independent
# so future changes do not impact existing integrations.
