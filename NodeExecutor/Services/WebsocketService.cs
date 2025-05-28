using Newtonsoft.Json;
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace NodeExecutor.Services
{
    public class WebSocketHelper
    {
        private ClientWebSocket _socket;
        private readonly Uri _serverUri = new Uri("ws://127.0.0.1:9001");
        private CancellationTokenSource _cts;

        public event Action<string, string> OnCommandReceived;

        public async Task ConnectAsync()
        {
            _socket = new ClientWebSocket();
            _cts = new CancellationTokenSource();

            try
            {
                await _socket.ConnectAsync(_serverUri, _cts.Token);
                Console.WriteLine("WebSocket connected");

                // Send initial command to let tauri-app know that execution has started
                await SendCommandAsync("start");

                _ = ReceiveLoop();
            }
            catch (Exception ex)
            {
                Console.WriteLine("WebSocket connection failed: " + ex.Message);
            }
        }

        public async Task SendCommandAsync(string command, string data = "")
        {
            if (_socket == null || _socket.State != WebSocketState.Open)
                return;

            var msg = new
            {
                source = "wpf",
                command = command,
                data = data
            };

            var json = JsonConvert.SerializeObject(msg);
            var buffer = Encoding.UTF8.GetBytes(json);
            var segment = new ArraySegment<byte>(buffer);

            try
            {
                await _socket.SendAsync(segment, WebSocketMessageType.Text, true, _cts.Token);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Failed to send message: " + ex.Message);
            }
        }

        private async Task ReceiveLoop()
        {
            var buffer = new byte[1024];

            while (_socket.State == WebSocketState.Open)
            {
                try
                {
                    var result = await _socket.ReceiveAsync(new ArraySegment<byte>(buffer), _cts.Token);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", _cts.Token);
                        break;
                    }

                    var json = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    var msg = JsonConvert.DeserializeObject<CommandMessage>(json);

                    if (msg.Source != "wpf")
                    {
                        OnCommandReceived?.Invoke(msg.Command, msg.Data);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("WebSocket receive error: " + ex.Message);
                    break;
                }
            }
        }

        public async Task DisconnectAsync()
        {
            if (_socket != null && _socket.State == WebSocketState.Open)
            {
                await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Client disconnect", CancellationToken.None);
            }
        }

        private class CommandMessage
        {
            public string Source { get; set; }
            public string Command { get; set; }
            public string Data { get; set; }
        }
    }
}
