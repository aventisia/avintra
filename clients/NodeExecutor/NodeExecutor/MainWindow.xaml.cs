using DynamicExpresso;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using NodeExecutor.Models;
using NodeExecutor.Services;
using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;

namespace NodeExecutor
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private WebSocketHelper _webSocket;
        private AppTimerService _appTimer;
        private readonly ExecutionContext _executionContext = new ExecutionContext();
        private readonly Interpreter _interpreter = new Interpreter(); // Dynamic expression interpreter to save variables and evaluate expressions
        private readonly string _wsPort;
        private readonly string _agentId;
        private readonly string _agentName;
        private readonly string _accessToken;

        public MainWindow(string wsPort, string agentId, string agentName, string accessToken)
        {
            InitializeComponent();

            // Set the window position to the bottom right of the screen
            Loaded += OnLoaded;
            Closed += OnClosed;

            // Set the arguments
            this._wsPort = wsPort;
            this._agentId = agentId;
            this._agentName = agentName;
            this._accessToken = accessToken;

            // Start the WebSocket and timer
            InitServices();
        }

        // Window Closed Event
        private void OnClosed(object sender, EventArgs e)
        {
            // Close the WebSocket connection
            _webSocket?.DisconnectAsync();
        }

        // Window Loaded Event
        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            // Set the window position to the bottom right of the screen
            WindowPositionService.PositionBottomRight(this);

            // Set agent name and node name
            lbl_AgentName.Text = _agentName;
            lbl_NodeName.Text = "Initializing...";
        }

        // Dragging the Window 
        private void Border_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Left)
                this.DragMove();
        }

        // Initialization Services
        private void InitServices()
        {
            // Initialize the WebSocket connection
            _webSocket = new WebSocketHelper(_wsPort);
            _webSocket.OnCommandReceived += HandleWebsocketCommand;
            _ = _webSocket.ConnectAsync(); // Fire and forget

            // Initialize the timer
            _appTimer = new AppTimerService(TimeSpan.FromSeconds(1));
            _appTimer.OnTick += UpdateTimerUI;
            _appTimer.Start();
        }

        // Receive command from websocket server
        private void HandleWebsocketCommand(string command, string data)
        {
            Dispatcher.Invoke(() =>
            {
                switch (command.ToLower())
                {
                    case "pause":
                        DoPause();
                        break;
                    case "resume":
                        DoResume();
                        break;
                    case "abort":
                    case "complete":
                    case "error":
                        DoAbort();
                        break;
                    case "process-node":
                        ExecuteNodeAsync(data);
                        break;
                    case "check-condition":
                        ExecuteConditionAsync(data);
                        break;
                    case "check-loop-condition":
                        ExecuteLoopAsync(data);
                        break;
                }
            });
        }

        private void UpdateTimerUI(TimeSpan elapsed)
        {
            lbl_Timer.Text = $"{elapsed:mm\\:ss}";
        }

        // Pause Button
        private async void btn_Pause_ClickAsync(object sender, RoutedEventArgs e)
        {
            // Send the resume command to the server
            await _webSocket.SendCommandAsync("pause");

            // Resume execution
            DoPause();
        }

        // Resume Button
        private async void btn_Resume_ClickAsync(object sender, RoutedEventArgs e)
        {
            // Send the resume command to the server
            await _webSocket.SendCommandAsync("resume");

            // Resume execution
            DoResume();
        }

        // Abort Button
        private async void btn_Abort_ClickAsync(object sender, RoutedEventArgs e)
        {
            // Send the stop command to the server
            await _webSocket.SendCommandAsync("abort");

            // Abort execution
            DoAbort();
        }

        private void DoPause()
        {
            // Hide the Pause button and show the Resume button
            btn_Pause.Visibility = Visibility.Collapsed;
            btn_Resume.Visibility = Visibility.Visible;

            // Pause the timer
            _appTimer.Pause();
        }

        private void DoResume()
        {
            // Hide the Resume button and show the Pause button
            btn_Resume.Visibility = Visibility.Collapsed;
            btn_Pause.Visibility = Visibility.Visible;

            // Resume the timer
            _appTimer.Resume();
        }

        private void DoAbort()
        {
            // Stop the timer if it's running
            _appTimer?.Pause();

            // Close the application
            Application.Current.Shutdown();
        }

        private async void ExecuteConditionAsync(string data)
        {
            // Set the start time for the node execution
            var startTime = DateTime.UtcNow;

            // Deserialize the node data
            var conditionalBranchNodeData = JsonConvert.DeserializeObject<ConditionalBranchNodeData>(data);

            if (conditionalBranchNodeData == null)
            {
                MessageBox.Show("Invalid node data received.");
                return;
            }

            // Set the node name
            Dispatcher.Invoke(() =>
            {
                lbl_NodeName.Text = conditionalBranchNodeData.NodeName.Length > 0
                                        ? conditionalBranchNodeData.NodeName
                                        : "Node name not found";
            });

            // Run node execution in a background task
            await Task.Run(async () =>
            {
                // Execute condition
                var (conditionResult, nodeExecutionLog) =
                    ActivityExecutorService.ExecuteCondition(conditionalBranchNodeData.Id, conditionalBranchNodeData.NodeName, conditionalBranchNodeData.Conditions, _executionContext, _interpreter, startTime);

                // Send the execution log back to the server (must be awaited on UI thread)
                await Dispatcher.InvokeAsync(async () =>
                {
                    await _webSocket.SendCommandAsync("save-execution-log", JsonConvert.SerializeObject(nodeExecutionLog, new JsonSerializerSettings
                    {
                        ContractResolver = new CamelCasePropertyNamesContractResolver()
                    }));

                    // Check if the node execution was successful
                    if (!nodeExecutionLog.IsSuccess)
                    {
                        await _webSocket.SendCommandAsync("error");
                        DoAbort();
                        return;
                    }

                    // Send next node command to the server
                    await _webSocket.SendCommandAsync("next-node",
                                nodeExecutionLog.IsSuccess && conditionResult
                                    ? conditionalBranchNodeData.NextNodeId
                                    : conditionalBranchNodeData.ConditionalNodeId);
                });
            });
        }

        private async void ExecuteLoopAsync(string data)
        {
            // Set the start time for the node execution
            var startTime = DateTime.UtcNow;

            // Deserialize the node data
            var loopNodeData = JsonConvert.DeserializeObject<WpfLoopNodeData>(data);

            if (loopNodeData == null)
            {
                MessageBox.Show("Invalid node data received.");
                return;
            }

            // Set the node name
            Dispatcher.Invoke(() =>
            {
                lbl_NodeName.Text = loopNodeData.NodeName.Length > 0 ? loopNodeData.NodeName : "Node name not found";
            });

            // Initialize the result variables
            (bool conditionResult, NodeExecutionLog nodeExecutionLog) result = (false, null);

            // Run node execution in a background task
            await Task.Run(async () =>
            {
                // Execute condition
                if (loopNodeData.LoopType == "ConditionalLoop")
                {
                    result = ActivityExecutorService.ExecuteCondition(loopNodeData.Id, loopNodeData.NodeName, loopNodeData.Conditions, _executionContext, _interpreter, startTime);
                }
                //else if (loopNodeData.LoopType == "ForEachLoop")
                //{
                //    result = ActivityExecutorService.MoveNextListItem(
                //        _agentId,
                //        _agentName,
                //        _accessToken,
                //        loopNodeData.ListVariableName,
                //        loopNodeData.ItemVariableName,
                //        loopNodeData.ItemIndexVariableName,
                //        _executionContext,
                //        _interpreter);
                //}

                // Send the execution log back to the server (must be awaited on UI thread)
                await Dispatcher.InvokeAsync(async () =>
                {
                    await _webSocket.SendCommandAsync("save-execution-log", JsonConvert.SerializeObject(result.nodeExecutionLog, new JsonSerializerSettings
                    {
                        ContractResolver = new CamelCasePropertyNamesContractResolver()
                    }));

                    // Check if the node execution was successful
                    if (!result.nodeExecutionLog.IsSuccess)
                    {
                        await _webSocket.SendCommandAsync("error");
                        DoAbort();
                        return;
                    }

                    // Process next node
                    await _webSocket.SendCommandAsync("next-node",
                        result.nodeExecutionLog.IsSuccess && result.conditionResult
                            ? loopNodeData.NextNodeId
                            : loopNodeData.MergeBranchesNodeId);
                });
            });
        }

        private async void ExecuteNodeAsync(string data)
        {
            // Set the start time for the node execution
            var startTime = DateTime.UtcNow;

            // Deserialize the node data
            var nodeData = ActivityExecutorService.ConvertNodeData(_agentId, _agentName, _accessToken, data, _executionContext, _interpreter);

            if (nodeData == null)
            {
                MessageBox.Show("Invalid node data received.");
                return;
            }

            // Set the node name
            Dispatcher.Invoke(() =>
            {
                lbl_NodeName.Text = nodeData.NodeName.Length > 0 ? nodeData.NodeName : "Node name not found";
            });

            // Run node execution in a background task
            await Task.Run(async () =>
            {
                // Execute single node
                var (isSuccess, nodeExecutionLog) = ActivityExecutorService.ExecuteNode(nodeData, _executionContext, _interpreter, startTime);

                // Send the execution log back to the server (must be awaited on UI thread)
                await Dispatcher.InvokeAsync(async () =>
                {
                    await _webSocket.SendCommandAsync("save-execution-log", JsonConvert.SerializeObject(nodeExecutionLog, new JsonSerializerSettings
                    {
                        ContractResolver = new CamelCasePropertyNamesContractResolver()
                    }));

                    // Check if the node execution was successful
                    if (!isSuccess)
                    {
                        await _webSocket.SendCommandAsync("error");
                        DoAbort();
                        return;
                    }

                    // Send next node command to the server
                    await _webSocket.SendCommandAsync("next-node", nodeData.NextNodeId);
                });
            });
        }
    }
}