using AspNetToolkit.Enums;

namespace WorkspaceAPIs.Features.Corsair;

internal static class CorsairPluginResolver
{
    public static string? ResolveApiKeyPlugin(AppSecretTypesEnum type, CorsairConfigRepository configRepository)
    {
        var mappedPlugin = type switch
        {
            AppSecretTypesEnum.OpenAI => "openai",
            AppSecretTypesEnum.GoogleGemini => "gemini",
            AppSecretTypesEnum.OpenRouter => "openrouter",
            AppSecretTypesEnum.Anthropic => "anthropicadministrator",
            AppSecretTypesEnum.ElevenLabs => "elevenlabs",
            AppSecretTypesEnum.Groq => "groqcloud",
            AppSecretTypesEnum.Mistral => "mistral",
            AppSecretTypesEnum.GitHub => "github",
            AppSecretTypesEnum.SendGrid => "resend",
            AppSecretTypesEnum.Twilio => "twilio",
            _ => null
        };

        return mappedPlugin ?? configRepository.GetPluginIdForVaultType(type.ToString());
    }
}