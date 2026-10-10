using AspNetToolkit.Enums;

namespace WorkspaceAPIs.Features.Corsair;

internal static class CorsairPluginResolver
{
    public static string? ResolveApiKeyPlugin(VaultCredentialTypesEnum type, CorsairConfigRepository configRepository)
    {
        var mappedPlugin = type switch
        {
            VaultCredentialTypesEnum.OpenAI => "openai",
            VaultCredentialTypesEnum.GoogleGemini => "gemini",
            VaultCredentialTypesEnum.OpenRouter => "openrouter",
            VaultCredentialTypesEnum.Anthropic => "anthropicadministrator",
            VaultCredentialTypesEnum.ElevenLabs => "elevenlabs",
            VaultCredentialTypesEnum.Groq => "groqcloud",
            VaultCredentialTypesEnum.Mistral => "mistral",
            VaultCredentialTypesEnum.GitHub => "github",
            VaultCredentialTypesEnum.SendGrid => "resend",
            VaultCredentialTypesEnum.Twilio => "twilio",
            _ => null
        };

        return mappedPlugin ?? configRepository.GetPluginIdForVaultType(type.ToString());
    }
}