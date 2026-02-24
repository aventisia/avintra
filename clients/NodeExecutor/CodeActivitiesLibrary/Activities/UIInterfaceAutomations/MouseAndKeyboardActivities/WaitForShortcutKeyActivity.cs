using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Wait for Shortcut Key")]
    [Description("Pauses the flow run until a specific shortcut key combination is pressed.")]
    [ActivityMetaData(nodeImg: "/assets/MouseAndKeyboard.svg")]
        public class WaitForShortcutKeyActivity : BaseCodeActivity
        {
            [DisplayName("Modifier Keys")]
            [Description("Hold these modifier keys while pressing the main key.")]
            public InArgument<ModifierKeys> Modifiers { get; set; }

            [RequiredArgument]
            [DisplayName("Main Key")]
            [Description("The primary key to wait for (e.g., A, F1, Enter).")]
            public InArgument<VirtualKeyCode> MainKey { get; set; }

            [DisplayName("Continue Flow Run on Timeout")]
            [Description("If true, continues execution after timeout even if no key is pressed.")]
            public InArgument<bool> ContinueOnTimeout { get; set; }

            [DisplayName("Timeout (seconds)")]
            [Description("Maximum time to wait.")]
            [DefaultValue(60)]
            public InArgument<int> TimeoutSeconds { get; set; }

            [DisplayName("Shortcut Was Pressed")]
            [Description("True if the specified shortcut key was pressed before timeout.")]
            public OutArgument<bool> ShortcutWasPressed { get; set; }

            [DisplayName("Pressed Key Details")]
            [Description("Human-readable description of the pressed shortcut.")]
            public OutArgument<string> PressedKeyDetails { get; set; }

            // Private Fields

            private LowLevelKeyboardProc _keyboardProc;
            private IntPtr _hookId = IntPtr.Zero;
            private ModifierKeys _targetModifiers;
            private VirtualKeyCode _targetKey;
            private bool _keyMatched;
            private ManualResetEventSlim _keyPressedEvent;


            protected override void Execute(CodeActivityContext context)
            {
                string status = "Operation completed.";
                _keyMatched = false;
                _keyPressedEvent = new ManualResetEventSlim(false);

                try
                {
                    ModifierKeys modifiersValue;
                    if (Modifiers == null)
                        modifiersValue = ModifierKeys.None;
                    else
                        modifiersValue = Modifiers.Get(context);

                    _targetModifiers = modifiersValue;

                    if (MainKey == null)
                        throw new ArgumentException("MainKey argument is required.");

                    _targetKey = MainKey.Get(context);

                    bool continueValue;
                    if (ContinueOnTimeout == null)
                        continueValue = false;
                    else
                        continueValue = ContinueOnTimeout.Get(context);

                    int timeoutValue;
                    if (TimeoutSeconds == null)
                        timeoutValue = 60;
                    else
                        timeoutValue = TimeoutSeconds.Get(context);

                    // Validate key
                    if (!Enum.IsDefined(typeof(VirtualKeyCode), _targetKey))
                        throw new ArgumentException($"Invalid main key specified: {_targetKey}");

                    // Install keyboard hook
                    _keyboardProc = KeyboardHookCallback;
                    _hookId = SetKeyboardHook(_keyboardProc);

                    // Wait for key press or timeout
                    bool keyPressed;
                    if (timeoutValue > 60)
                    {
                        keyPressed = _keyPressedEvent.Wait(timeoutValue * 1000);
                    }
                    else
                    {
                        _keyPressedEvent.Wait();
                        keyPressed = true;
                    }

                    // Handle results
                    if (keyPressed && _keyMatched)
                    {
                        ShortcutWasPressed.Set(context, true);
                        var details = FormatShortcut(_targetModifiers, _targetKey);
                        PressedKeyDetails.Set(context, details);
                        status = $"Shortcut key '{details}' was pressed successfully.";
                    }
                    else if (continueValue)
                    {
                        ShortcutWasPressed.Set(context, false);
                        PressedKeyDetails.Set(context, string.Empty);
                        status = "No matching shortcut pressed within timeout period.";
                    }
                    else
                    {
                        throw new TimeoutException($"Shortcut key not pressed within {timeoutValue} seconds.");
                    }
                }
                catch (Exception ex)
                {
                    status = $"Error: {ex.Message}";
                    ShortcutWasPressed.Set(context, false);
                    PressedKeyDetails.Set(context, string.Empty);
                    IsSuccess.Set(context, false);
                }
                finally
                {
                    // Always cleanup hook
                    CleanupHook();
                    _keyPressedEvent?.Dispose();
                    _keyPressedEvent = null;
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }

            private static IntPtr SetKeyboardHook(LowLevelKeyboardProc proc)
            {
                using (var procModule = System.Diagnostics.Process.GetCurrentProcess().MainModule)
                {
                    return SetWindowsHookEx(WH_KEYBOARD_LL, proc,
                        GetModuleHandle(procModule?.ModuleName), 0);
                }
            }

            private void CleanupHook()
            {
                if (_hookId != IntPtr.Zero)
                {
                    UnhookWindowsHookEx(_hookId);
                    _hookId = IntPtr.Zero;
                }
            }

            private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

            private IntPtr KeyboardHookCallback(int nCode, IntPtr wParam, IntPtr lParam)
            {
                if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN)
                {
                    var vkCode = Marshal.ReadInt32(lParam);
                    var pressedKey = (VirtualKeyCode)vkCode;
                    var currentModifiers = GetCurrentModifiers();

                    // Check if modifiers and key match
                    if (currentModifiers == _targetModifiers && pressedKey == _targetKey)
                    {
                        _keyMatched = true;
                        _keyPressedEvent?.Set();
                    }
                }

                return CallNextHookEx(_hookId, nCode, wParam, lParam);
            }

            private static ModifierKeys GetCurrentModifiers()
            {
                var modifiers = ModifierKeys.None;

                if ((GetKeyState(VK_CONTROL) & 0x8000) != 0)
                    modifiers |= ModifierKeys.Control;
                if ((GetKeyState(VK_MENU) & 0x8000) != 0)
                    modifiers |= ModifierKeys.Alt;
                if ((GetKeyState(VK_SHIFT) & 0x8000) != 0)
                    modifiers |= ModifierKeys.Shift;
                if ((GetKeyState(VK_LWIN) & 0x8000) != 0 || (GetKeyState(VK_RWIN) & 0x8000) != 0)
                    modifiers |= ModifierKeys.Windows;

                return modifiers;
            }
            private static string FormatShortcut(ModifierKeys modifiers, VirtualKeyCode key)
            {
                var parts = new List<string>();

                if ((modifiers & ModifierKeys.Control) != 0) parts.Add("Ctrl");
                if ((modifiers & ModifierKeys.Alt) != 0) parts.Add("Alt");
                if ((modifiers & ModifierKeys.Shift) != 0) parts.Add("Shift");
                if ((modifiers & ModifierKeys.Windows) != 0) parts.Add("Win");

                parts.Add(key.ToString());
                return string.Join(" + ", parts);
            }

            // Native Methods and Constants

            private const int WH_KEYBOARD_LL = 13;
            private const int WM_KEYDOWN = 0x0100;
            private const int VK_CONTROL = 0x11;
            private const int VK_MENU = 0x12;
            private const int VK_SHIFT = 0x10;
            private const int VK_LWIN = 0x5B;
            private const int VK_RWIN = 0x5C;

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

            //Enums

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
                // Letters
                A = 0x41, B, C, D, E, F, G, H, I, J, K, L, M,
                N, O, P, Q, R, S, T, U, V, W, X, Y, Z,

                // Numbers
                D0 = 0x30, D1, D2, D3, D4, D5, D6, D7, D8, D9,

                // Function Keys
                F1 = 0x70, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12,

                // Navigation
                Enter = 0x0D, Escape = 0x1B, Space = 0x20,
                Tab = 0x09, Backspace = 0x08,
                PageUp = 0x21, PageDown = 0x22,
                Home = 0x24, End = 0x23,
                Insert = 0x2D, Delete = 0x2E,
                Left = 0x25, Up = 0x26,
                Right = 0x27, Down = 0x28,

                // Numpad
                NumPad0 = 0x60, NumPad1, NumPad2, NumPad3, NumPad4,
                NumPad5, NumPad6, NumPad7, NumPad8, NumPad9,
                Multiply = 0x6A, Add = 0x6B, Subtract = 0x6D,
                Decimal = 0x6E, Divide = 0x6F,

                PrintScreen = 0x2C, ScrollLock = 0x91,
                Pause = 0x13, CapsLock = 0x14, NumLock = 0x90,
            }

        }
}