using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Show Desktop")]
    [Description("Minimizes or restores all windows to show/hide the desktop.")]
    public class ShowDesktopActivity : BaseCodeActivity
    {

        [DisplayName("Action")]
        [Description("Whether to show, hide, or toggle the desktop")]
        [DefaultValue(DesktopActionEnum.Show)]
        public InArgument<DesktopActionEnum> Action { get; set; }


        [DisplayName("Current State")]
        [Description("Returns whether desktop is currently visible after operation")]
        public OutArgument<bool> IsDesktopVisible { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var action = Action.Get(context);
            var status = string.Empty;
            var success = false;
            var isVisible = false;

            try
            {
                switch (action)
                {
                    case DesktopActionEnum.Show:
                        success = NativeMethods.MinimizeAllWindows();
                        isVisible = true;
                        status = "Desktop shown successfully";
                        break;

                    case DesktopActionEnum.Restore:
                        success = NativeMethods.RestoreAllWindows();
                        isVisible = false;
                        status = "Windows restored successfully";
                        break;

                    case DesktopActionEnum.Toggle:
                        isVisible = NativeMethods.IsDesktopVisible();
                        if (isVisible)
                        {
                            success = NativeMethods.RestoreAllWindows();
                            isVisible = false;
                            status = "Toggled - windows restored";
                        }
                        else
                        {
                            success = NativeMethods.MinimizeAllWindows();
                            isVisible = true;
                            status = "Toggled - desktop shown";
                        }

                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(action), action, null);
                }

                if (!success)
                {
                    status = "Operation failed. Could not perform desktop action.";
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, status);
                }
                else
                {
                    IsSuccess.Set(context, true);
                }

                IsDesktopVisible.Set(context, isVisible);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error managing desktop windows: {ex.Message}";
                Console.WriteLine($"Desktop Activity Error: {ex}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static class NativeMethods
        {
            [DllImport("user32.dll", SetLastError = true)]
            private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

            [DllImport("user32.dll", SetLastError = true)]
            private static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter,
                string lpszClass, string lpszWindow);

            [DllImport("user32.dll")]
            private static extern int SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

            private const uint WM_COMMAND = 0x0111;
            private const int MIN_ALL = 419;
            private const int MIN_ALL_UNDO = 416;

            public static bool MinimizeAllWindows()
            {
                try
                {
                    var shellTrayWnd = FindWindow("Shell_TrayWnd", null);
                    if (shellTrayWnd == IntPtr.Zero)
                        return false;

                    var buttonWnd = FindWindowEx(shellTrayWnd, IntPtr.Zero, "Button", null);
                    if (buttonWnd == IntPtr.Zero)
                        return false;

                    SendMessage(shellTrayWnd, WM_COMMAND, (IntPtr)MIN_ALL, IntPtr.Zero);
                    return true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"MinimizeAllWindows error: {ex.Message}");
                    return false;
                }
            }

            public static bool RestoreAllWindows()
            {
                try
                {
                    var shellTrayWnd = FindWindow("Shell_TrayWnd", null);
                    if (shellTrayWnd == IntPtr.Zero)
                        return false;

                    var buttonWnd = FindWindowEx(shellTrayWnd, IntPtr.Zero, "Button", null);
                    if (buttonWnd == IntPtr.Zero)
                        return false;

                    SendMessage(shellTrayWnd, WM_COMMAND, (IntPtr)MIN_ALL_UNDO, IntPtr.Zero);
                    return true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"RestoreAllWindows error: {ex.Message}");
                    return false;
                }
            }

            public static bool IsDesktopVisible()
            {
                try
                {
                    // Try to find Program Manager
                    var progman = FindWindow("Progman", "Program Manager");
                    if (progman == IntPtr.Zero)
                        return false;

                    // Look for SHELLDLL_DefView inside WorkerW window
                    var workerW = IntPtr.Zero;
                    var defView = FindWindowEx(progman, IntPtr.Zero, "SHELLDLL_DefView", null);

                    if (defView == IntPtr.Zero)
                    {
                        // If not found directly, look through WorkerW windows
                        workerW = FindWindowEx(IntPtr.Zero, progman, "WorkerW", null);
                        defView = workerW != IntPtr.Zero
                            ? FindWindowEx(workerW, IntPtr.Zero, "SHELLDLL_DefView", null)
                            : IntPtr.Zero;
                    }

                    return defView != IntPtr.Zero;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"IsDesktopVisible error: {ex.Message}");
                    return false;
                }
            }
        }

        public enum DesktopActionEnum
        {
            [Display(Name = "Show Desktop", Description = "Minimizes all windows to show desktop")]
            Show,

            [Display(Name = "Restore Windows", Description = "Restores all minimized windows")]
            Restore,

            [Display(Name = "Toggle", Description = "Toggles between showing desktop and restoring windows")]
            Toggle
        }
        
    }
}