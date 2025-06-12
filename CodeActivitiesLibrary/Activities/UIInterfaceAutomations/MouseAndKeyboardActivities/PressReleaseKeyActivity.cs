using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Press/Release Key")]
    [Description("Presses (and holds) or releases one or more modifier keys (Alt, Control, Shift, Win). Supports combinations like Ctrl+Alt.")]
    public class PressReleaseKeyActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Action To Perform")]
        [Description("Select whether to press or release the keys.")]
        public InArgument<ActionTypeEnum> ActionToPerform { get; set; }

        [DisplayName("Control")]
        [Description("Toggle to include the Control key in the action.")]
        public InArgument<bool> UseControl { get; set; }

        [DisplayName("Alt")]
        [Description("Toggle to include the Alt key in the action.")]
        public InArgument<bool> UseAlt { get; set; }

        [DisplayName("Shift")]
        [Description("Toggle to include the Shift key in the action.")]
        public InArgument<bool> UseShift { get; set; }

        [DisplayName("Win")]
        [Description("Toggle to include the Windows key in the action.")]
        public InArgument<bool> UseWin { get; set; }

        [DisplayName("Wait Before Releasing (ms)")]
        [Description("Optional delay in milliseconds before releasing the key (used when pressing only).")]
        [DefaultValue(0)]
        public InArgument<int> WaitBeforeReleasing { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var action = ActionToPerform.Get(context);
            var useControl = UseControl.Get(context);
            var useAlt = UseAlt.Get(context);
            var useShift = UseShift.Get(context);
            var useWin = UseWin.Get(context);
            var waitTime = WaitBeforeReleasing.Get(context);

            try
            {
                if (action == default(ActionTypeEnum))
                    throw new ArgumentException("Action value must be specified.");

                var keys = GetSelectedKeys(useControl, useAlt, useShift, useWin);

                if (keys == null || keys.Length == 0)
                    throw new InvalidOperationException("No valid key combination provided.");

                switch (action)
                {
                    case ActionTypeEnum.Press:
                        foreach (var k in keys)
                            _SimulateKeyPress(k);

                        status = $"Successfully pressed key(s): '{string.Join(", ", keys)}'.";

                        if (waitTime > 0)
                            Thread.Sleep(waitTime);
                        break;

                    case ActionTypeEnum.Release:
                        foreach (var k in keys)
                            _SimulateKeyRelease(k);

                        status = $"Successfully released key(s): '{string.Join(", ", keys)}'.";
                        break;

                    default:
                        throw new ArgumentException("Invalid action specified.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error during key simulation: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private static Keys[] GetSelectedKeys(bool useControl, bool useAlt, bool useShift, bool useWin)
        {
            var selectedKeys = new List<Keys>();

            if (useControl)
                selectedKeys.Add(Keys.Control);

            if (useAlt)
                selectedKeys.Add(Keys.Alt);

            if (useShift)
                selectedKeys.Add(Keys.Shift);

            if (useWin)
                selectedKeys.Add(Keys.LWin);

            return selectedKeys.ToArray();
        }

        private static void _SimulateKeyPress(Keys key)
        {
            switch (key)
            {
                case Keys.Control:
                    NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_KEYDOWN, NativeMethods.VkCode.VK_CONTROL);
                    break;
                case Keys.Shift:
                    NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_KEYDOWN, NativeMethods.VkCode.VK_SHIFT);
                    break;
                case Keys.Alt:
                    NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_KEYDOWN, NativeMethods.VkCode.VK_MENU);
                    break;
                case Keys.LWin:
                    NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_KEYDOWN, NativeMethods.VkCode.VK_LWIN);
                    break;
                default:
                    throw new ArgumentException($"Unsupported key: {key}");
            }
        }

        private static void _SimulateKeyRelease(Keys key)
        {
            switch (key)
            {
                case Keys.Control:
                    NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_KEYUP, NativeMethods.VkCode.VK_CONTROL);
                    break;
                case Keys.Shift:
                    NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_KEYUP, NativeMethods.VkCode.VK_SHIFT);
                    break;
                case Keys.Alt:
                    NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_KEYUP, NativeMethods.VkCode.VK_MENU);
                    break;
                case Keys.LWin:
                    NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_KEYUP, NativeMethods.VkCode.VK_LWIN);
                    break;
                default:
                    throw new ArgumentException($"Unsupported key: {key}");
            }
        }

        private static class NativeMethods
        {
            [DllImport("user32.dll")]
            private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

            public static void KeyDown(uint dwFlags, VkCode vk)
            {
                keybd_event((byte)vk, 0, dwFlags, UIntPtr.Zero);
            }

            public static void KeyUp(uint dwFlags, VkCode vk)
            {
                keybd_event((byte)vk, 0, dwFlags | 0x0002, UIntPtr.Zero); // KEYEVENTF_KEYUP
            }

            public enum VkCode : byte
            {
                VK_SHIFT = 0x10,
                VK_CONTROL = 0x11,
                VK_MENU = 0x12, // Alt
                VK_LWIN = 0x5B, // Left Windows key
                VK_RETURN = 0x0D,
                VK_TAB = 0x09,
                VK_ESCAPE = 0x1B,
                KEYEVENTF_KEYDOWN = 0x00,
                KEYEVENTF_KEYUP = 0x02
            }
        }

        // Define the enum for ActionToPerform
        public enum ActionTypeEnum
        {
            [Display(Name = "Press", Description = "Presses and holds the selected key(s).")]
            Press,

            [Display(Name = "Release", Description = "Releases the selected key(s).")]
            Release
        }
    }
}