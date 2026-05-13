using CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Press or Release Key")]
    [Description("Presses (and holds) or releases one or more modifier keys (Alt, Control, Shift, Win). Supports combinations like Ctrl+Alt.")]
    [ActivityMetaData(nodeImg: "/assets/MouseAndKeyboard.svg")]
    public class PressReleaseKeyActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------
        [RequiredArgument]
        [DisplayName("Action To Perform")]
        [Description("Select whether to press or release the keys.")]
        [DefaultValue(ActionTypeEnum.Press)]
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

        [DisplayName("Key To Press")]
        [Description("The main key to simulate (e.g., A, Enter, Tab). Leave blank if only using modifiers).")]
        public InArgument<VirtualKeyEnum> KeyToPress { get; set; }

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
            try
            {
                // Retrieve input arguments
                var action = ActionToPerform.Get(context);
                var useControl = UseControl.Get(context);
                var useAlt = UseAlt.Get(context);
                var useShift = UseShift.Get(context);
                var useWin = UseWin.Get(context);
                var key = KeyToPress.Get(context);
                var waitTime = WaitBeforeReleasing.Get(context);
                var keys = GetSelectedKeys(useControl, useAlt, useShift, useWin, key);

                if (keys == null || keys.Length == 0)
                    throw new InvalidOperationException("No valid key combination provided.");

                switch (action)
                {
                    case ActionTypeEnum.Press:
                        foreach (var k in keys)
                            NativeMethods.KeyDown(k);
                        status = $"Successfully pressed key(s): '{string.Join(", ", keys)}'.";
                        if (waitTime > 0)
                            Thread.Sleep(waitTime);
                        break;

                    case ActionTypeEnum.Release:
                        foreach (var k in keys)
                            NativeMethods.KeyUp(k);
                        status = $"Successfully released key(s): '{string.Join(", ", keys)}'.";
                        break;

                    default:
                        throw new ArgumentException("Invalid action specified.");
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error during key simulation: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static VirtualKeyEnum[] GetSelectedKeys(bool useControl, bool useAlt, bool useShift, bool useWin, VirtualKeyEnum key)
        {
            var selectedKeys = new List<VirtualKeyEnum>();

            if (useControl) selectedKeys.Add(VirtualKeyEnum.Ctrl);
            if (useAlt) selectedKeys.Add(VirtualKeyEnum.Alt);
            if (useShift) selectedKeys.Add(VirtualKeyEnum.Shift);
            if (useWin) selectedKeys.Add(VirtualKeyEnum.LeftWindowsKey);

            if (key != VirtualKeyEnum.None)
                selectedKeys.Add(key);

            return selectedKeys.ToArray();
        }

        private static class NativeMethods
        {
            [DllImport("user32.dll")]
            private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

            public static void KeyDown(VirtualKeyEnum key)
            {
                keybd_event((byte)key, 0, 0, UIntPtr.Zero); // KEYEVENTF_KEYDOWN
            }

            public static void KeyUp(VirtualKeyEnum key)
            {
                keybd_event((byte)key, 0, 0x0002, UIntPtr.Zero); // KEYEVENTF_KEYUP
            }
        }

        public enum ActionTypeEnum
        {
            [Display(Name = "Press", Description = "Presses and holds the selected key(s).")]
            Press,

            [Display(Name = "Release", Description = "Releases the selected key(s).")]
            Release
        }
    }
}