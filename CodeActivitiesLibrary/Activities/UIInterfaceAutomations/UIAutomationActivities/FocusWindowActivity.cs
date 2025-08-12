using CodeActivitiesLibrary.Extensions;
using FlaUI.Core.AutomationElements;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Focus Window")]
    [Description("Brings the selected window to the front and makes it active.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
    public class FocusWindowActivity : BaseCodeActivity
    {
        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [RequiredArgument]
        [DisplayName("Window")]
        [Description("Select the window you want to focus.")]
        public InArgument<AutomationElement> WindowElement { get; set; }

        [DisplayName("Is Window Focused Successfully")]
        [Description("Indicates whether the window was focused successfully.")]
        public OutArgument<bool> IsWindowFocused { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            string statusMessage = "";

            try
            {
                if (windowElement == null)
                {
                    statusMessage = "No window was provided to focus.";
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, statusMessage);
                    IsWindowFocused.Set(context, false);
                    return;
                }

                var window = windowElement.AsWindow();
                if (window != null)
                {
                    // Restore if minimized
                    var windowPattern = window.Patterns.Window.PatternOrDefault;
                    if (windowPattern != null && windowPattern.WindowVisualState.Value == FlaUI.Core.Definitions.WindowVisualState.Minimized)
                    {
                        windowPattern.SetWindowVisualState(FlaUI.Core.Definitions.WindowVisualState.Normal);
                    }

                    window.Focus();

                    // Check if the window is now focused
                    IntPtr foregroundHandle = GetForegroundWindow();
                    int windowHandle = window.Properties.NativeWindowHandle.ValueOrDefault.ToInt32();
                    bool isFocused = foregroundHandle != IntPtr.Zero && foregroundHandle.ToInt32() == windowHandle;

                    IsWindowFocused.Set(context, isFocused);
                    statusMessage = isFocused
                        ? "Window focused successfully."
                        : "Tried to focus the window, but it is not the active window.";
                    IsSuccess.Set(context, isFocused);
                    StatusMessage.Set(context, statusMessage);
                }
                else
                {
                    statusMessage = "The provided element is not a window.";
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, statusMessage);
                    IsWindowFocused.Set(context, false);
                }
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"There was a problem focusing the window: {ex.Message}");
                IsWindowFocused.Set(context, false);
            }
        }
    }
}