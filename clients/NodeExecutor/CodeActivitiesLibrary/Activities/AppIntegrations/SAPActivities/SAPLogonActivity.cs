using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Security;
using System.Threading;
using System.Windows.Automation;
using System.Windows.Input;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("SAP Logon")]
    [Description("Logs on to an SAP system by interacting with the SAP Logon Pad.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class SAPLogonActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Client")]
        [Description("SAP Client number (e.g., '100').")]
        public InArgument<string> Client { get; set; }

        [RequiredArgument]
        [DisplayName("User ID")]
        [Description("SAP User ID (e.g., 'USER123').")]
        public InArgument<string> UserId { get; set; }

        [RequiredArgument]
        [DisplayName("Password")]
        [Description("SAP Password. Will be hidden in UI.")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public InArgument<SecureString> Password { get; set; }

        [RequiredArgument]
        [DisplayName("System Number")]
        [Description("SAP System Number (e.g., '00').")]
        public InArgument<string> SystemNumber { get; set; }

        [RequiredArgument]
        [DisplayName("System Name")]
        [Description("SAP System Name (e.g., 'DEV', 'PRD').")]
        public InArgument<string> SystemName { get; set; }

        [RequiredArgument]
        [DisplayName("Language")]
        [Description("Language code (e.g., 'EN' for English).")]
        public InArgument<string> Language { get; set; } = "EN";

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var client = Client.Get(context);
                var userId = UserId.Get(context);
                var password = ConvertSecureStringToString(Password.Get(context));
                var systemNumber = SystemNumber.Get(context);
                var systemName = SystemName.Get(context);
                var language = Language.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(client))
                    throw new ArgumentException("Client is required.");
                if (string.IsNullOrWhiteSpace(userId))
                    throw new ArgumentException("User ID is required.");
                if (string.IsNullOrWhiteSpace(password))
                    throw new ArgumentException("Password is required.");
                if (string.IsNullOrWhiteSpace(systemNumber))
                    throw new ArgumentException("System Number is required.");
                if (string.IsNullOrWhiteSpace(systemName))
                    throw new ArgumentException("System Name is required.");

                // Wait for SAP Logon Pad to appear
                var logonWindow = WaitForWindow("SAP Logon Pad");
                if (logonWindow == null)
                    throw new InvalidOperationException("SAP Logon Pad not found.");

                // Find and fill fields
                FillField(logonWindow, "Client", client);
                FillField(logonWindow, "User", userId);
                FillField(logonWindow, "Password", password);
                FillField(logonWindow, "Language", language);

                // Select system from list
                SelectSystem(logonWindow, systemName, systemNumber);

                // Click "Log On"
                ClickButton(logonWindow, "Log On");

                StatusMessage.Set(context, "Successfully logged into SAP system.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error during SAP logon: {ex.Message}";
                StatusMessage.Set(context, errorMsg);
                IsSuccess.Set(context, false);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

        private AutomationElement WaitForWindow(string title)
        {
            var timeout = 30000; // 30 seconds
            var startTime = DateTime.Now;

            while ((DateTime.Now - startTime).TotalMilliseconds < timeout)
            {
                var window = AutomationElement.RootElement.FindFirst(
                    TreeScope.Children,
                    new PropertyCondition(AutomationElement.NameProperty, title));

                if (window != null && window.Current.IsEnabled)
                    return window;

                Thread.Sleep(500);
            }

            return null;
        }

        private void FillField(AutomationElement window, string fieldName, string value)
        {
            var field = window.FindFirst(
                TreeScope.Descendants,
                new PropertyCondition(AutomationElement.NameProperty, fieldName));

            if (field == null)
                throw new InvalidOperationException($"Field '{fieldName}' not found.");

            var editPattern = field.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
            if (editPattern != null)
            {
                editPattern.SetValue(value);
            }
            else
            {
                var edit = field.FindFirst(TreeScope.Children, new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.Edit));
                if (edit != null)
                {
                    var editValue = edit.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
                    editValue?.SetValue(value);
                }
            }
        }

        private void SelectSystem(AutomationElement window, string systemName, string systemNumber)
        {
            var systemList = window.FindFirst(
                TreeScope.Descendants,
                new PropertyCondition(AutomationElement.NameProperty, "System"));

            if (systemList == null)
                throw new InvalidOperationException("System list not found.");

            var systemItem = systemList.FindFirst(
                TreeScope.Descendants,
                new PropertyCondition(AutomationElement.NameProperty, $"{systemName} ({systemNumber})"));

            if (systemItem == null)
                throw new InvalidOperationException($"System '{systemName}' not found.");

            var invokePattern = systemItem.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
            invokePattern?.Invoke();
        }

        private void ClickButton(AutomationElement window, string buttonName)
        {
            var button = window.FindFirst(
                TreeScope.Descendants,
                new PropertyCondition(AutomationElement.NameProperty, buttonName));

            if (button == null)
                throw new InvalidOperationException($"Button '{buttonName}' not found.");

            var invokePattern = button.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
            invokePattern?.Invoke();
        }

        // P/Invoke for mouse movement and click (fallback)
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