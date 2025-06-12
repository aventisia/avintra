using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
// For [Display]

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{

    [DisplayName("Set Key State")]
    [Description("Sets the state (on or off) for the keys Caps Lock, Num Lock, or Scroll Lock.")]
    public class SetKeyStateActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Key")]
        [Description("The key to modify (e.g., 'CapsLock', 'NumLock', 'ScrollLock').")]
        public InArgument<KeyEnum> Key { get; set; }

        [RequiredArgument]
        [DisplayName("State")]
        [Description("Whether to enable (On) or disable (Off) the key state.")]
        public InArgument<StateEnum> State { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var key = Key.Get(context);
                var state = State.Get(context);

                switch (key)
                {
                    case KeyEnum.CapsLock:
                        ToggleCapsLock(state == StateEnum.On);
                        break;
                    case KeyEnum.NumLock:
                        ToggleNumLock(state == StateEnum.On);
                        break;
                    case KeyEnum.ScrollLock:
                        ToggleScrollLock(state == StateEnum.On);
                        break;
                    default:
                        throw new ArgumentException(
                            $"Unsupported key: '{key}'. Supported keys are CapsLock, NumLock, ScrollLock.");
                }

                status = $"Successfully set {key.GetDisplayName()} to {(state == StateEnum.On ? "enabled" : "disabled")}.";
            }
            catch (Exception ex)
            {
                status = $"Error setting key state: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private static void ToggleCapsLock(bool enable)
        {
            const int VK_CAPITAL = 0x14; // Virtual Key Code for Caps Lock

            if (enable)
            {
                NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_CAPITAL);
                NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_CAPITAL);
            }
            else
            {
                NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_CAPITAL);
                NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_CAPITAL);
            }
        }

        private static void ToggleNumLock(bool enable)
        {
            const int VK_NUMLOCK = 0x90; // Virtual Key Code for Num Lock

            if (enable)
            {
                NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_NUMLOCK);
                NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_NUMLOCK);
            }
            else
            {
                NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_NUMLOCK);
                NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_NUMLOCK);
            }
        }

        private static void ToggleScrollLock(bool enable)
        {
            const int VK_SCROLL = 0x91; // Virtual Key Code for Scroll Lock

            if (enable)
            {
                NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_SCROLL);
                NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_SCROLL);
            }
            else
            {
                NativeMethods.KeyUp((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_SCROLL);
                NativeMethods.KeyDown((uint)NativeMethods.VkCode.KEYEVENTF_EXTENDEDKEY, VK_SCROLL);
            }
        }

        private static class NativeMethods
        {
            [DllImport("user32.dll")]
            private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

            public static void KeyDown(uint dwFlags, uint vk)
            {
                keybd_event((byte)vk, 0, dwFlags, UIntPtr.Zero);
            }

            public static void KeyUp(uint dwFlags, uint vk)
            {
                keybd_event((byte)vk, 0, dwFlags | 0x0002, UIntPtr.Zero); // KEYEVENTF_KEYUP
            }

            public enum VkCode : uint
            {
                KEYEVENTF_EXTENDEDKEY = 0x0001,
                KEYEVENTF_KEYUP = 0x0002
            }
        }
    }
    public static class EnumExtensions
    {
        public static string GetDisplayName(this Enum value)
        {
            var field = value.GetType().GetField(value.ToString());
            var attribute = (DisplayAttribute)Attribute.GetCustomAttribute(
                field,
                typeof(DisplayAttribute));

            return attribute?.Name ?? value.ToString();
        }
    }
    // Define the KeyEnum with Display attributes
    public enum KeyEnum
    {
        [Display(Name = "Caps Lock", Description = "Toggles the Caps Lock state.")]
        CapsLock,

        [Display(Name = "Num Lock", Description = "Toggles the Num Lock state.")]
        NumLock,

        [Display(Name = "Scroll Lock", Description = "Toggles the Scroll Lock state.")]
        ScrollLock
    }

    // Define the StateEnum with Display attributes
    public enum StateEnum
    {
        [Display(Name = "On", Description = "Enables the key state.")]
        On,

        [Display(Name = "Off", Description = "Disables the key state.")]
        Off
    }
}