using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Security.Principal;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Log Off User")]
    [Description("Logs off the current user with various methods and options.")]
    public class LogOffUserActivity : BaseCodeActivity
    {
        [DisplayName("Logoff Method")]
        [Description("Method to use for logging off")]
        [DefaultValue(LogoffMethodEnum.ShutdownCommand)]
        public InArgument<LogoffMethodEnum> Method { get; set; } = LogoffMethodEnum.ShutdownCommand;


        [DisplayName("Force Logoff")]
        [Description("Force logoff if applications don't respond")]
        [DefaultValue(false)]
        public InArgument<bool> Force { get; set; } = false;


        [DisplayName("Timeout Seconds")]
        [Description("Timeout in seconds before forced logoff (if Force is true)")]
        [DefaultValue(30)]
        public InArgument<int> TimeoutSeconds { get; set; } = 30;


        [DisplayName("Success")]
        [Description("True if the logoff was initiated successfully")]
        public OutArgument<bool> Success { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var method = Method.Get(context);
            var force = Force.Get(context);
            var timeout = TimeoutSeconds.Get(context);
            var status = string.Empty;
            var success = false;

            try
            {
                if (!IsCurrentUserInteractive())
                {
                    StatusMessage.Set(context, "Cannot log off - current user is not interactive");
                    Success.Set(context, false);
                    return;
                }

                switch (method)
                {
                    case LogoffMethodEnum.ShutdownCommand:
                        success = LogoffWithShutdownCommand(force, timeout);
                        status = success
                            ? "Logoff initiated via shutdown command"
                            : "Failed to initiate logoff via shutdown command";
                        break;

                    case LogoffMethodEnum.WindowsAPI:
                        success = LogoffWithWindowsAPI(force);
                        status = success
                            ? "Logoff initiated via Windows API"
                            : "Failed to initiate logoff via Windows API";
                        break;

                    case LogoffMethodEnum.WTSAPI:
                        success = LogoffWithWTSAPI();
                        status = success ? "Logoff initiated via WTS API" : "Failed to initiate logoff via WTS API";
                        break;
                }
                Success.Set(context, success);
                IsSuccess.Set(context, success);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error during logoff: {ex.Message}";
                success = false;
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private bool LogoffWithShutdownCommand(bool force, int timeout)
        {
            try
            {
                var args = "/l";
                if (force)
                {
                    args += $" /t {timeout} /f";
                }

                var startInfo = new ProcessStartInfo
                {
                    FileName = "shutdown",
                    Arguments = args,
                    CreateNoWindow = true,
                    UseShellExecute = false
                };

                var process = Process.Start(startInfo);
                return process != null;
            }
            catch
            {
                return false;
            }
        }

        private bool LogoffWithWindowsAPI(bool force)
        {
            try
            {
                var flags = NativeMethods.EWX_LOGOFF;
                if (force)
                {
                    flags |= NativeMethods.EWX_FORCE;
                }
                else
                {
                    flags |= NativeMethods.EWX_FORCEIFHUNG;
                }

                return NativeMethods.ExitWindowsEx(flags, 0);
            }
            catch
            {
                return false;
            }
        }

        private bool LogoffWithWTSAPI()
        {
            try
            {
                return NativeMethods.WTSDisconnectSession(
                    NativeMethods.WTS_CURRENT_SERVER_HANDLE,
                    NativeMethods.WTS_CURRENT_SESSION,
                    false);
            }
            catch
            {
                return false;
            }
        }

        private bool IsCurrentUserInteractive()
        {
            try
            {
                var identity = WindowsIdentity.GetCurrent();
                if (identity == null) return false;

                var principal = new WindowsPrincipal(identity);
                return principal.IsInRole(WindowsBuiltInRole.User);
            }
            catch
            {
                return false;
            }
        }

        private static class NativeMethods
        {
            [DllImport("advapi32.dll", SetLastError = true)]
            public static extern bool ExitWindowsEx(uint uFlags, uint dwReason);

            [DllImport("wtsapi32.dll", SetLastError = true)]
            public static extern bool WTSDisconnectSession(
                IntPtr hServer,
                int sessionId,
                bool bWait);

            public const uint EWX_LOGOFF = 0x00;
            public const uint EWX_FORCE = 0x04;
            public const uint EWX_FORCEIFHUNG = 0x10;

            public static readonly IntPtr WTS_CURRENT_SERVER_HANDLE = IntPtr.Zero;
            public const int WTS_CURRENT_SESSION = -1;
        }

        public enum LogoffMethodEnum
        {
            [Display(Name = "Shutdown Command", Description = "Uses shutdown.exe command line tool")]
            ShutdownCommand,

            [Display(Name = "Windows API", Description = "Uses ExitWindowsEx Windows API")]
            WindowsAPI,

            [Display(Name = "WTS API", Description = "Uses Terminal Services API")]
            WTSAPI
        }
    }
}