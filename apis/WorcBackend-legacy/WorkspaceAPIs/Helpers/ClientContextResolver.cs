using System.Text.RegularExpressions;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Resolves the client context (type and version) for an incoming HTTP request.
/// </summary>
public interface IClientContextResolver
{
    /// <summary>
    /// Gets the display origin for an Agent Builder (studio) job.
    /// </summary>
    /// <returns>
    /// "Desktop App v{version}" when the request comes from the Tauri desktop app,
    /// otherwise "Agent Builder (cloud)".
    /// </returns>
    string GetAgentBuilderOrigin();

    /// <summary>
    /// Gets the execution location for an unpublished job.
    /// </summary>
    /// <returns>
    /// The Agent Builder origin based on the request client context.
    /// </returns>
    string GetUnpublishedExecutionLocation();
}

/// <summary>
/// Default implementation of <see cref="IClientContextResolver"/> that inspects
/// explicit client headers first, then falls back to the User-Agent string.
/// </summary>
public sealed partial class ClientContextResolver : IClientContextResolver
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ClientContextResolver(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    /// <inheritdoc />
    public string GetAgentBuilderOrigin()
    {
        var headers = _httpContextAccessor.HttpContext?.Request?.Headers;
        if (headers is null)
        {
            return ClientContextConstants.AgentBuilderCloud;
        }

        // Prefer explicit headers when the frontend sends them.
        var clientType = headers[ClientContextConstants.ClientTypeHeader].FirstOrDefault();
        var clientVersion = headers[ClientContextConstants.ClientVersionHeader].FirstOrDefault();

        if (IsDesktopClient(clientType))
        {
            return FormatDesktopAppOrigin(clientVersion);
        }

        // Fall back to User-Agent parsing.
        var userAgent = headers.UserAgent.FirstOrDefault();
        if (TryParseDesktopUserAgent(userAgent, out var version))
        {
            return FormatDesktopAppOrigin(version);
        }

        return ClientContextConstants.AgentBuilderCloud;
    }

    /// <inheritdoc />
    public string GetUnpublishedExecutionLocation()
    {
        return GetAgentBuilderOrigin();
    }

    private static bool IsDesktopClient(string? clientType)
    {
        return !string.IsNullOrWhiteSpace(clientType)
            && string.Equals(clientType.Trim(), ClientContextConstants.DesktopClientType, StringComparison.OrdinalIgnoreCase);
    }

    private static string FormatDesktopAppOrigin(string? version)
    {
        return string.IsNullOrWhiteSpace(version)
            ? ClientContextConstants.DesktopAppFallback
            : $"{ClientContextConstants.DesktopAppPrefix} v{version.Trim()}";
    }

    private static bool TryParseDesktopUserAgent(string? userAgent, out string? version)
    {
        version = null;

        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return false;
        }

        // Expected format: AvintraDesktopApp/0.1.93
        var match = DesktopUserAgentRegex().Match(userAgent);
        if (match.Success)
        {
            version = match.Groups["version"].Value;
            return true;
        }

        return false;
    }

    [GeneratedRegex(@"AvintraDesktopApp\/(?<version>[0-9]+(?:\.[0-9]+)*)", RegexOptions.IgnoreCase, "en-US")]
    private static partial Regex DesktopUserAgentRegex();
}

/// <summary>
/// Constants used by <see cref="ClientContextResolver"/>.
/// </summary>
public static class ClientContextConstants
{
    public const string ClientTypeHeader = "X-Client-Type";
    public const string ClientVersionHeader = "X-Client-Version";
    public const string DesktopClientType = "AvintraDesktopApp";
    public const string AgentBuilderCloud = "Agent Builder (cloud)";
    public const string DesktopAppFallback = "Desktop App";
    public const string DesktopAppPrefix = "Desktop App";
}
