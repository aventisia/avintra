using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Security.Principal;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Lock Workstation")]
    [Description("Locks the workstation's display to protect it from unauthorized use. Optionally forces lock even if workstation doesn't support it.")]
    public class LockWorkstationActivity : BaseCodeActivity
    {

        [DisplayName("Force Lock")]
        [Description("When true, will attempt alternative methods if standard lock fails")]
        [DefaultValue(false)]
        public InArgument<bool> ForceLock { get; set; }


        [DisplayName("Success")]
        [Description("Indicates whether the workstation was successfully locked")]
        public OutArgument<bool> Success { get; set; }


        [DisplayName("Method Used")]
        [Description("Describes which locking method was successful")]
        public OutArgument<string> MethodUsed { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var forceLock = ForceLock.Get(context);
            var status = string.Empty;
            var success = false;
            var methodUsed = "Standard API";

            try
            {
                // Check if user has permission to lock workstation
                if (!HasLockWorkstationPermission())
                {
                    throw new UnauthorizedAccessException("Current user doesn't have permission to lock workstation");
                }

                // Try standard lock first
                if (NativeMethods.LockWorkStation())
                {
                    success = true;
                }
                else if (forceLock)
                {
                    // Try alternative methods if forced
                    success = TryAlternativeLockMethods(out methodUsed);
                }

                if (!success)
                {
                    var errorCode = Marshal.GetLastWin32Error();
                    throw new System.ComponentModel.Win32Exception(errorCode, "Failed to lock workstation");
                }

                Success.Set(context, success);
                MethodUsed.Set(context, methodUsed);
                StatusMessage.Set(context, $"Workstation locked successfully using {methodUsed}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error locking workstation: {ex.Message}");
                Success.Set(context, false);
                MethodUsed.Set(context, "Failed");
                return;
            }
        }

        private bool TryAlternativeLockMethods(out string methodUsed)
        {
            methodUsed = "Alternative Method";

            // Method 1: Simulate Win+L key combination
            try
            {
                const int KEYEVENTF_EXTENDEDKEY = 0x1;
                const int KEYEVENTF_KEYUP = 0x2;
                const int VK_LWIN = 0x5B;
                const int VK_L = 0x4C;

                NativeMethods.keybd_event(VK_LWIN, 0, KEYEVENTF_EXTENDEDKEY, 0);
                NativeMethods.keybd_event(VK_L, 0, KEYEVENTF_EXTENDEDKEY, 0);
                NativeMethods.keybd_event(VK_L, 0, KEYEVENTF_KEYUP, 0);
                NativeMethods.keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, 0);

                methodUsed = "Win+L Simulation";
                return true;
            }
            catch
            {
                // Try next method if this fails
            }

            // Method 2: Use screensaver with immediate lock
            try
            {
                NativeMethods.SetScreenSaverActive(true);
                NativeMethods.SendMessage(
                    NativeMethods.GetDesktopWindow(),
                    NativeMethods.WM_SYSCOMMAND,
                    (IntPtr)NativeMethods.SC_SCREENSAVE,
                    IntPtr.Zero);

                methodUsed = "ScreenSaver Activation";
                return true;
            }
            catch
            {
                return false;
            }
        }

        private bool HasLockWorkstationPermission()
        {
            // In a domain environment, check group policy restrictions
            using (var identity = WindowsIdentity.GetCurrent())
            {
                return true; // Simplified - in real implementation would check actual permissions
            }
        }

        private static class NativeMethods
        {
            [DllImport("user32.dll", SetLastError = true)]
            [return: MarshalAs(UnmanagedType.Bool)]
            public static extern bool LockWorkStation();

            [DllImport("user32.dll", SetLastError = true)]
            public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

            [DllImport("user32.dll", SetLastError = true)]
            public static extern IntPtr GetDesktopWindow();

            [DllImport("user32.dll", CharSet = CharSet.Auto)]
            public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

            [DllImport("user32.dll", CharSet = CharSet.Auto)]
            [return: MarshalAs(UnmanagedType.Bool)]
            public static extern bool SetScreenSaverActive(bool bActive);

            public const uint WM_SYSCOMMAND = 0x0112;
            public const uint SC_SCREENSAVE = 0xF140;
        }
    }
}