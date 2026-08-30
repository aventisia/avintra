using System.Runtime.InteropServices;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Control Screensaver"), Description("Enables, disables, starts, or stops the screensaver.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class ControlScreensaverNode : BaseNode
{
    [DisplayName("Action"), Description("The action to perform on the screensaver.")]
    public required InArgument<ScreensaverActionEnum> Action { get; set; } = new InArgument<ScreensaverActionEnum>(ScreensaverActionEnum.Enable);

    [DisplayName("Time Out Seconds"), Description("Timeout in seconds (only used when enabling screensaver).")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(0);

    protected override void Execute(INodeContext context)
    {
        var action = Action.Get(context);
        var timeout = TimeoutSeconds.Get(context);
        var status = string.Empty;

        try
        {
            switch (action)
            {
                case ScreensaverActionEnum.Enable:
                    EnableScreensaver(timeout);
                    status = $"Screensaver enabled with timeout {timeout} seconds.";
                    break;
                case ScreensaverActionEnum.Disable:
                    DisableScreensaver();
                    status = "Screensaver disabled successfully.";
                    break;
                case ScreensaverActionEnum.Start:
                    StartScreensaver();
                    status = "Screensaver started successfully.";
                    break;
                case ScreensaverActionEnum.Stop:
                    status = StopScreensaver()
                        ? "Screensaver stopped successfully."
                        : "No screensaver was running.";
                    break;
                default:
                    status = "Invalid action specified.";
                    break;
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error controlling screensaver: {ex.Message}");
        }
    }

    private void EnableScreensaver(int timeoutSeconds = 300)
    {
        var enabled = 1;
        SystemParametersInfo(SPI_SETSCREENSAVEACTIVE, enabled, ref enabled, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);

        if (timeoutSeconds > 0)
        {
            SystemParametersInfo(SPI_SETSCREENSAVETIMEOUT, timeoutSeconds, ref timeoutSeconds,
                SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
        }
    }

    private void DisableScreensaver()
    {
        var disabled = 0;
        SystemParametersInfo(SPI_SETSCREENSAVEACTIVE, disabled, ref disabled, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
    }

    private void StartScreensaver()
    {
        SendMessage(GetDesktopWindow(), WM_SYSCOMMAND, (IntPtr)SC_SCREENSAVE, IntPtr.Zero);
    }

    private bool StopScreensaver()
    {
        var hWnd = FindWindow("WindowsScreenSaverClass", null);
        if (hWnd == IntPtr.Zero)
        {
            hWnd = FindWindow("Default Screen Saver", null);
        }

        if (hWnd == IntPtr.Zero)
        {
            return false;
        }

        SendMessage(hWnd, 0x0010, IntPtr.Zero, IntPtr.Zero);
        return true;
    }

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    private static extern bool SystemParametersInfo(int uAction, int uParam, ref int lpvParam, int flags);

    [DllImport("user32.dll")]
    private static extern IntPtr SendMessage(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

    private const int SPI_SETSCREENSAVEACTIVE = 17;
    private const int SPI_SETSCREENSAVETIMEOUT = 15;
    private const int SPIF_UPDATEINIFILE = 0x01;
    private const int SPIF_SENDCHANGE = 0x02;

    private const uint WM_SYSCOMMAND = 0x0112;
    private const uint SC_SCREENSAVE = 0xF140;

    [DllImport("user32.dll")]
    private static extern IntPtr GetDesktopWindow();

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
}

public enum ScreensaverActionEnum
{
    [Display(Name = "Enable", Description = "Enables the screensaver.")]
    Enable = 0,

    [Display(Name = "Disable", Description = "Disables the screensaver.")]
    Disable = 1,

    [Display(Name = "Start", Description = "Starts the screensaver.")]
    Start = 2,

    [Display(Name = "Stop", Description = "Stops the screensaver.")]
    Stop = 3
}
