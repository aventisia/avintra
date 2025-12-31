using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Expand ALV Tree")]
    [Description("Expands parent ALV tree to the selected node.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class ExpandALVTreeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Window Title")]
        [Description("Title of the SAP GUI window (e.g., 'SAP Logon').")]
        public InArgument<string> WindowTitle { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name")]
        [Description("Name of the ALV table (e.g., 'GridControl1').")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Node Key")]
        [Description("Key of the node to expand (e.g., '000010').")]
        public InArgument<string> NodeKey { get; set; }

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var windowTitle = WindowTitle.Get(context);
                var tableName = TableName.Get(context);
                var nodeKey = NodeKey.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(windowTitle))
                    throw new ArgumentException("Window Title is required.");
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");
                if (string.IsNullOrWhiteSpace(nodeKey))
                    throw new ArgumentException("Node Key is required.");

                // Find the SAP window
                var window = AutomationElement.RootElement.FindFirst(
                    TreeScope.Children,
                    new PropertyCondition(AutomationElement.NameProperty, windowTitle));

                if (window == null)
                    throw new InvalidOperationException($"Window '{windowTitle}' not found.");

                // Find the ALV table
                var table = window.FindFirst(
                    TreeScope.Descendants,
                    new PropertyCondition(AutomationElement.NameProperty, tableName));

                if (table == null)
                    throw new InvalidOperationException($"Table '{tableName}' not found.");

                // Search for the row with the specified node key
                var row = FindRowByNodeKey(table, nodeKey);
                if (row == null)
                    throw new InvalidOperationException($"Node with key '{nodeKey}' not found.");

                // Try to find the expand button (usually a small triangle or plus sign)
                var expandButton = row.FindFirst(
                    TreeScope.Descendants,
                    new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.Button));

                if (expandButton != null)
                {
                    var invokePattern = expandButton.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
                    invokePattern?.Invoke();
                }
                else
                {
                    // Fallback: Click on the row itself
                    var rect = row.Current.BoundingRectangle;
                    int x = (int)(rect.Left + 10);
                    int y = (int)(rect.Top + 5);
                    MoveAndClickMouse(x, y);
                }

                StatusMessage.Set(context, $"Expanded ALV tree node: {nodeKey}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error expanding ALV tree: {ex.Message}";
                StatusMessage.Set(context, errorMsg);
                IsSuccess.Set(context, false);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

        private AutomationElement FindRowByNodeKey(AutomationElement table, string nodeKey)
        {
            // Use recursive search to find a row containing the node key
            return table.FindFirst(TreeScope.Descendants, new PropertyCondition(
                AutomationElement.NameProperty, nodeKey));
        }

        // P/Invoke for mouse movement and click
        [DllImport("user32.dll")]
        private static extern bool SetCursorPos(int x, int y);

        [DllImport("user32.dll")]
        private static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, IntPtr dwExtraInfo);

        private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const uint MOUSEEVENTF_LEFTUP = 0x0004;

        private void MoveAndClickMouse(int x, int y)
        {
            SetCursorPos(x, y);
            mouse_event(MOUSEEVENTF_LEFTDOWN, x, y, 0, IntPtr.Zero);
            mouse_event(MOUSEEVENTF_LEFTUP, x, y, 0, IntPtr.Zero);
        }
    }
}