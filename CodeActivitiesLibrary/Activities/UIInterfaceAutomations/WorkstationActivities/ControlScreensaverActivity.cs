using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Control Screensaver")]
    [Description("Enables, disables, starts, or stops the screensaver.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Workstation.svg")]
    public class ControlScreensaverActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Action")]
        [Description("The action to perform on the screensaver.")]
        public InArgument<ScreensaverActionEnum> Action { get; set; }

        [DisplayName("Time Out Seconds")]
        [Description("Timeout in seconds (only used when enabling screensaver).")]
        public InArgument<int> TimeoutSeconds { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var action = Action.Get(context);
            var timeout = TimeoutSeconds.Get(context);
            var status = "";

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

                StatusMessage.Set(context, status);
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error controlling screensaver: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private void EnableScreensaver(int timeoutSeconds = 300)
        {
            // Enable screensaver
            var enabled = 1;
            SystemParametersInfo(SPI_SETSCREENSAVEACTIVE, enabled, ref enabled, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);

            // Set timeout if specified
            if (timeoutSeconds > 0)
            {
                SystemParametersInfo(SPI_SETSCREENSAVETIMEOUT, timeoutSeconds, ref timeoutSeconds,
                    SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
            }
        }

        private void DisableScreensaver()
        {
            // Disable screensaver
            var disabled = 0;
            SystemParametersInfo(SPI_SETSCREENSAVEACTIVE, disabled, ref disabled, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
        }

        private void StartScreensaver()
        {
            // Force screensaver to start immediately
            SendMessage(GetDesktopWindow(), WM_SYSCOMMAND, (IntPtr)SC_SCREENSAVE, IntPtr.Zero);
        }

        private bool StopScreensaver()
        {
            // Try to find the screensaver window
            var hWnd = FindWindow("WindowsScreenSaverClass", null);
            if (hWnd == IntPtr.Zero)
            {
                hWnd = FindWindow("Default Screen Saver", null);
            }

            if (hWnd == IntPtr.Zero) return false;
            // Close the screensaver window
            SendMessage(hWnd, 0x0010, IntPtr.Zero, IntPtr.Zero); // WM_CLOSE
            return true;
        }

        // Windows API imports
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern bool SystemParametersInfo(int uAction, int uParam, ref int lpvParam, int flags);

        [DllImport("user32.dll")]
        private static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

        // Constants for SystemParametersInfo
        private const int SPI_GETSCREENSAVEACTIVE = 16;
        private const int SPI_SETSCREENSAVEACTIVE = 17;
        private const int SPI_GETSCREENSAVETIMEOUT = 14;
        private const int SPI_SETSCREENSAVETIMEOUT = 15;
        private const int SPIF_UPDATEINIFILE = 0x01;

        private const int SPIF_SENDCHANGE = 0x02;

        // Constants for SendMessage
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
}