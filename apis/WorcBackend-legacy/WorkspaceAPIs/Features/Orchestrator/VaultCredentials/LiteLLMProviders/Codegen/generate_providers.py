#!/usr/bin/env python3
"""
Codegen for individual LiteLLM provider types.

Single source of truth: the PROVIDERS list below maps every LiteLLM provider
name to a credential *shape*. Each provider becomes its own first-class type
across every layer, following the same pattern as OpenAI / Gemini / ElevenLabs.
From the registry we generate:

  1. VaultCredentialTypesEnum.cs      — one member per provider (new providers only;
                                  reused types keep their existing member).
  2. LLMProviderTypesEnum.cs    — one member per provider for model syncing.
  3. VaultCredentialsDto.cs          — one typed C# DTO per NEW provider, named
                                  {Provider}CredentialsDto (no LiteLLM prefix),
                                  injected into the LiteLLMProviderDtos region.
  4. LiteLLMProviderCatalog.cs  — data-driven model-list endpoint catalog.
  5. config-json/<Type>.json    — per-provider UI field definitions.
  6. workspace vault-credential enum + 3 mappers + model-provider enum/definitions.

Credential fields follow LiteLLM's native provider configuration: LiteLLM
manages the default endpoint/base URL for most providers, so the default shape
is a single API key (no URL field). Only providers that support custom or
self-hosted base URLs (CUSTOM_URL_PROVIDERS) or are keyless local servers
(NO_AUTH_PROVIDERS) include a URL field.

Adding a new provider = add one row to PROVIDERS and re-run this script.
Run:  python3 generate_providers.py
"""

from __future__ import annotations

import json
import os
import re
from typing import Dict, List

# ---------------------------------------------------------------------------
# Credential shapes. Each shape defines the fields a provider needs and which
# of those fields are sensitive (encrypted at rest).
#
# LiteLLM manages the default endpoint/base URL for the vast majority of
# providers, so the default shape is "api_key" (no URL field). Only providers
# that support custom base URLs or self-hosted deployments get a URL field
# ("api_key_url" for keyed custom endpoints, "no_auth" for keyless local ones).
# ---------------------------------------------------------------------------
SHAPES: Dict[str, Dict] = {
    # API key only (no base URL) — LiteLLM uses its built-in default endpoint.
    "api_key": {
        "fields": [
            {"name": "ApiKey", "type": "string", "sensitive": True, "required": True,
             "label": "API Key", "control": "password", "default": ""},
        ],
    },
    # API key + optional base URL override (custom / self-hosted endpoints).
    "api_key_url": {
        "fields": [
            {"name": "ApiKey", "type": "string", "sensitive": True, "required": True,
             "label": "API Key", "control": "password", "default": ""},
            {"name": "Url", "type": "string", "sensitive": False, "required": False,
             "label": "Base URL", "control": "text", "default": ""},
        ],
    },
    # AWS-style access key / secret / region (+ optional session token).
    "aws": {
        "fields": [
            {"name": "Region", "type": "string", "sensitive": False, "required": True,
             "label": "Region", "control": "text", "default": "us-east-1"},
            {"name": "AccessKeyId", "type": "string", "sensitive": False, "required": True,
             "label": "Access Key ID", "control": "text", "default": ""},
            {"name": "SecretAccessKey", "type": "string", "sensitive": True, "required": True,
             "label": "Secret Access Key", "control": "password", "default": ""},
            {"name": "SessionToken", "type": "string", "sensitive": True, "required": False,
             "label": "Session Token", "control": "password", "default": ""},
        ],
    },
    # Google Vertex AI: service-account JSON + project + location.
    "vertex": {
        "fields": [
            {"name": "ProjectId", "type": "string", "sensitive": False, "required": True,
             "label": "Project ID", "control": "text", "default": ""},
            {"name": "Location", "type": "string", "sensitive": False, "required": True,
             "label": "Location", "control": "text", "default": "us-central1"},
            {"name": "ServiceAccountJson", "type": "string", "sensitive": True, "required": True,
             "label": "Service Account JSON", "control": "textarea", "default": ""},
        ],
    },
    # Azure OpenAI: key + resource + version + endpoint.
    "azure": {
        "fields": [
            {"name": "ApiKey", "type": "string", "sensitive": True, "required": True,
             "label": "API Key", "control": "password", "default": ""},
            {"name": "ResourceName", "type": "string", "sensitive": False, "required": True,
             "label": "Resource Name", "control": "text", "default": ""},
            {"name": "ApiVersion", "type": "string", "sensitive": False, "required": False,
             "label": "API Version", "control": "text", "default": "2024-06-01"},
            {"name": "Endpoint", "type": "string", "sensitive": False, "required": True,
             "label": "Endpoint", "control": "text", "default": ""},
        ],
    },
    # IBM WatsonX: key + project id + region.
    "watsonx": {
        "fields": [
            {"name": "ApiKey", "type": "string", "sensitive": True, "required": True,
             "label": "API Key", "control": "password", "default": ""},
            {"name": "ProjectId", "type": "string", "sensitive": False, "required": True,
             "label": "Project ID", "control": "text", "default": ""},
            {"name": "Region", "type": "string", "sensitive": False, "required": False,
             "label": "Region", "control": "text", "default": ""},
        ],
    },
    # Local / no-auth providers: optional base URL only.
    "no_auth": {
        "fields": [
            {"name": "Url", "type": "string", "sensitive": False, "required": False,
             "label": "Base URL", "control": "text", "default": ""},
        ],
    },
}

# Providers whose hand-maintained credential shape differs from the registry
# default. Ollama Chat accepts an optional base URL plus an API key.
PROVIDER_SHAPE_OVERRIDES: Dict[str, str] = {
    "ollama_chat": "ollama_chat",
}
SHAPES["ollama_chat"] = {
    "fields": [
        {"name": "Url", "type": "string", "sensitive": False, "required": False,
         "label": "Base URL", "control": "text", "default": ""},
        {"name": "ApiKey", "type": "string", "sensitive": True, "required": True,
         "label": "API Key", "control": "password", "default": ""},
    ],
}

