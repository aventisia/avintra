using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace RunnerApp.Services;

/// <summary>
/// Local-only WebSocket client used in local (non-service) execution.
///
/// Connects to the Tauri app's local WebSocket server (ws://127.0.0.1:{port}).
/// Outbound: pushes per-node progress JSON so the Studio app can render live node
/// indicators. Inbound: accepts abort/pause/resume control messages, filtered to the
/// current job id because the Tauri WS server is a broadcast echo bus (every peer sees
/// every message).
/// </summary>
public sealed class LocalWebSocketClient : IAsyncDisposable
{
    private readonly int _port;
    private readonly Guid _jobId;
    private readonly ClientWebSocket _socket;
    private readonly CancellationTokenSource _connectCts = new();
    private readonly object _lock = new();
    private bool _disposed;

    /// <summary>Raised when a control command for the current job is received.</summary>
    public event EventHandler<LocalControlCommand>? CommandReceived;

    /// <summary>Raised when the local WebSocket is lost (or fails to connect).</summary>
    public event EventHandler<string>? Disconnected;

    public LocalWebSocketClient(int port, Guid jobId)
    {
        _port = port;
        _jobId = jobId;
        _socket = new ClientWebSocket();
    }

    /// <summary>
    /// Connects to the local WS server. Does not throw on a failed connect; it raises
    /// <see cref="Disconnected"/> instead so progress reporting degrades gracefully.
    /// </summary>
    public async Task ConnectAsync(CancellationToken ct = default)
    {
        var uri = new Uri($"ws://127.0.0.1:{_port}");
        try
        {
            using var linked = CancellationTokenSource.CreateLinkedTokenSource(_connectCts.Token, ct);
            await _socket.ConnectAsync(uri, linked.Token);
            _ = ReceiveLoopAsync();
        }
        catch (Exception ex)
        {
            Disconnected?.Invoke(this, $"Failed to connect to local WebSocket at {uri}: {ex.Message}");
        }
    }

    /// <summary>Pushes a per-node progress message to the Studio app over the local WS.</summary>
    public Task PushNodeProgressAsync(
        string nodeId,
        string status,
        string nodeName,
        CancellationToken ct = default)
    {
        var payload = JsonSerializer.Serialize(new
        {
            type = "nodeProgress",
            jobId = _jobId,
            nodeId,
            status,
            nodeName
        });
        return SendAsync(payload, ct);
    }

    /// <summary>Disconnect and release resources.</summary>
    public async Task DisconnectAsync()
    {
        if (_disposed) return;
        _disposed = true;
        try
        {
            _connectCts.Cancel();
            if (_socket.State is WebSocketState.Open or WebSocketState.CloseReceived)
            {
                await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
            }
            _socket.Dispose();
        }
        catch
        {
            // Best-effort close; nothing to surface.
        }
    }

    public async ValueTask DisposeAsync()
    {
        await DisconnectAsync();
        _connectCts.Dispose();
        GC.SuppressFinalize(this);
    }

    private async Task SendAsync(string payload, CancellationToken ct)
    {
        if (_socket.State != WebSocketState.Open)
            return;

        var bytes = Encoding.UTF8.GetBytes(payload);
        try
        {
            lock (_lock)
            {
                _socket.SendAsync(bytes, WebSocketMessageType.Text, true, ct)
                    .GetAwaiter().GetResult();
            }
        }
        catch
        {
            // Ignore send failures; progress is best-effort.
        }
    }

    private async Task ReceiveLoopAsync()
    {
        var buffer = new byte[16 * 1024];
        try
        {
            while (_socket.State == WebSocketState.Open)
            {
                var received = new List<byte>();
                WebSocketReceiveResult result;
                do
                {
                    result = await _socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                        break;
                    if (result.Count > 0)
                        received.AddRange(buffer.Take(result.Count));
                } while (!result.EndOfMessage);

                if (result.MessageType == WebSocketMessageType.Close)
                    break;

                var json = Encoding.UTF8.GetString(received.ToArray());
                OnMessage(json);
            }
        }
        catch
        {
            // Socket closed / connection lost.
        }
        finally
        {
            Disconnected?.Invoke(this, "Local WebSocket connection closed.");
        }
    }

    private void OnMessage(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // Ignore messages that are not for this job or not a control command.
            // The Tauri WS server broadcasts every message to every peer, so strict filtering is required.
            if (!root.TryGetProperty("type", out var type) || type.GetString() != "control")
                return;
            if (!root.TryGetProperty("jobId", out var jobId) || !jobId.TryGetGuid(out var id) || id != _jobId)
                return;

            var command = root.GetProperty("command").GetString();
            if (!Enum.TryParse<LocalControlCommand>(command, ignoreCase: true, out var parsed))
                return;

            CommandReceived?.Invoke(this, parsed);
        }
        catch (Exception)
        {
            // Ignore malformed messages.
        }
    }
}

/// <summary>Control commands the Studio app can send to a local runner over the WS bus.</summary>
public enum LocalControlCommand
{
    Abort,
    Pause,
    Resume
}
