using FlaUI.Core.AutomationElements;
using System.Runtime.InteropServices;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Focus Window"), Description("Brings the selected window to the front and makes it active.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class FocusWindowNode : BaseNode
{
    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DisplayName("Window"), Description("Select the window you want to focus.")]
    public required InArgument<AutomationElement> WindowElement { get; set; }

    [DisplayName("Is Window Focused Successfully"), Description("Indicates whether the window was focused successfully.")]
    public OutArgument<bool> IsWindowFocused { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var windowElement = WindowElement.Get(context);

            if (windowElement == null)
            {
                status = "No window was provided to focus.";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
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
                status = isFocused
                    ? "Window focused successfully."
                    : "Tried to focus the window, but it is not the active window.";

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            else
            {
                status = "The provided element is not a window.";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
                IsWindowFocused.Set(context, false);
            }
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"There was a problem focusing the window: {ex.Message}");
        }
    }
}