# ---------------------------------------------------------------------------
# Provider -> shape mapping. Default is "api_key_url".
# ---------------------------------------------------------------------------
# Providers that use AWS-style credentials.
AWS_PROVIDERS = {
    "bedrock", "bedrock_mantle", "sagemaker", "sagemaker_chat", "sagemaker_nova",
    "aws_polly", "amazon_nova",
}
# Providers that use Google Vertex service-account credentials.
VERTEX_PROVIDERS = {"vertex_ai", "vertex_ai_beta"}
# Providers that use Azure OpenAI-style credentials.
AZURE_PROVIDERS = {"azure", "azure_ai", "azure_text", "azure_anthropic"}
# Providers that use IBM WatsonX credentials.
WATSONX_PROVIDERS = {"watsonx", "watsonx_text"}
# Local / no-auth providers (keyless, self-hosted — base URL only).
NO_AUTH_PROVIDERS = {
    "ollama", "ollama_chat", "vllm", "llamafile", "lm_studio", "oobabooga",
    "triton", "xinference", "hosted_vllm", "docker_model_runner", "litellm_proxy",
}
# Keyed providers that support custom / self-hosted base URLs. These keep a
# URL field because LiteLLM cannot assume a fixed default endpoint for them.
CUSTOM_URL_PROVIDERS = {
    "aiohttp_openai", "custom", "custom_openai", "openai_like",
    "vercel_ai_gateway",
}

# ---------------------------------------------------------------------------
# Model-list endpoint catalog.
# Tuple: (BaseUrl, Endpoint, ParseKey|None, AuthHeader, AuthValuePrefix)
#   ParseKey None => response is a top-level JSON array.
# Providers absent from this map fall back to the OpenAI-compatible request
# using the credential's Url.
# ---------------------------------------------------------------------------
MODEL_ENDPOINTS: Dict[str, tuple] = {
    # OpenAI-compatible Bearer providers (base URL fixed where known).
    "openai": ("https://api.openai.com", "v1/models", "data", "Authorization", "Bearer "),
    "groq": ("https://api.groq.com/openai", "v1/models", "data", "Authorization", "Bearer "),
    "mistral": ("https://api.mistral.ai", "v1/models", "data", "Authorization", "Bearer "),
    "openrouter": ("https://openrouter.ai/api", "v1/models", "data", "Authorization", "Bearer "),
    "together_ai": ("https://api.together.xyz", "v1/models", "data", "Authorization", "Bearer "),
    "fireworks_ai": ("https://api.fireworks.ai", "v1/models", "data", "Authorization", "Bearer "),
    "cerebras": ("https://api.cerebras.ai", "v1/models", "data", "Authorization", "Bearer "),
    "perplexity": ("https://api.perplexity.ai", "models", "data", "Authorization", "Bearer "),
    "deepseek": ("https://api.deepseek.com", "models", "data", "Authorization", "Bearer "),
    "deepinfra": ("https://api.deepinfra.com", "v1/models", "data", "Authorization", "Bearer "),
    "ai21": ("https://api.ai21.com", "studio/v1/models", "data", "Authorization", "Bearer "),
    "codestral": ("https://codestral.mistral.ai", "v1/models", "data", "Authorization", "Bearer "),
    "xai": ("https://api.x.ai", "v1/models", "data", "Authorization", "Bearer "),
    "nvidia_nim": ("https://integrate.api.nvidia.com", "v1/models", "data", "Authorization", "Bearer "),
    "sambanova": ("https://api.sambanova.ai", "v1/models", "data", "Authorization", "Bearer "),
    "novita": ("https://api.novita.ai", "v3/openai/models", "data", "Authorization", "Bearer "),
    "ollama_cloud": ("https://ollama.com", "v1/models", "data", "Authorization", "Bearer "),
    # Anthropic-compatible.
    "anthropic": ("https://api.anthropic.com", "v1/models", "data", "x-api-key", ""),
    # Gemini.
    "gemini": ("https://generativelanguage.googleapis.com", "v1beta/models", "models", "x-goog-api-key", ""),
    # ElevenLabs (top-level array).
    "elevenlabs": ("https://api.elevenlabs.io", "v1/models", None, "xi-api-key", ""),
}

# The full LiteLLM provider list (from the product requirement).
PROVIDERS: List[str] = [
    "a2a", "a2a_agent", "ai21", "ai21_chat", "aiml", "aiohttp_openai",
    "amazon_nova", "anthropic", "anthropic_text", "apertis", "assemblyai",
    "auto_router", "aws_polly", "azure", "azure_ai", "azure_text", "baseten",
    "bedrock", "bedrock_mantle", "black_forest_labs", "bytez", "cerebras",
    "charity_engine", "chatgpt", "chutes", "clarifai", "cloudflare",
    "codestral", "cohere", "cohere_chat", "cometapi", "compactifai", "cursor",
    "custom", "custom_openai", "darkbloom", "dashscope", "databricks",
    "datarobot", "deepgram", "deepinfra", "deepseek", "docker_model_runner",
    "dotprompt", "elevenlabs", "empower", "fal_ai", "featherless_ai",
    "fireworks_ai", "friendliai", "galadriel", "gdc", "gemini", "gigachat",
    "github", "github_copilot", "gradient_ai", "groq", "helicone", "heroku",
    "hosted_vllm", "huggingface", "humanloop", "hyperbolic", "inception",
    "infinity", "jina_ai", "lambda_ai", "langflow", "langfuse", "langgraph",
    "lemonade", "libertai", "litellm_agent", "litellm_proxy", "llamafile",
    "lm_studio", "manus", "maritalk", "meta", "meta_llama", "milvus",
    "minimax", "mistral", "modelscope", "moonshot", "morph", "nano-gpt",
    "nebius", "neosantara", "nlp_cloud", "novita", "nscale", "nvidia_nim",
    "nvidia_riva", "oci", "ollama", "ollama_chat", "oobabooga", "openai",
    "openai_like", "openrouter", "ovhcloud", "parasail", "perplexity",
    "petals", "pg_vector", "pinstripes", "poe", "predibase", "publicai",
    "ragflow", "recraft", "reducto", "replicate", "runwayml", "s3_vectors",
    "sagemaker", "sagemaker_chat", "sagemaker_nova", "sambanova", "sap",
    "scaleway", "snowflake", "soniox", "stability", "synthetic", "tencent",
    "tensormesh", "text-completion-codestral", "text-completion-inception",
    "text-completion-openai", "together_ai", "topaz", "triton", "v0",
    "vercel_ai_gateway", "vertex_ai", "vertex_ai_beta", "vllm", "volcengine",
    "voyage", "wandb", "watsonx", "watsonx_text", "xai", "xiaomi_mimo",
    "xinference", "zai",
]


