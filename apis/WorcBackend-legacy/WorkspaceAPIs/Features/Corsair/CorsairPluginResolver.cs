using AspNetToolkit.Enums;

namespace WorkspaceAPIs.Features.Corsair;

internal static class CorsairPluginResolver
{
    private static readonly string[] MicrosoftFamilyPluginIds =
        ["onedrive", "outlook", "sharepoint", "teams"];

    private static readonly string[] GoogleFamilyPluginIds =
    [
        "gmail",
        "googleaddressvalidation",
        "googlebigquery",
        "googlecalendar",
        "googlecloudvision",
        "googledocs",
        "googledrive",
        "googlemaps",
        "googlemeet",
        "googlesheets"
    ];

    private static readonly string[] SendGridFamilyPluginIds = ["resend", "sendgrid"];

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
            VaultCredentialTypesEnum.SendGrid => "sendgrid",
            VaultCredentialTypesEnum.Resend => "resend",
            VaultCredentialTypesEnum.Twilio => "twilio",
            _ => null
        };

        return mappedPlugin ?? configRepository.GetPluginIdForVaultCredentialType(type.ToString());
    }

    /// <summary>
    /// Resolves the base OAuth plugin for a vault credential type. Legacy family names keep
    /// their historical primary service; per-service types resolve from the generated catalog.
    /// </summary>
    public static string? ResolveOAuthPlugin(VaultCredentialTypesEnum type, CorsairConfigRepository configRepository) => type switch
    {
        VaultCredentialTypesEnum.M365 => "outlook",
        VaultCredentialTypesEnum.Teams => "teams",
        VaultCredentialTypesEnum.Onedrive => "onedrive",
        VaultCredentialTypesEnum.Sharepoint => "sharepoint",
        VaultCredentialTypesEnum.GoogleWorkspace => "gmail",
        _ => configRepository.GetOAuthPluginIdForVaultCredentialType(type.ToString())
    };

    /// <summary>
    /// Builds the per-credential plugin instance id the sidecar registers for OAuth
    /// credentials: <c>&lt;base-plugin&gt;__&lt;credential-id&gt;</c>.
    /// </summary>
    public static string ToPluginInstance(string basePluginId, Guid vaultCredentialId) =>
        $"{basePluginId.Trim().ToLowerInvariant()}__{vaultCredentialId:N}";

    /// <summary>
    /// Plugin ids a credential of a legacy family type could reach before per-service
    /// flattening. Only credentials flagged <c>LegacyFamilyAccess</c> may use them.
    /// </summary>
    public static IReadOnlyList<string> ResolveLegacyFamilyPluginIds(VaultCredentialTypesEnum type) => type switch
    {
        VaultCredentialTypesEnum.M365
            or VaultCredentialTypesEnum.Outlook
            or VaultCredentialTypesEnum.Teams
            or VaultCredentialTypesEnum.Onedrive
            or VaultCredentialTypesEnum.Sharepoint => MicrosoftFamilyPluginIds,
        VaultCredentialTypesEnum.GoogleWorkspace
            or VaultCredentialTypesEnum.Gmail => GoogleFamilyPluginIds,
        VaultCredentialTypesEnum.SendGrid => SendGridFamilyPluginIds,
        _ => Array.Empty<string>()
    };
}
