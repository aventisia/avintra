using System.Net;
using System.Net.Sockets;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Validates custom-tool base URLs and blocks requests to non-public hosts.
/// </summary>
public static class CustomToolUrlHelpers
{
    private static readonly TimeSpan ResolutionTimeout = TimeSpan.FromSeconds(30);

    private static readonly (byte[] Network, int PrefixLength)[] BlockedIPv4Networks =
    [
        (new byte[] { 0, 0, 0, 0 }, 8),
        (new byte[] { 10, 0, 0, 0 }, 8),
        (new byte[] { 100, 64, 0, 0 }, 10),
        (new byte[] { 127, 0, 0, 0 }, 8),
        (new byte[] { 169, 254, 0, 0 }, 16),
        (new byte[] { 172, 16, 0, 0 }, 12),
        (new byte[] { 192, 0, 0, 0 }, 24),
        (new byte[] { 192, 0, 2, 0 }, 24),
        (new byte[] { 192, 88, 99, 0 }, 24),
        (new byte[] { 192, 168, 0, 0 }, 16),
        (new byte[] { 198, 18, 0, 0 }, 15),
        (new byte[] { 198, 51, 100, 0 }, 24),
        (new byte[] { 203, 0, 113, 0 }, 24),
        (new byte[] { 224, 0, 0, 0 }, 4),
        (new byte[] { 240, 0, 0, 0 }, 4),
    ];

    private static readonly (byte[] Network, int PrefixLength)[] BlockedIPv6Networks =
    [
        (new byte[] { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }, 128),
        (new byte[] { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 }, 128),
        (new byte[] { 0x00, 0x64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }, 64),
        (new byte[] { 0x20, 0x01, 0x0d, 0xb8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }, 32),
        (new byte[] { 0xfc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }, 7),
        (new byte[] { 0xfe, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }, 10),
        (new byte[] { 0xfe, 0xc0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }, 10),
        (new byte[] { 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }, 8),
    ];

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
    /// Indicates whether a URL's host resolves only to public addresses.
    /// </summary>
    public static async Task<bool> IsPublicHostAsync(Uri uri, CancellationToken cancellationToken = default)
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

        using var resolutionCancellationTokenSource =
            CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        resolutionCancellationTokenSource.CancelAfter(ResolutionTimeout);
        try
        {
            var addresses = await Dns.GetHostAddressesAsync(host, resolutionCancellationTokenSource.Token);
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

    /// <summary>
    /// Indicates whether an address is publicly routable, matching the Python url_guard blocklist.
    /// </summary>
    public static bool IsPublicAddress(IPAddress address)
    {
        if (address.IsIPv4MappedToIPv6)
        {
            address = address.MapToIPv4();
        }

        if (address.AddressFamily == AddressFamily.InterNetwork)
        {
            var bytes = address.GetAddressBytes();
            return !BlockedIPv4Networks.Any(network => IsInNetwork(bytes, network.Network, network.PrefixLength));
        }

        if (address.AddressFamily == AddressFamily.InterNetworkV6)
        {
            var bytes = address.GetAddressBytes();
            return !BlockedIPv6Networks.Any(network => IsInNetwork(bytes, network.Network, network.PrefixLength));
        }

        return false;
    }

    private static bool IsInNetwork(byte[] address, byte[] network, int prefixLength)
    {
        var fullBytes = prefixLength / 8;
        for (var index = 0; index < fullBytes; index++)
        {
            if (address[index] != network[index])
            {
                return false;
            }
        }

        var remainingBits = prefixLength % 8;
        if (remainingBits == 0)
        {
            return true;
        }

        var mask = (byte)(0xFF << (8 - remainingBits));
        return (address[fullBytes] & mask) == (network[fullBytes] & mask);
    }
}
