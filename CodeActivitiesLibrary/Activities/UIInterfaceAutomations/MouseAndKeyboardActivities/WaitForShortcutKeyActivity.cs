using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Wait for Shortcut Key")]
    [Description("Pauses the flow run until a specific shortcut key is pressed.")]
    public class WaitForShortcutKeyActivity : BaseCodeActivity
    {
        // Input Arguments
        [RequiredArgument]
        [DisplayName("Shortcut Keys")]
        [Description("The list of shortcut keys to wait for.")]
        public InArgument<IEnumerable<ShortcutKey>> ShortcutKeys { get; set; }


        [DisplayName("Continue Flow Run on Timeout")]
        [Description("If true, continues the flow after the specified timeout if no shortcut key is pressed.")]
        [DefaultValue(false)]
        public InArgument<bool> ContinueOnTimeout { get; set; }


        [DisplayName("Timeout (seconds)")]
        [Description("Maximum time in seconds to wait for the shortcut key.")]
        [DefaultValue(0)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // Output Arguments

        [DisplayName("Index of Shortcut Key Pressed")]
        [Description("Returns the index of the shortcut key that was pressed (0-based).")]
        public OutArgument<int> IndexOfShortcutKeyPressed { get; set; }


        // Keyboard hook variables
        private static LowLevelKeyboardProc _keyboardProc;
        private static IntPtr _hookId = IntPtr.Zero;
        private static List<ShortcutKey> _shortcutKeys;
        private static int? _pressedKeyIndex;
        private static ManualResetEvent _keyPressedEvent;

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            _pressedKeyIndex = null;
            _keyPressedEvent = new ManualResetEvent(false);

            try
            {
                var shortcutKeys = ShortcutKeys.Get(context)?.ToList();
                var continueOnTimeout = ContinueOnTimeout.Get(context);
                var timeoutSeconds = TimeoutSeconds.Get(context);

                if (shortcutKeys == null || !shortcutKeys.Any())
                    throw new ArgumentException("At least one shortcut key must be specified.");

                _shortcutKeys = shortcutKeys;

                // Set up keyboard hook
                _keyboardProc = KeyboardHookCallback;
                _hookId = SetKeyboardHook(_keyboardProc);

                // Wait for key press or timeout
                bool keyPressed;
                if (timeoutSeconds > 0)
                {
                    keyPressed = _keyPressedEvent.WaitOne(timeoutSeconds * 1000);
                }
                else
                {
                    _keyPressedEvent.WaitOne();
                    keyPressed = true;
                }

                if (keyPressed && _pressedKeyIndex.HasValue)
                {
                    IndexOfShortcutKeyPressed.Set(context, _pressedKeyIndex.Value);
                    status = $"Shortcut key '{shortcutKeys[_pressedKeyIndex.Value]}' was pressed.";
                }
                else if (continueOnTimeout)
                {
                    status = "No shortcut key was pressed within the timeout period.";
                }
                else if (!keyPressed)
                {
                    throw new TimeoutException("No shortcut key was pressed within the timeout period.");
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error waiting for shortcut key: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            finally
            {
                // Unhook keyboard
                if (_hookId != IntPtr.Zero)
                {
                    UnhookWindowsHookEx(_hookId);
                    _hookId = IntPtr.Zero;
                }

                _keyPressedEvent?.Dispose();

            }
        }

        private static IntPtr SetKeyboardHook(LowLevelKeyboardProc proc)
        {
            using (var curProcess = System.Diagnostics.Process.GetCurrentProcess())
            using (var curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc,
                    GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

        private static IntPtr KeyboardHookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN)
            {
                var vkCode = Marshal.ReadInt32(lParam);
                var key = (Keys)vkCode;
                var modifiers = GetCurrentModifiers();

                // Check if any shortcut key matches
                for (var i = 0; i < _shortcutKeys.Count; i++)
                {
                    var shortcut = _shortcutKeys[i];
                    if (shortcut.KeyCode == (VirtualKeyCode)key && shortcut.Modifiers == modifiers)
                    {
                        _pressedKeyIndex = i;
                        _keyPressedEvent.Set();
                        break;
                    }
                }
            }

            return CallNextHookEx(_hookId, nCode, wParam, lParam);
        }

        private static ModifierKeys GetCurrentModifiers()
        {
            var modifiers = ModifierKeys.None;
            if ((GetKeyState(VK_CONTROL) & 0x8000) != 0) modifiers |= ModifierKeys.Control;
            if ((GetKeyState(VK_MENU) & 0x8000) != 0) modifiers |= ModifierKeys.Alt;
            if ((GetKeyState(VK_SHIFT) & 0x8000) != 0) modifiers |= ModifierKeys.Shift;
            return modifiers;
        }

        #region Native Methods and Constants

        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int VK_CONTROL = 0x11;
        private const int VK_MENU = 0x12; // ALT key
        private const int VK_SHIFT = 0x10;

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook,
            LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode,
            IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll")]
        private static extern short GetKeyState(int nVirtKey);

        #endregion

        public struct ShortcutKey
        {
            public ModifierKeys Modifiers { get; set; }
            public VirtualKeyCode KeyCode { get; set; }

            public override string ToString()
            {
                var modifiers = "";
                if ((Modifiers & ModifierKeys.Control) != 0) modifiers += "Ctrl + ";
                if ((Modifiers & ModifierKeys.Alt) != 0) modifiers += "Alt + ";
                if ((Modifiers & ModifierKeys.Shift) != 0) modifiers += "Shift + ";

                return $"{modifiers}{KeyCode}";
            }
        }

        [Flags]
        public enum ModifierKeys : uint
        {
            None = 0,
            Control = 0x0008,
            Alt = 0x0004,
            Shift = 0x0002,
            Windows = 0x0001
        }

        public enum VirtualKeyCode : uint
        {
            // Alphabet keys
            A = 0x41,
            B,
            C,
            D,
            E,
            F,
            G,
            H,
            I,
            J,
            K,
            L,
            M,
            N,
            O,
            P,
            Q,
            R,
            S,
            T,
            U,
            V,
            W,
            X,
            Y,
            Z,

            // Number keys
            D0 = 0x30,
            D1,
            D2,
            D3,
            D4,
            D5,
            D6,
            D7,
            D8,
            D9,

            // Function keys
            F1 = 0x70,
            F2,
            F3,
            F4,
            F5,
            F6,
            F7,
            F8,
            F9,
            F10,
            F11,
            F12,

            // Special keys
            Escape = 0x1B,
            Space = 0x20,
            Enter = 0x0D,
            Tab = 0x09,
            Backspace = 0x08,
            Insert = 0x2D,
            Delete = 0x2E,
            Home = 0x24,
            End = 0x23,
            PageUp = 0x21,
            PageDown = 0x22,

            // Arrow keys
            Left = 0x25,
            Up = 0x26,
            Right = 0x27,
            Down = 0x28,

            // Numpad keys
            NumPad0 = 0x60,
            NumPad1,
            NumPad2,
            NumPad3,
            NumPad4,
            NumPad5,
            NumPad6,
            NumPad7,
            NumPad8,
            NumPad9,
            Multiply = 0x6A,
            Add = 0x6B,
            Separator = 0x6C,
            Subtract = 0x6D,
            Decimal = 0x6E,
            Divide = 0x6F
        }
    }
}