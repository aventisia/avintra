using System.Net;
using System.Net.Sockets;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Validates custom-tool base URLs and blocks requests to non-public hosts.
/// </summary>
public static class CustomToolUrlHelpers
{
    private static readonly TimeSpan ResolutionTimeout = TimeSpan.FromSeconds(30);

    /// <summary>
    /// Parses a base URL string into an absolute http/https URI.
    /// </summary>
    public static bool TryCreateBaseUri(string? baseUrl, out Uri baseUri)
    {
        baseUri = null!;
        if (!Uri.TryCreate(baseUrl?.Trim() ?? string.Empty, UriKind.Absolute, out var parsed) ||
            parsed.Scheme is not ("http" or "https"))
        {
            return false;
        }

        baseUri = parsed;
        return true;
    }

    /// <summary>
    /// Indicates whether a URL's host resolves only to public addresses, blocking
    /// loopback, private, link-local and unique-local targets and their DNS results.
    /// </summary>
    public static async Task<bool> IsPublicHostAsync(Uri uri)
    {
        if (uri.IsLoopback)
        {
            return false;
        }

        var host = uri.DnsSafeHost;
        if (IPAddress.TryParse(host, out var literal))
        {
            return IsPublicAddress(literal);
        }

        using var dnsCancellationTokenSource = new CancellationTokenSource(ResolutionTimeout);
        try
        {
            var addresses = await Dns.GetHostAddressesAsync(host, dnsCancellationTokenSource.Token);
            return addresses.Length > 0 && addresses.All(IsPublicAddress);
        }
        catch (SocketException)
        {
            return false;
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }

    private static bool IsPublicAddress(IPAddress address)
    {
        if (IPAddress.IsLoopback(address))
        {
            return false;
        }

        if (address.IsIPv4MappedToIPv6)
        {
            address = address.MapToIPv4();
        }

        if (address.AddressFamily == AddressFamily.InterNetwork)
        {
            var bytes = address.GetAddressBytes();
            return bytes[0] switch
            {
                0 or 10 or 127 => false,
                _ => !(bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31)
                     && !(bytes[0] == 192 && bytes[1] == 168)
                     && !(bytes[0] == 169 && bytes[1] == 254),
            };
        }

        if (address.AddressFamily == AddressFamily.InterNetworkV6)
        {
            var bytes = address.GetAddressBytes();
            return !address.IsIPv6LinkLocal
                   && !address.IsIPv6SiteLocal
                   && (bytes[0] & 0xFE) != 0xFC;
        }

        return false;
    }
}
