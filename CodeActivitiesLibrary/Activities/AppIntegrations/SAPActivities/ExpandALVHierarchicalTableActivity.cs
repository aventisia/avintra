using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Automation;
using System.Windows.Input;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Expand ALV Hierarchical Table")]
    [Description("Expands a row in an SAP ALV Hierarchical Table by clicking the expansion icon.")]
    public class ExpandALVHierarchicalTableActivity : BaseCodeActivity
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
        [DisplayName("Row Index")]
        [Description("Zero-based index of the row to expand.")]
        public InArgument<int> RowIndex { get; set; } = 0;

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var windowTitle = WindowTitle.Get(context);
                var tableName = TableName.Get(context);
                var rowIndex = RowIndex.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(windowTitle))
                    throw new ArgumentException("Window Title is required.");
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");

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

                // Get the row
                var rowCondition = new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.DataItem);
                var row = table.FindFirst(TreeScope.Children, rowCondition);

                if (row == null)
                    throw new InvalidOperationException("No rows found in the table.");

                // Try to find the expand button
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
                    // Fallback: Click using Win32 API
                    var rect = row.Current.BoundingRectangle;
                    int x = (int)(rect.Left + 10);
                    int y = (int)(rect.Top + 5);
                    MoveAndClickMouse(x, y);
                }

                StatusMessage.Set(context, $"Expanded row {rowIndex} in ALV table.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error expanding ALV hierarchical table: {ex.Message}";
                StatusMessage.Set(context, errorMsg);
                IsSuccess.Set(context, false);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }


        [DllImport("user32.dll")]
        static extern bool SetCursorPos(int x, int y);

        [DllImport("user32.dll")]
        static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, IntPtr dwExtraInfo);

        const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        const uint MOUSEEVENTF_LEFTUP = 0x0004;

        private void MoveAndClickMouse(int x, int y)
        {
            SetCursorPos(x, y);
            mouse_event(MOUSEEVENTF_LEFTDOWN, x, y, 0, IntPtr.Zero);
            mouse_event(MOUSEEVENTF_LEFTUP, x, y, 0, IntPtr.Zero);
        }
    }
}