def shape_for(provider: str) -> str:
    if provider in PROVIDER_SHAPE_OVERRIDES:
        return PROVIDER_SHAPE_OVERRIDES[provider]
    if provider in AWS_PROVIDERS:
        return "aws"
    if provider in VERTEX_PROVIDERS:
        return "vertex"
    if provider in AZURE_PROVIDERS:
        return "azure"
    if provider in WATSONX_PROVIDERS:
        return "watsonx"
    if provider in NO_AUTH_PROVIDERS:
        return "no_auth"
    if provider in CUSTOM_URL_PROVIDERS:
        return "api_key_url"
    # Default: API key only. LiteLLM manages the provider's default endpoint.
    return "api_key"


def pascal(provider: str) -> str:
    """Convert a provider name to a PascalCase identifier for class/enum names."""
    parts = provider.replace("-", "_").split("_")
    return "".join(p.capitalize() for p in parts)


def enum_name(provider: str) -> str:
    """Return the individual VaultCredentialTypesEnum / LLMProviderTypesEnum member name."""
    return pascal(provider)


def dto_class_name(provider: str) -> str:
    return f"{pascal(provider)}CredentialsDto"


def csharp_type(field: Dict) -> str:
    t = field["type"]
    if t == "bool":
        return "bool"
    return "string"


def csharp_default(field: Dict) -> str:
    if field["type"] == "bool":
        return "false"
    default = field.get("default", "")
    if default:
        return f'"{default}"'
    return "string.Empty"


def csharp_doc(field: Dict) -> str:
    return f"Gets or sets the {field['label'].lower()}."


# ---------------------------------------------------------------------------
# Reused provider types. These already have a dedicated VaultCredentialTypesEnum
# member and DTO (OpenAI, Anthropic, ...). Codegen only ADDS members for the
# remaining ~138 providers and does not regenerate these.
# ---------------------------------------------------------------------------
REUSED_PROVIDERS: Dict[str, str] = {
    "openai": "OpenAI",
    "anthropic": "Anthropic",
    "gemini": "GoogleGemini",
    "groq": "Groq",
    "bedrock": "Bedrock",
    "mistral": "Mistral",
    "openrouter": "OpenRouter",
    "elevenlabs": "ElevenLabs",
    "ollama": "Ollama",
}

# Providers that are model providers but reuse an existing vault credential
# type (no dedicated VaultCredentialTypesEnum member / DTO / config-json). The value
# is the VaultCredentialTypesEnum / VaultCredentialAppsEnum member they route to. The LiteLLM
# "github" model provider shares the single "GitHub" vault credential type.
MODEL_ONLY_PROVIDERS: Dict[str, str] = {
    "github": "GitHub",
}

NEW_PROVIDERS: List[str] = [
    p for p in PROVIDERS
    if p not in REUSED_PROVIDERS and p not in MODEL_ONLY_PROVIDERS
]

# All providers that appear in the model-provider enums (LLMProviderTypesEnum /
# ModelProviderEnum): the generated ones plus the model-only ones.
MODEL_PROVIDERS: List[str] = NEW_PROVIDERS + list(MODEL_ONLY_PROVIDERS)


