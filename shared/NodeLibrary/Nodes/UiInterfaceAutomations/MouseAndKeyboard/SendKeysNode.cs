using NodeLibrary.MouseAndKeyboardNodes.Helpers;
using System.Runtime.InteropServices;

namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Send Keys"), Description("Sends keys to the specified target (foreground window, UI element, window handle, or title/class).")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class SendKeysNode : BaseNode
{
    // Input Arguments
    [DisplayName("Send Keys To"), Description("Specifies where to send the keys.")]
    public required InArgument<SendKeysTargetEnum> Target { get; set; }


    [DisplayName("UI Element"), Description("The UI element to send keys to (used when 'Send Keys To' is 'UI element').")]
    public InArgument<string> UiElement { get; set; } = new InArgument<string>(string.Empty);


    [DisplayName("Window Handle"), Description("The window handle to send keys to (used when 'Send Keys To' is 'Window instance/handle').")]
    public InArgument<IntPtr> WindowHandle { get; set; } = new InArgument<IntPtr>(IntPtr.Zero);


    [DisplayName("Window Title"), Description("The title of the window to send keys to (used when 'Send Keys To' is 'Title and/or class').")]
    public InArgument<string> WindowTitle { get; set; } = new InArgument<string>(string.Empty);


    [DisplayName("Window Class"), Description("The class name of the window to send keys to (used when 'Send Keys To' is 'Title and/or class').")]
    public InArgument<string> WindowClass { get; set; } = new InArgument<string>(string.Empty);
    [DisplayName("Text to Send"), Description("The text or special keys to send.")]
    public required InArgument<string> TextToSend { get; set; }


    [DisplayName("Delay Between Keystrokes"), Description("Milliseconds to wait between each keystroke.")]
    public InArgument<int> DelayBetweenKeystrokes { get; set; } = new InArgument<int>(0);


    [DisplayName("Send Text as Hardware Keys"), Description("If true, sends keys using hardware key codes instead of virtual key codes.")]
    public InArgument<bool> SendAsHardwareKeys { get; set; } = new InArgument<bool>(false);

    // Output Arguments


    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var target = Target.Get(context);
            var textToSend = TextToSend.Get(context);
            var delay = DelayBetweenKeystrokes.Get(context);
            var useHardwareKeys = SendAsHardwareKeys.Get(context);

            if (string.IsNullOrWhiteSpace(textToSend))
                throw new ArgumentException("Text to send cannot be null or empty.");

            switch (target)
            {
                case SendKeysTargetEnum.ForegroundWindow:
                    SendKeysToForegroundWindow(textToSend, delay, useHardwareKeys);
                    break;

                case SendKeysTargetEnum.UiElement:
                    var uiElement = UiElement.Get(context);
                    if (string.IsNullOrWhiteSpace(uiElement))
                        throw new ArgumentException("UI element must be specified.");
                    SendKeysToUiElement(uiElement, textToSend, delay, useHardwareKeys);
                    break;

                case SendKeysTargetEnum.WindowInstanceHandle:
                    var windowHandle = WindowHandle.Get(context);
                    if (windowHandle == IntPtr.Zero)
                        throw new ArgumentException("Window handle must be valid.");
                    SendKeysToWindowHandle(windowHandle, textToSend, delay, useHardwareKeys);
                    break;

                case SendKeysTargetEnum.TitleAndOrClass:
                    var windowTitle = WindowTitle.Get(context);
                    var windowClass = WindowClass.Get(context);
                    if (string.IsNullOrWhiteSpace(windowTitle) && string.IsNullOrWhiteSpace(windowClass))
                        throw new ArgumentException("Either window title or class must be specified.");
                    SendKeysToWindowByTitleOrClass(windowTitle, windowClass, textToSend, delay, useHardwareKeys);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(target));
            }
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error sending keys: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }

    }

    private static void SendKeysToForegroundWindow(string textToSend, int delay, bool useHardwareKeys)
    {
        KeyboardHelper.SendText(textToSend, delay, useHardwareKeys);
    }

    private static void SendKeysToUiElement(string uiElement, string textToSend, int delay, bool useHardwareKeys)
    {
        // TODO UI Automation to focus the element
        // This is a simplified version that just sends to foreground window
        KeyboardHelper.SendText(textToSend, delay, useHardwareKeys);
    }

    private static void SendKeysToWindowHandle(IntPtr windowHandle, string textToSend, int delay,
        bool useHardwareKeys)
    {
        if (NativeMethods.SetForegroundWindow(windowHandle))
        {
            KeyboardHelper.SendText(textToSend, delay, useHardwareKeys);
        }
        else
        {
            throw new InvalidOperationException("Failed to set window to foreground.");
        }
    }

    private static void SendKeysToWindowByTitleOrClass(string windowTitle, string windowClass, string textToSend,
        int delay, bool useHardwareKeys)
    {
        var hwnd = NativeMethods.FindWindow(windowClass, windowTitle);
        if (hwnd == IntPtr.Zero)
            throw new InvalidOperationException("Window not found.");

        if (NativeMethods.SetForegroundWindow(hwnd))
        {
            KeyboardHelper.SendText(textToSend, delay, useHardwareKeys);
        }
        else
        {
            throw new InvalidOperationException("Failed to set window to foreground.");
        }
    }

    private static class NativeMethods
    {
        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("user32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool SetForegroundWindow(IntPtr hWnd);

    }
}

public enum SendKeysTargetEnum
{
    [Display(Name = "Foreground window", Description = "Sends keys to the currently active window.")]
    ForegroundWindow,

    [Display(Name = "UI element", Description = "Sends keys to a specific UI element.")]
    UiElement,

    [Display(Name = "Window instance/handle", Description = "Sends keys to a window by its handle.")]
    WindowInstanceHandle,

    [Display(Name = "Title and/or class", Description = "Sends keys to a window by its title and/or class.")]
    TitleAndOrClass
}



