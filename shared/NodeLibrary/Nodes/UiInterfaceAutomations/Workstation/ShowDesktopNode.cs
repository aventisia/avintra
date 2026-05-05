using System.Runtime.InteropServices;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Show Desktop"), Description("Minimizes or restores all windows to show/hide the desktop.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class ShowDesktopNode : BaseNode
{
    [DisplayName("Action"), Description("Whether to show, hide, or toggle the desktop")]
    public InArgument<DesktopActionEnum> Action { get; set; } = new InArgument<DesktopActionEnum>(DesktopActionEnum.Show);

    [DisplayName("Current State"), Description("Returns whether desktop is currently visible after operation")]
    public OutArgument<bool> IsDesktopVisible { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
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
            }

            IsDesktopVisible.Set(context, isVisible);
            IsSuccess.Set(context, success);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error managing desktop windows: {ex.Message}");
        }
    }

    private static class NativeMethods
    {
        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

        [DllImport("user32.dll")]
        private static extern int SendMessage(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

        private const uint WM_COMMAND = 0x0111;
        private const int MIN_ALL = 419;
        private const int MIN_ALL_UNDO = 416;

        public static bool MinimizeAllWindows()
        {
            try
            {
                var shellTrayWnd = FindWindow("Shell_TrayWnd", null);
                if (shellTrayWnd == IntPtr.Zero)
                {
                    return false;
                }

                var buttonWnd = FindWindowEx(shellTrayWnd, IntPtr.Zero, "Button", null);
                if (buttonWnd == IntPtr.Zero)
                {
                    return false;
                }

                SendMessage(shellTrayWnd, WM_COMMAND, (IntPtr)MIN_ALL, IntPtr.Zero);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool RestoreAllWindows()
        {
            try
            {
                var shellTrayWnd = FindWindow("Shell_TrayWnd", null);
                if (shellTrayWnd == IntPtr.Zero)
                {
                    return false;
                }

                var buttonWnd = FindWindowEx(shellTrayWnd, IntPtr.Zero, "Button", null);
                if (buttonWnd == IntPtr.Zero)
                {
                    return false;
                }

                SendMessage(shellTrayWnd, WM_COMMAND, (IntPtr)MIN_ALL_UNDO, IntPtr.Zero);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool IsDesktopVisible()
        {
            try
            {
                var progman = FindWindow("Progman", "Program Manager");
                if (progman == IntPtr.Zero)
                {
                    return false;
                }

                var workerW = IntPtr.Zero;
                var defView = FindWindowEx(progman, IntPtr.Zero, "SHELLDLL_DefView", null);

                if (defView == IntPtr.Zero)
                {
                    workerW = FindWindowEx(IntPtr.Zero, progman, "WorkerW", null);
                    defView = workerW != IntPtr.Zero
                        ? FindWindowEx(workerW, IntPtr.Zero, "SHELLDLL_DefView", null)
                        : IntPtr.Zero;
                }

                return defView != IntPtr.Zero;
            }
            catch
            {
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
