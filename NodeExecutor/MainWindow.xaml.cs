using Newtonsoft.Json;
using NodeExecutor.Models;
using NodeExecutor.Services;
using System;
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
        private readonly string _agentName;

        public MainWindow(string agentName)
        {
            InitializeComponent();

            // Set the window position to the bottom right of the screen
            Loaded += OnLoaded;
            Closed += OnClosed;

            // Start the timer
            InitServices();

            // Set the agent name
            this._agentName = agentName;
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
            _webSocket = new WebSocketHelper();
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
            // Deserialize the node data
            var conditionalBrnachNodeData = JsonConvert.DeserializeObject<ConditionalBranchNodeData>(data);

            if (conditionalBrnachNodeData == null)
            {
                MessageBox.Show("Invalid node data received.");
                return;
            }

            // Set the node name
            lbl_NodeName.Text = conditionalBrnachNodeData.NodeName.Length > 0 ? conditionalBrnachNodeData.NodeName : "Node name not found";

            bool result = ActivityExecutorService.ExecuteCondition(conditionalBrnachNodeData.Conditions, _executionContext);

            await _webSocket.SendCommandAsync("next-node",
                result
                    ? conditionalBrnachNodeData.NextNodeId
                    : conditionalBrnachNodeData.ConditionalNodeId);
        }

        private async void ExecuteLoopAsync(string data)
        {
            // Deserialize the node data
            var loopNodeData = JsonConvert.DeserializeObject<WpfLoopNodeData>(data);

            if (loopNodeData == null)
            {
                MessageBox.Show("Invalid node data received.");
                return;
            }

            // Set the node name
            lbl_NodeName.Text = loopNodeData.NodeName.Length > 0 ? loopNodeData.NodeName : "Node name not found";

            bool result = false;
            if (loopNodeData.LoopType == "ConditionalLoop")
            {
                result = ActivityExecutorService.ExecuteCondition(loopNodeData.Conditions, _executionContext);
            }
            else if (loopNodeData.LoopType == "ForEachLoop")
            {
                result = ActivityExecutorService.MoveNextListItem(loopNodeData.ListVariableName, loopNodeData.ItemVariableName, _executionContext);
            }

            // Process next node
            await _webSocket.SendCommandAsync("next-node",
                    result
                        ? loopNodeData.NextNodeId
                        : loopNodeData.MergeBranchesNodeId);
        }

        private async void ExecuteNodeAsync(string data)
        {
            // Deserialize the node data
            var nodeData = JsonConvert.DeserializeObject<ActivityNodeData>(data);

            if (nodeData == null)
            {
                MessageBox.Show("Invalid node data received.");
                return;
            }

            // Set the node name
            lbl_NodeName.Text = nodeData.NodeName.Length > 0 ? nodeData.NodeName : "Node name not found";

            // Execute single node
            ActivityExecutorService.ExecuteNode(nodeData, _executionContext);

            // Send next node command to the server
            await _webSocket.SendCommandAsync("next-node", nodeData.NextNodeId);
        }
    }
}