def generate_dtos() -> str:
    """Return the generated per-provider DTO class bodies (no namespace/header).

    These are injected into the `LiteLLMProviderDtos` sentinel region of
    `VaultCredentialsDto.cs` so all credential DTOs live in one file.
    """
    lines: List[str] = []
    lines.append("// <auto-generated>")
    lines.append("// Generated by LiteLLMProviders/Codegen/generate_providers.py — DO NOT EDIT.")
    lines.append("// Add a provider to the registry and re-run the script.")
    lines.append("// </auto-generated>")
    lines.append("")
    lines.append("// One typed DTO per individual LiteLLM provider type (except the reused")
    lines.append("// OpenAI/Anthropic/Gemini/Groq/Bedrock/Mistral/OpenRouter/ElevenLabs/Ollama")
    lines.append("// types that already have dedicated DTOs).")
    lines.append("")
    for provider in NEW_PROVIDERS:
        shape = SHAPES[shape_for(provider)]
        cls = dto_class_name(provider)
        lines.append(f"/// <summary>Credentials for the '{provider}' provider.</summary>")
        lines.append(f"public class {cls}")
        lines.append("{")
        for field in shape["fields"]:
            name = field["name"]
            t = csharp_type(field)
            default = csharp_default(field)
            lines.append(f"    /// <summary>{csharp_doc(field)}</summary>")
            lines.append(f"    public {t} {name} {{ get; set; }} = {default};")
        lines.append("}")
        lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Model-fetch catalog: provider -> (baseUrl, endpoint, parseKey | None=array,
# authHeader, authValuePrefix). Providers not listed fall back to an
# OpenAI-compatible request using the credential's Url (if present).
# ---------------------------------------------------------------------------
def _endpoint(provider: str) -> Dict | None:
    return MODEL_ENDPOINTS.get(provider)


def generate_catalog() -> str:
    lines: List[str] = []
    lines.append("// <auto-generated>")
    lines.append("// Generated by LiteLLMProviders/Codegen/generate_providers.py — DO NOT EDIT.")
    lines.append("// </auto-generated>")
    lines.append("")
    lines.append("#nullable enable")
    lines.append("")
    lines.append("using WorkspaceAPIs.Enums;")
    lines.append("")
    lines.append("namespace WorkspaceAPIs.Features.LLMProviders;")
    lines.append("")
    lines.append("/// <summary>")
    lines.append("/// Describes how to fetch the model list for a provider.")
    lines.append("/// </summary>")
    lines.append("public sealed record ProviderEndpoint(")
    lines.append("    string BaseUrl,")
    lines.append("    string Endpoint,")
    lines.append("    string? ParseKey, // null => the response is a top-level JSON array")
    lines.append("    string AuthHeader,")
    lines.append("    string AuthValuePrefix);")
    lines.append("")
    lines.append("/// <summary>")
    lines.append("/// Generated catalog of provider model-list endpoints. Providers absent from")
    lines.append("/// this map use the OpenAI-compatible fallback (base URL from the credential).")
    lines.append("/// </summary>")
    lines.append("public static class LiteLLMProviderCatalog")
    lines.append("{")
    lines.append("    public static readonly Dictionary<LLMProviderTypesEnum, ProviderEndpoint> Endpoints = new()")
    lines.append("    {")
    for provider, ep in MODEL_ENDPOINTS.items():
        base_url, endpoint, parse_key, auth_header, auth_prefix = ep
        parse = f"\"{parse_key}\"" if parse_key else "null"
        lines.append(f"        [LLMProviderTypesEnum.{llm_enum_member(provider)}] = new(\"{base_url}\", \"{endpoint}\", {parse}, \"{auth_header}\", \"{auth_prefix}\"),")
    lines.append("    };")
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


# Mapping of provider string -> LLMProviderTypesEnum member name for providers
# whose PascalCase differs from the generated `pascal()` output (e.g. openai -> OpenAI).
def llm_enum_member(provider: str) -> str:
    overrides = {
        "openai": "OpenAI",
        "openrouter": "OpenRouter",
        "elevenlabs": "ElevenLabs",
        "gemini": "Gemini",
        "anthropic": "Anthropic",
        "ollama": "Ollama",
        "ollama_cloud": "OllamaCloud",
        "groq": "Groq",
        "bedrock": "Bedrock",
        "mistral": "Mistral",
    }
    return overrides.get(provider, enum_name(provider))



def generate_vault_credential_enum() -> str:
    lines: List[str] = []
    lines.append("namespace AspNetToolkit.Enums;")
    lines.append("")
    lines.append("/// <summary>")
    lines.append("/// Specifies the credential types used to integrate with third-party services.")
    lines.append("/// </summary>")
    lines.append("public enum VaultCredentialTypesEnum")
    lines.append("{")
    lines.append("    [Description(\"OpenAI API Key\")]")
    lines.append("    OpenAI,")
    lines.append("    [Description(\"AWS Credentials\")]")
    lines.append("    AWS,")
    lines.append("    [Description(\"Twilio API Credentials\")]")
    lines.append("    Twilio,")
    lines.append("    [Description(\"SendGrid API Key\")]")
    lines.append("    SendGrid,")
    lines.append("    [Description(\"GitHub API Key\")]")
    lines.append("    GitHub,")
    lines.append("    [Description(\"M365 Credentials\")]")
    lines.append("    M365,")
    lines.append("    [Description(\"General Credentials\")]")
    lines.append("    GeneralCredentials,")
    lines.append("    [Description(\"Anthropic Credentials\")]")
    lines.append("    Anthropic,")
    lines.append("    [Description(\"Google Gemini Credentials\")]")
    lines.append("    GoogleGemini,")
    lines.append("    [Description(\"Google Workspace Credentials\")]")
    lines.append("    GoogleWorkspace,")
    lines.append("    [Description(\"Azure OpenAI Credentials\")]")
    lines.append("    AzureOpenAI,")
    lines.append("    [Description(\"ElevenLabs Credentials\")]")
    lines.append("    ElevenLabs,")
    lines.append("    [Description(\"OpenRouter Credentials\")]")
    lines.append("    OpenRouter,")
    lines.append("    [Description(\"Azure Storage Credentials\")]")
    lines.append("    AzureStorage,")
    lines.append("    [Description(\"Connection String Credentials\")]")
    lines.append("    ConnectionString,")
    lines.append("    [Description(\"Qdrant Credentials\")]")
    lines.append("    Qdrant,")
    lines.append("    [Description(\"Ollama On-prem Credentials\")]")
    lines.append("    Ollama,")
    lines.append("    [Description(\"Ollama Cloud Credentials\")]")
    lines.append("    OllamaCloud,")
    lines.append("    [Description(\"Groq Credentials\")]")
    lines.append("    Groq,")
    lines.append("    [Description(\"Bedrock Credentials\")]")
    lines.append("    Bedrock,")
    lines.append("    [Description(\"Mistral Credentials\")]")
    lines.append("    Mistral,")
    lines.append("    EmailClient,")
    lines.append("    AzureBlobStorage,")
    lines.append("    [Description(\"Custom API Tool Credentials\")]")
    lines.append("    CustomApiTool,")
    lines.append("")
    lines.append("    // --- Individual LiteLLM provider types (generated) ---")
    for provider in NEW_PROVIDERS:
        lines.append(f'    [Description("{provider} Credentials")]')
        lines.append(f"    {enum_name(provider)},")
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


def generate_llm_provider_enum() -> str:
    lines: List[str] = []
    lines.append("namespace WorkspaceAPIs.Enums;")
    lines.append("")
    lines.append("/// <summary>")
    lines.append("/// Enum representing the supported types of external providers for syncing models.")
    lines.append("/// </summary>")
    lines.append("public enum LLMProviderTypesEnum")
    lines.append("{")
    lines.append("    [Description(\"OpenRouter provider\")]")
    lines.append("    OpenRouter,")
    lines.append("    [Description(\"Gemini provider\")]")
    lines.append("    Gemini,")
    lines.append("    [Description(\"OpenAI provider\")]")
    lines.append("    OpenAI,")
    lines.append("    [Description(\"Anthropic provider\")]")
    lines.append("    Anthropic,")
    lines.append("    [Description(\"ElevenLabs provider\")]")
    lines.append("    ElevenLabs,")
    lines.append("    [Description(\"Ollama provider\")]")
    lines.append("    Ollama,")
    lines.append("    [Description(\"Ollama Cloud provider\")]")
    lines.append("    OllamaCloud,")
    lines.append("    [Description(\"Groq provider\")]")
    lines.append("    Groq,")
    lines.append("    [Description(\"Bedrock provider\")]")
    lines.append("    Bedrock,")
    lines.append("    [Description(\"Mistral provider\")]")
    lines.append("    Mistral,")
    lines.append("")
    lines.append("    // --- Individual LiteLLM provider types (generated) ---")
    for provider in MODEL_PROVIDERS:
        lines.append(f'    [Description("{provider} provider")]')
        lines.append(f"    {enum_name(provider)},")
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Frontend generation
# ---------------------------------------------------------------------------
def generate_config_json_files(out_dir: str) -> None:
    """Write one config-json file per NEW provider, preserving hand-edited files."""
    for provider in NEW_PROVIDERS:
        path = os.path.join(out_dir, f"{enum_name(provider)}.json")
        if os.path.exists(path):
            continue
        shape = SHAPES[shape_for(provider)]
        fields = []
        for field in shape["fields"]:
            fields.append({
                "direction": "Input",
                "type": field["control"],
                "name": field["name"],
                "label": field["label"],
                "defaultValue": field.get("default", ""),
                "required": field.get("required", False),
                "description": field.get("description", ""),
            })
        with open(path, "w") as f:
            f.write(json.dumps(fields, indent=2))


def generate_vault_credential_apps_enum() -> str:
    existing = [
        "OpenAI", "AWS", "Twilio", "SendGrid", "GitHub", "M365",
        "GeneralCredentials", "GoogleGemini", "GoogleWorkspace", "ElevenLabs",
        "OpenRouter", "AzureStorage", "ConnectionString", "Qdrant", "Anthropic",
        "CustomApiTool", "Ollama", "OllamaCloud", "Groq", "Bedrock", "Mistral",
    ]
    lines = ["export enum VaultCredentialAppsEnum {"]
    for e in existing:
        lines.append(f"  {e},")
    lines.append("")
    lines.append("  // --- Individual LiteLLM provider types (generated) ---")
    for p in NEW_PROVIDERS:
        lines.append(f"  {enum_name(p)},")
    lines.append("}")
    return "\n".join(lines) + "\n"


def generate_vault_credential_select_options() -> str:
    existing = [
        ("OpenAI", "OpenAI"), ("AWS", "AWS"), ("Twilio", "Twilio"),
        ("SendGrid", "SendGrid"), ("GitHub", "GitHub"), ("M365", "M365"),
        ("GeneralCredentials", "General Credentials"),
        ("GoogleGemini", "Google Gemini"), ("GoogleWorkspace", "Google Workspace"),
        ("OpenRouter", "OpenRouter"), ("ElevenLabs", "ElevenLabs"),
        ("AzureStorage", "Azure Storage"), ("ConnectionString", "Connection String"),
        ("Qdrant", "Qdrant"), ("Anthropic", "Anthropic"),
        ("CustomApiTool", "Custom API Tool"), ("Ollama", "Ollama On-prem"),
        ("OllamaCloud", "Ollama Cloud"), ("Groq", "Groq"), ("Bedrock", "Bedrock"),
        ("Mistral", "Mistral"),
    ]
    lines = [
        'import { VaultCredentialAppsEnum } from "../../enums/vault-credential-apps.enum";',
        "",
        "export const vaultCredentialAppsSelectOptions: Record<VaultCredentialAppsEnum, { label: string; value: string }> = {",
    ]
    for member, label in existing:
        lines.append(f'  [VaultCredentialAppsEnum.{member}]: {{ label: "{label}", value: "{member}" }},')
    lines.append("")
    lines.append("  // --- Individual LiteLLM provider types (generated) ---")
    for p in NEW_PROVIDERS:
        m = enum_name(p)
        lines.append(f'  [VaultCredentialAppsEnum.{m}]: {{ label: "{m}", value: "{m}" }},')
    lines.append("};")
    return "\n".join(lines) + "\n"


def generate_app_to_vault_credential_name_mapper() -> str:
    existing = [
        ("OpenAI", "openai_api_key"), ("AWS", "aws_access_key"),
        ("Twilio", "twilio_auth_token"), ("SendGrid", "sendgrid_api_key"),
        ("GitHub", "github_access_token"), ("M365", "m365_credential"),
        ("GeneralCredentials", "general_credentials"),
        ("GoogleGemini", "google_gemini"), ("GoogleWorkspace", "google_workspace"),
        ("OpenRouter", "open_router"), ("ElevenLabs", "eleven_labs"),
        ("AzureStorage", "azure_storage"), ("ConnectionString", "connection_string"),
        ("Qdrant", "qdrant_api_key"), ("Anthropic", "anthropic_api_key"),
        ("CustomApiTool", "custom_api_tool"), ("Ollama", "ollama_api_key"),
        ("OllamaCloud", "ollama_cloud_api_key"), ("Groq", "groq_api_key"),
        ("Bedrock", "bedrock_aws_access_key"), ("Mistral", "mistral_api_key"),
    ]
    lines = [
        'import { VaultCredentialAppsEnum } from "../../enums/vault-credential-apps.enum";',
        "",
        "export const appToVaultCredentialNameMapper: Record<VaultCredentialAppsEnum, string> = {",
    ]
    for member, name in existing:
        lines.append(f'  [VaultCredentialAppsEnum.{member}]: "{name}",')
    lines.append("")
    lines.append("  // --- Individual LiteLLM provider types (generated) ---")
    for p in NEW_PROVIDERS:
        m = enum_name(p)
        lines.append(f'  [VaultCredentialAppsEnum.{m}]: "{p}_credentials",')
    lines.append("};")
    return "\n".join(lines) + "\n"


def generate_vault_credential_app_icon_mapper() -> str:
    existing = [
        ("OpenAI", "/brand-img/openai.svg"), ("AWS", "/brand-img/aws.svg"),
        ("Twilio", "/brand-img/twilio.svg"), ("SendGrid", "/brand-img/sendgrid.svg"),
        ("GitHub", "/brand-img/github.svg"), ("M365", "/brand-img/m365.svg"),
        ("GeneralCredentials", "/assets/CredentialManager.svg"),
        ("GoogleGemini", "/brand-img/gemini.svg"),
        ("GoogleWorkspace", "/assets/GoogleWorkspace.svg"),
        ("OpenRouter", "/brand-img/openrouter.svg"),
        ("ElevenLabs", "/brand-img/elevenlabs.svg"),
        ("AzureStorage", "/assets/Azure.svg"), ("ConnectionString", "/assets/Database.svg"),
        ("Qdrant", "/assets/Qdrant.svg"), ("Anthropic", "/brand-img/anthropic.svg"),
        ("CustomApiTool", "/assets/CredentialManager.svg"),
        ("Ollama", "/brand-img/ollama.webp"), ("OllamaCloud", "/brand-img/ollama.webp"),
        ("Groq", "/assets/CredentialManager.svg"), ("Bedrock", "/brand-img/aws.svg"),
        ("Mistral", "/assets/CredentialManager.svg"),
    ]
    lines = [
        'import { VaultCredentialAppsEnum } from "../../enums/vault-credential-apps.enum";',
        "",
        "export const vaultCredentialAppIconMapper: Record<VaultCredentialAppsEnum, string> = {",
    ]
    for member, icon in existing:
        lines.append(f'  [VaultCredentialAppsEnum.{member}]: "{icon}",')
    lines.append("")
    lines.append("  // --- Individual LiteLLM provider types (generated) ---")
    for p in NEW_PROVIDERS:
        m = enum_name(p)
        lines.append(f'  [VaultCredentialAppsEnum.{m}]: "/assets/CredentialManager.svg",')
    lines.append("};")
    return "\n".join(lines) + "\n"


def generate_model_provider_enum() -> str:
    existing = [
        ("OpenAI", "OpenAI"), ("Anthropic", "Anthropic"), ("Google", "Gemini"),
        ("OpenRouter", "OpenRouter"), ("ElevenLabs", "ElevenLabs"),
        ("Ollama", "Ollama"), ("OllamaCloud", "OllamaCloud"),
        ("Groq", "Groq"), ("Bedrock", "Bedrock"), ("Mistral", "Mistral"),
    ]
    lines = ["export enum ModelProviderEnum {"]
    for key, value in existing:
        lines.append(f'  {key} = "{value}",')
    lines.append("")
    lines.append("  // --- Individual LiteLLM provider types (generated) ---")
    for p in MODEL_PROVIDERS:
        lines.append(f'  {enum_name(p)} = "{p}",')
    lines.append("}")
    return "\n".join(lines) + "\n"


def generate_model_provider_definitions() -> str:
    existing = [
        ("OpenAI", "OpenAI", "VaultCredentialAppsEnum.OpenAI", "Enable OpenAI models such as GPT and embedding models."),
        ("Anthropic", "Anthropic", "VaultCredentialAppsEnum.Anthropic", "Enable Anthropic Claude models."),
        ("Google", "Google", "VaultCredentialAppsEnum.GoogleGemini", "Enable Google Gemini models."),
        ("OpenRouter", "OpenRouter", "VaultCredentialAppsEnum.OpenRouter", "Enable models aggregated through OpenRouter."),
        ("ElevenLabs", "ElevenLabs", "VaultCredentialAppsEnum.ElevenLabs", "Enable ElevenLabs speech and audio models."),
        ("Ollama", "Ollama On-prem", "VaultCredentialAppsEnum.Ollama", "Connect to a self-hosted Ollama server to use its local models.", "isUrlBased: true"),
        ("OllamaCloud", "Ollama Cloud", "VaultCredentialAppsEnum.OllamaCloud", "Connect to Ollama Cloud to use its hosted models."),
        ("Groq", "Groq", "VaultCredentialAppsEnum.Groq", "Enable Groq LPU-accelerated models."),
        ("Bedrock", "Bedrock", "VaultCredentialAppsEnum.Bedrock", "Enable Amazon Bedrock foundation models."),
        ("Mistral", "Mistral", "VaultCredentialAppsEnum.Mistral", "Enable Mistral AI models."),
    ]
    lines = [
        'import { VaultCredentialAppsEnum } from "@/features/02-configure/vault-credentials/enums/vault-credential-apps.enum";',
        'import { vaultCredentialAppIconMapper } from "@/features/02-configure/vault-credentials/vault-credential-config/constants/vault-credential-app-icon-mapper.constant";',
        "",
        'import { ModelProviderEnum } from "../enums/model-provider-enum";',
        "",
        "export interface ModelProviderDefinition {",
        "  value: ModelProviderEnum;",
        "  label: string;",
        "  vaultCredentialType: VaultCredentialAppsEnum;",
        "  description: string;",
        "  isUrlBased?: boolean;",
        "}",
        "",
        'const basePath = import.meta.env.VITE_WORKSPACE_PATH.replace(/\\/$/, "");',
        "",
        "export const getProviderIcon = (provider: ModelProviderDefinition): string => {",
        "  if (provider.isUrlBased) {",
        '    return `${basePath}/brand-img/${provider.value.toLowerCase()}.webp`;',
        "  }",
        "  return `${basePath}${vaultCredentialAppIconMapper[provider.vaultCredentialType]}`;",
        "};",
        "",
        "export const isUrlBasedProvider = (providerType: ModelProviderEnum): boolean =>",
        "  modelProviderDefinitions.find((p) => p.value === providerType)?.isUrlBased ?? false;",
        "",
        "export const modelProviderDefinitions: ModelProviderDefinition[] = [",
    ]
    for item in existing:
        key, label, vault_credential, desc = item[0], item[1], item[2], item[3]
        extra = item[4] if len(item) > 4 else ""
        lines.append(f"  {{")
        lines.append(f"    value: ModelProviderEnum.{key},")
        lines.append(f'    label: "{label}",')
        lines.append(f"    vaultCredentialType: {vault_credential},")
        if extra:
            lines.append(f'    description: "{desc}",')
            lines.append(f"    {extra},")
        else:
            lines.append(f'    description: "{desc}",')
        lines.append("  },")
    lines.append("")
    lines.append("  // --- Individual LiteLLM provider types (generated) ---")
    for p in MODEL_PROVIDERS:
        m = enum_name(p)
        vault_credential = MODEL_ONLY_PROVIDERS.get(p, m)
        # Model-only providers reuse an existing vault credential type; use the
        # member's display name (e.g. "github" -> "GitHub") for the label.
        label = vault_credential if p in MODEL_ONLY_PROVIDERS else m
        lines.append("  {")
        lines.append(f"    value: ModelProviderEnum.{m},")
        lines.append(f'    label: "{label}",')
        lines.append(f"    vaultCredentialType: VaultCredentialAppsEnum.{vault_credential},")
        lines.append(f'    description: "Enable {p} models.",')
        lines.append("  },")
    lines.append("];")
    lines.append("")
    lines.append("export const getVaultCredentialTypeForProvider = (providerType: ModelProviderEnum): string =>")
    lines.append("  VaultCredentialAppsEnum[")
    lines.append("    modelProviderDefinitions.find((p) => p.value === providerType)?.vaultCredentialType ??")
    lines.append("      VaultCredentialAppsEnum.GeneralCredentials")
    lines.append("  ];")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Add-only generation. The enum, mapper and definition files also carry
# hand-maintained content (Corsair integration members, catalog-driven backfill
# wiring, curated brand icons). Regeneration therefore only appends entries that
# are genuinely missing and never rewrites existing content.
# ---------------------------------------------------------------------------
def _read_text(file_path: str) -> str:
    with open(file_path, "r") as f:
        return f.read()


def _write_text(file_path: str, text: str) -> None:
    with open(file_path, "w") as f:
        f.write(text)


def _merge_enum_members(file_path: str, fallback_content: str, entries, member_pattern: str) -> None:
    """Append generated enum members that are missing from an existing file."""
    if not os.path.exists(file_path):
        _write_text(file_path, fallback_content)
        return
    text = _read_text(file_path)
    present = set(re.findall(member_pattern, text, re.MULTILINE))
    missing = [block for name, block in entries if name not in present]
    if not missing:
        return
    close = text.rfind("}")
    if close == -1:
        raise ValueError(f"No closing brace found in {file_path}")
    _write_text(file_path, text[:close] + "".join(missing) + text[close:])


def _merge_record_entries(file_path: str, record_start: str, fallback_content: str, entries) -> None:
    """Append generated record entries that are missing from an existing mapper."""
    if not os.path.exists(file_path):
        _write_text(file_path, fallback_content)
        return
    text = _read_text(file_path)
    present = set(re.findall(r"\[VaultCredentialAppsEnum\.([A-Za-z0-9_]+)\]", text))
    missing = [block for name, block in entries if name not in present]
    if not missing:
        return
    start = text.index(record_start)
    close = text.index("\n};", start)
    block = "".join(missing).rstrip("\n")
    _write_text(file_path, text[:close] + "\n" + block + text[close:])


def _merge_array_entries(file_path: str, array_start: str, fallback_content: str, entries) -> None:
    """Append generated array entries that are missing from an existing definition list."""
    if not os.path.exists(file_path):
        _write_text(file_path, fallback_content)
        return
    text = _read_text(file_path)
    present = set(re.findall(r"value:\s*ModelProviderEnum\.([A-Za-z0-9_]+),", text))
    missing = [block for name, block in entries if name not in present]
    if not missing:
        return
    start = text.index(array_start)
    close = text.index("\n];", start)
    block = "".join(missing).rstrip("\n")
    _write_text(file_path, text[:close] + "\n" + block + text[close:])


def generate_vault_credential_enum_entries():
    for provider in NEW_PROVIDERS:
        member = enum_name(provider)
        yield member, f'    [Description("{provider} Credentials")]\n    {member},\n'


def generate_llm_provider_enum_entries():
    for provider in MODEL_PROVIDERS:
        member = enum_name(provider)
        yield member, f'    [Description("{provider} provider")]\n    {member},\n'


def generate_vault_credential_apps_enum_entries():
    for provider in NEW_PROVIDERS:
        member = enum_name(provider)
        yield member, f"  {member},\n"


def generate_model_provider_enum_entries():
    for provider in MODEL_PROVIDERS:
        member = enum_name(provider)
        yield member, f'  {member} = "{provider}",\n'


def generate_vault_credential_select_options_entries():
    for provider in NEW_PROVIDERS:
        member = enum_name(provider)
        yield member, f'  [VaultCredentialAppsEnum.{member}]: {{ label: "{member}", value: "{member}" }},\n'


def generate_app_to_vault_credential_name_mapper_entries():
    for provider in NEW_PROVIDERS:
        member = enum_name(provider)
        yield member, f'  [VaultCredentialAppsEnum.{member}]: "{provider}_credentials",\n'


def generate_vault_credential_app_icon_mapper_entries():
    for provider in NEW_PROVIDERS:
        member = enum_name(provider)
        yield member, f'  [VaultCredentialAppsEnum.{member}]: "/assets/CredentialManager.svg",\n'


def generate_model_provider_definition_entries():
    for provider in MODEL_PROVIDERS:
        member = enum_name(provider)
        vault_credential = MODEL_ONLY_PROVIDERS.get(provider, member)
        label = vault_credential if provider in MODEL_ONLY_PROVIDERS else member
        yield member, (
            "  {\n"
            f"    value: ModelProviderEnum.{member},\n"
            f'    label: "{label}",\n'
            f"    vaultCredentialType: VaultCredentialAppsEnum.{vault_credential},\n"
            f'    description: "Enable {provider} models.",\n'
            "  },\n"
        )


def _inject_between(file_path: str, start_marker: str, end_marker: str, content: str) -> None:
    """Replace the region between two sentinel markers in a file with content."""
    with open(file_path, "r") as f:
        text = f.read()
    start = text.index(start_marker)
    end = text.index(end_marker) + len(end_marker)
    text = text[:start] + start_marker + "\n" + content + end_marker + text[end:]
    with open(file_path, "w") as f:
        f.write(text)


def main() -> None:
    base = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(base, "..", "Generated")
    os.makedirs(out_dir, exist_ok=True)

    repo = os.path.abspath(os.path.join(base, "..", "..", "..", "..", "..", "..", "..", ".."))

    _write_text(os.path.join(out_dir, "LiteLLMProviderCatalog.cs"), generate_catalog())

    _merge_enum_members(
        os.path.join(repo, "apis", "WorcBackend-legacy", "AspNetToolkit", "Enums", "VaultCredentialTypesEnum.cs"),
        generate_vault_credential_enum(),
        generate_vault_credential_enum_entries(),
        r"^\s*([A-Za-z0-9_]+),?\s*$",
    )
    _merge_enum_members(
        os.path.join(repo, "apis", "WorcBackend-legacy", "WorkspaceAPIs", "Enums", "LLMProviderTypesEnum.cs"),
        generate_llm_provider_enum(),
        generate_llm_provider_enum_entries(),
        r"^\s*([A-Za-z0-9_]+),?\s*$",
    )

    # Inject generated DTOs into VaultCredentialsDto.cs (sentinel region) so all
    # credential DTOs live with their hand-written counterparts.
    credentials_dto_path = os.path.join(
        repo, "apis", "WorcBackend-legacy", "WorkspaceAPIs",
        "Features", "Orchestrator", "VaultCredentials", "DTOs", "VaultCredentialsDto.cs",
    )
    _inject_between(
        credentials_dto_path,
        "// >>> LiteLLMProviderDtos:START <<<",
        "// >>> LiteLLMProviderDtos:END <<<",
        generate_dtos(),
    )

    # Frontend config-json (workspace).
    cfg_dir = os.path.join(
        repo, "clients", "web-apps", "apps", "workspace", "src", "features",
        "dynamic-config-panel", "constants", "config-json",
    )
    os.makedirs(cfg_dir, exist_ok=True)
    generate_config_json_files(cfg_dir)

    # Frontend workspace vault-credential + model provider files.
    vault_dir = os.path.join(
        repo, "clients", "web-apps", "apps", "workspace", "src", "features",
        "02-configure", "vault-credentials",
    )
    mp_dir = os.path.join(
        repo, "clients", "web-apps", "apps", "workspace", "src", "features",
        "05-tenant-admin", "model-providers",
    )
    os.makedirs(vault_dir, exist_ok=True)
    os.makedirs(os.path.join(vault_dir, "vault-credential-config", "constants"), exist_ok=True)
    os.makedirs(mp_dir, exist_ok=True)

    _merge_enum_members(
        os.path.join(vault_dir, "enums", "vault-credential-apps.enum.ts"),
        generate_vault_credential_apps_enum(),
        generate_vault_credential_apps_enum_entries(),
        r"^\s*([A-Za-z0-9_]+),?\s*$",
    )
    _merge_enum_members(
        os.path.join(mp_dir, "enums", "model-provider-enum.ts"),
        generate_model_provider_enum(),
        generate_model_provider_enum_entries(),
        r'^\s*([A-Za-z0-9_]+)\s*=\s*"[^"]*",?\s*$',
    )

    _merge_record_entries(
        os.path.join(vault_dir, "vault-credential-config", "constants", "vault-credential-app-select-options.constant.ts"),
        "export const vaultCredentialAppsSelectOptions",
        generate_vault_credential_select_options(),
        generate_vault_credential_select_options_entries(),
    )
    _merge_record_entries(
        os.path.join(vault_dir, "vault-credential-config", "constants", "app-to-vault-credential-name-mapper.constant.ts"),
        "export const appToVaultCredentialNameMapper",
        generate_app_to_vault_credential_name_mapper(),
        generate_app_to_vault_credential_name_mapper_entries(),
    )
    _merge_record_entries(
        os.path.join(vault_dir, "vault-credential-config", "constants", "vault-credential-app-icon-mapper.constant.ts"),
        "export const vaultCredentialAppIconMapper",
        generate_vault_credential_app_icon_mapper(),
        generate_vault_credential_app_icon_mapper_entries(),
    )

    _merge_array_entries(
        os.path.join(mp_dir, "constants", "model-provider-definitions.ts"),
        "export const modelProviderDefinitions",
        generate_model_provider_definitions(),
        generate_model_provider_definition_entries(),
    )

    print(f"Generated {len(NEW_PROVIDERS)} new provider types "
          f"({len(PROVIDERS)} total, {len(REUSED_PROVIDERS)} reused).")


if __name__ == "__main__":
    main()
