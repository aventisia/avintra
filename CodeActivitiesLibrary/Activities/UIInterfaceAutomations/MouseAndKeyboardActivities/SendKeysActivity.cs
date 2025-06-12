using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Send Keys")]
    [Description("Sends keys to the specified target (foreground window, UI element, window handle, or title/class).")]
    public class SendKeysActivity : BaseCodeActivity
    {
        // Input Arguments
        [RequiredArgument]
        [DisplayName("Send Keys To")]
        [Description("Specifies where to send the keys.")]
        public InArgument<SendKeysTargetEnum> Target { get; set; }


        [DisplayName("UI Element")]
        [Description("The UI element to send keys to (used when 'Send Keys To' is 'UI element').")]
        public InArgument<string> UiElement { get; set; }


        [DisplayName("Window Handle")]
        [Description("The window handle to send keys to (used when 'Send Keys To' is 'Window instance/handle').")]
        public InArgument<IntPtr> WindowHandle { get; set; }


        [DisplayName("Window Title")]
        [Description("The title of the window to send keys to (used when 'Send Keys To' is 'Title and/or class').")]
        public InArgument<string> WindowTitle { get; set; }


        [DisplayName("Window Class")]
        [Description(
            "The class name of the window to send keys to (used when 'Send Keys To' is 'Title and/or class').")]
        public InArgument<string> WindowClass { get; set; }

        [RequiredArgument]
        [DisplayName("Text to Send")]
        [Description("The text or special keys to send.")]
        public InArgument<string> TextToSend { get; set; }


        [DisplayName("Delay Between Keystrokes")]
        [Description("Milliseconds to wait between each keystroke.")]
        [DefaultValue(0)]
        public InArgument<int> DelayBetweenKeystrokes { get; set; }


        [DisplayName("Send Text as Hardware Keys")]
        [Description("If true, sends keys using hardware key codes instead of virtual key codes.")]
        [DefaultValue(false)]
        public InArgument<bool> SendAsHardwareKeys { get; set; }

        // Output Arguments


        protected override void Execute(CodeActivityContext context)
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
            }
            catch (Exception ex)
            {
                status = $"Error sending keys: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private static void SendKeysToForegroundWindow(string textToSend, int delay, bool useHardwareKeys)
        {
            if (useHardwareKeys)
                NativeMethods.SendKeysAsHardware(textToSend, delay);
            else
                SendKeys.SendWait(textToSend);
        }

        private static void SendKeysToUiElement(string uiElement, string textToSend, int delay, bool useHardwareKeys)
        {
            // TODO UI Automation to focus the element
            // This is a simplified version that just sends to foreground window
            if (useHardwareKeys)
                NativeMethods.SendKeysAsHardware(textToSend, delay);
            else
                SendKeys.SendWait(textToSend);
        }

        private static void SendKeysToWindowHandle(IntPtr windowHandle, string textToSend, int delay,
            bool useHardwareKeys)
        {
            if (NativeMethods.SetForegroundWindow(windowHandle))
            {
                if (useHardwareKeys)
                    NativeMethods.SendKeysAsHardware(textToSend, delay);
                else
                    SendKeys.SendWait(textToSend);
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
                if (useHardwareKeys)
                    NativeMethods.SendKeysAsHardware(textToSend, delay);
                else
                    SendKeys.SendWait(textToSend);
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

            [DllImport("user32.dll")]
            private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

            public static void SendKeysAsHardware(string text, int delayBetweenKeys)
            {
                foreach (var c in text)
                {
                    var vkCode = (byte)c;
                    keybd_event(vkCode, 0, 0, UIntPtr.Zero); // Key down
                    Thread.Sleep(10);
                    keybd_event(vkCode, 0, 0x0002, UIntPtr.Zero); // Key up

                    if (delayBetweenKeys > 0)
                        Thread.Sleep(delayBetweenKeys);
                }
            }

            // Constants for special keys
            private const byte VK_SHIFT = 0x10;
            private const byte VK_CONTROL = 0x11;
            private const byte VK_MENU = 0x12; // ALT key
            private const byte VK_RETURN = 0x0D;
            private const byte VK_BACK = 0x08;
            private const byte VK_TAB = 0x09;
            private const byte VK_ESCAPE = 0x1B;
            private const byte VK_SPACE = 0x20;
            private const byte VK_LEFT = 0x25;
            private const byte VK_UP = 0x26;
            private const byte VK_RIGHT = 0x27;
            private const byte VK_DOWN = 0x28;
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
}