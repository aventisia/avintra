using System.Net;
using System.Net.Sockets;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Creates HTTP handlers that pin custom-tool connections to public addresses.
/// </summary>
public static class CustomToolHttpHandlerFactory
{
    /// <summary>
    /// Creates a handler that disables redirects and re-validates DNS at connect time.
    /// </summary>
    public static SocketsHttpHandler Create()
    {
        return new SocketsHttpHandler
        {
            AllowAutoRedirect = false,
            ConnectCallback = ConnectAsync,
        };
    }

    private static async ValueTask<Stream> ConnectAsync(
        SocketsHttpConnectionContext context,
        CancellationToken cancellationToken)
    {
        var addresses = await Dns.GetHostAddressesAsync(context.DnsEndPoint.Host, cancellationToken);
        var publicAddresses = addresses.Where(CustomToolUrlHelpers.IsPublicAddress).ToArray();
        if (publicAddresses.Length == 0)
        {
            throw new HttpRequestException("The upstream host resolved to a non-public address.");
        }

        foreach (var address in publicAddresses)
        {
            var socket = new Socket(address.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
            try
            {
                await socket.ConnectAsync(new IPEndPoint(address, context.DnsEndPoint.Port), cancellationToken);
                return new NetworkStream(socket, ownsSocket: true);
            }
            catch
            {
                socket.Dispose();
            }
        }

        throw new HttpRequestException("The upstream host could not be reached.");
    }
}
