using DynamicExpresso;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using NodeExecutor.Models;
using NodeExecutor.Services;
using System;
using System.Collections.Generic;
using System.Linq;
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
        private readonly Interpreter _interpreter; // Dynamic expression interpreter to save variables and evaluate expressions
        private readonly string _wsPort;
        private readonly string _agentId;
        private readonly string _agentName;
        private readonly string _accessToken;

        public MainWindow(
            string wsPort,
            string agentId,
            string agentName,
            string inputArgumentsJson,
            string accessToken)
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

            // Initialize interpreter with lambda expressions enabled and case-insensitive variable names
            this._interpreter = new Interpreter(InterpreterOptions.Default | InterpreterOptions.LambdaExpressions | InterpreterOptions.CaseInsensitive);

            // Add the arguments to executionContext
            AddAgentMetadataToContext(_agentId, _agentName);
            AddArgumentsToContext("_accessToken", _accessToken);
            AddInputArgumentsToContext(inputArgumentsJson);

            // Start the WebSocket and timer
            InitServices();
        }

        // Add arguments to the execution context and interpreter variables so they can be used in the nodes
        private void AddArgumentsToContext(string name, string value)
        {
            _executionContext.Set(name, value);
            _interpreter.SetVariable(name, value);
        }

        // Add agent metadata as nested JObject in the execution context
        private void AddAgentMetadataToContext(string agentId, string agentName)
        {
            var agentMetadata = new JObject
            {
                ["id"] = agentId,
                ["name"] = agentName
            };

            _executionContext.Set("_agent", agentMetadata);
            _interpreter.SetVariable("_agent", agentMetadata);
        }

        // Parse and add input arguments as a nested object structure
        private void AddInputArgumentsToContext(string inputArgumentsJson)
        {
            try
            {
                var inputArgumentsObject = string.IsNullOrWhiteSpace(inputArgumentsJson)
                    ? new JObject()
                    : JObject.Parse(inputArgumentsJson);

                // Create a job object with inputArguments nested inside
                var jobObject = new JObject
                {
                    ["inputArguments"] = inputArgumentsObject
                };

                // Add to execution context
                _executionContext.Set("_job", jobObject);

                // Add to interpreter so it can be accessed via dot notation
                _interpreter.SetVariable("_job", jobObject);
            }
            catch
            {
                // Add empty structure as fallback
                var fallbackJob = new JObject
                {
                    ["inputArguments"] = new JObject()
                };
                _executionContext.Set("_job", fallbackJob);
                _interpreter.SetVariable("_job", fallbackJob);
            }
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
                    case "setup-execution-context":
                        SetupExecutionContextAsync(data);
                        break;
                    case "process-node":
                        ProcessNodeWithRetryAsync(data);
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

        private async void SetupExecutionContextAsync(string data)
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
                lbl_NodeName.Text = nodeData.NodeName.Length > 0 ? nodeData.NodeName : "Setting up execution context...";
            });

            // Run node execution in a background task
            await Task.Run(async () =>
            {
                // Execute single node
                var (isSuccess, nodeExecutionLog) = ActivityExecutorService.SetupExecutionContext(nodeData, _executionContext, _interpreter, startTime);

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
                else if (loopNodeData.LoopType == "ForEachLoop")
                {
                    result = ActivityExecutorService.MoveNextListItem(
                        loopNodeData.Id,
                        loopNodeData.NodeName,
                        loopNodeData.ListVariableName,
                        loopNodeData.ItemVariableName,
                        loopNodeData.ItemIndexVariableName,
                        _executionContext,
                        _interpreter,
                        startTime);
                }

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

        private async Task<(bool, string)> ExecuteNodeAsync(Guid nodeExecutionId, int retryAttempt, List<NodeLogKeyValue> retryInputs, string customNodeName, ActivityNodeData nodeData)
        {
            // Set the start time for the node execution
            var startTime = DateTime.UtcNow;

            // Initiaze the node execution log with default values
            var initialNodeExecutionLog = new NodeExecutionLog
            {
                NodeExecutionId = nodeExecutionId.ToString(),
                RetryAttempt = retryAttempt,
                NodeId = nodeData.Id,
                NodeName = nodeData.NodeName,
                NodeUniqueName = nodeData.CodeActivityName,
                IsSuccess = false,
                Duration = 0,
                Inputs = new List<NodeLogKeyValue>(),
                Outputs = new List<NodeLogKeyValue>()
            };

            // Set the node name
            Dispatcher.Invoke(() =>
            {
                lbl_NodeName.Text = string.IsNullOrWhiteSpace(customNodeName) ? "Node name not found" : customNodeName;
            });

            // Run node execution in a background task
            var (isSuccess, finalNodeExecutionLog) = await Task.Run(() =>
            {
                // Execute single node
                var result = ActivityExecutorService.ExecuteNode(initialNodeExecutionLog, nodeData, _executionContext, _interpreter);
                var updatedNodeExecutionLog = result.Item2;

                // Update duration
                updatedNodeExecutionLog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;

                // Add the retry inputs to the node execution log inputs (if provided). Need to add them after the other inputs are added
                if (retryInputs != null && retryInputs.Count > 0)
                    updatedNodeExecutionLog.Inputs.AddRange(retryInputs);

                return (result.Item1, updatedNodeExecutionLog);
            });

            // Serialize the nodeExecutionLog to JSON with camelCase property names
            var serializedNodeExecutionLog = JsonConvert.SerializeObject(finalNodeExecutionLog, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });

            // Send the execution log back to the server on UI thread
            await Dispatcher.InvokeAsync(async () =>
            {
                await _webSocket.SendCommandAsync("save-execution-log", serializedNodeExecutionLog);
            });

            return (isSuccess, serializedNodeExecutionLog);
        }

        private async void ProcessNodeWithRetryAsync(string data)
        {
            // Set nodeExecutionId for the current node execution
            var nodeExecutionId = Guid.NewGuid();

            // Deserialize the node data
            var nodeData = ActivityExecutorService.ConvertNodeData(_agentId, _agentName, _accessToken, data, _executionContext, _interpreter);

            if (nodeData == null)
            {
                MessageBox.Show("Invalid node data received.");
                return;
            }

            // Get OnError properties and set hasFailed variable
            bool enableAutoRetry = bool.TryParse(nodeData.NodeInputs.FirstOrDefault(w => w.Key.Equals("__OnError__EnableAutoRetry"))?.Value?.ToString(), out var parsedEnableAutoRetry) && parsedEnableAutoRetry;
            int retryLimit = int.TryParse(nodeData.NodeInputs.FirstOrDefault(w => w.Key.Equals("__OnError__RetryLimit"))?.Value?.ToString(), out var parsedRetryLimit) ? parsedRetryLimit : 3;
            int waitTimeBeforeRetryMs = int.TryParse(nodeData.NodeInputs.FirstOrDefault(w => w.Key.Equals("__OnError__WaitTimeBeforeRetryMs"))?.Value?.ToString(), out var parsedWaitTimeBeforeRetryMs) ? parsedWaitTimeBeforeRetryMs : 3000;
            string fallbackBehavior = (string)(nodeData.NodeInputs.FirstOrDefault(w => w.Key.Equals("__OnError__FallbackBehavior"))?.Value ?? "abort");

            // Create a list to hold retry inputs for logging purposes
            var autoRetryInputs = new List<NodeLogKeyValue>();
            if (enableAutoRetry)
            {
                autoRetryInputs.Add(new NodeLogKeyValue { Key = "Enable Auto Retry", Value = enableAutoRetry.ToString() });
                autoRetryInputs.Add(new NodeLogKeyValue { Key = "Retry Limit", Value = retryLimit.ToString() });
                autoRetryInputs.Add(new NodeLogKeyValue { Key = "Wait Time Before Retry (ms)", Value = waitTimeBeforeRetryMs.ToString() });
                autoRetryInputs.Add(new NodeLogKeyValue { Key = "Fallback Behavior", Value = fallbackBehavior });
            }

            // Execute node with default try
            var (isSuccess, serializedNodeExecutionLog) = await ExecuteNodeAsync(nodeExecutionId, 0, autoRetryInputs, nodeData.NodeName, nodeData);

            // Return if successful, otherwise handle auto-retry logic if enabled
            if (isSuccess)
            {
                // Send next-node command to the server
                await _webSocket.SendCommandAsync("next-node", nodeData.NextNodeId);
                return;
            }

            // Handle auto-retry logic if enabled and node execution failed
            if (enableAutoRetry && retryLimit > 0)
            {
                int attempt = 1;
                while (attempt <= retryLimit)
                {
                    try
                    {
                        // Update the node name to indicate the retry attempt
                        string nodeName = $"Retry Attempt {attempt}/{retryLimit}: {nodeData.NodeName}";

                        // Execute the node with retry logic
                        (isSuccess, serializedNodeExecutionLog) = await ExecuteNodeAsync(nodeExecutionId, attempt, autoRetryInputs, nodeName, nodeData);

                        // Exit retry loop on success
                        if (isSuccess)
                        {
                            // Send next-node command to the server
                            await _webSocket.SendCommandAsync("next-node", nodeData.NextNodeId);
                            return;
                        }
                    }
                    catch (Exception ex)
                    {
                        // Keep retrying on transient exceptions, but emit diagnostics for troubleshooting.
                        System.Diagnostics.Debug.WriteLine($"Retry attempt {attempt} failed: {ex}");
                    }

                    // Wait before next retry if not the last attempt
                    if (attempt < retryLimit)
                    {
                        await Task.Delay(Math.Max(0, waitTimeBeforeRetryMs));
                    }

                    attempt++;
                }
            }

            // If reached here means node execution failed even after all retries
            switch (fallbackBehavior)
            {
                case "abort":
                    await _webSocket.SendCommandAsync("error", serializedNodeExecutionLog);
                    DoAbort();
                    break;
                case "next-node":
                    await _webSocket.SendCommandAsync("next-node", nodeData.NextNodeId);
                    break;
                default:
                    await _webSocket.SendCommandAsync("next-node", nodeData.NextNodeId);
                    break;
            }
        }
    }
}