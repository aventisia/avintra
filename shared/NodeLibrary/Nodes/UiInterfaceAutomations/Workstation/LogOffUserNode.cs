using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Security.Principal;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Log Off User"), Description("Logs off the current user with various methods and options.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class LogOffUserNode : BaseNode
{
    [DisplayName("Logoff Method"), Description("Method to use for logging off")]
    public InArgument<LogoffMethodEnum> Method { get; set; } = new InArgument<LogoffMethodEnum>(LogoffMethodEnum.ShutdownCommand);

    [DisplayName("Force Logoff"), Description("Force logoff if applications don't respond")]
    public InArgument<bool> Force { get; set; } = new InArgument<bool>(false);

    [DisplayName("Success"), Description("True if the logoff was initiated successfully")]
    public OutArgument<bool> Success { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var method = Method.Get(context);
        var force = Force.Get(context);
        var status = string.Empty;
        var success = false;

        try
        {
            if (!IsCurrentUserInteractive())
            {
                status = "Cannot log off - current user is not interactive";
            }
            else
            {
                switch (method)
                {
                    case LogoffMethodEnum.ShutdownCommand:
                        success = LogoffWithShutdownCommand(force);
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
                        status = success
                            ? "Logoff initiated via WTS API"
                            : "Failed to initiate logoff via WTS API";
                        break;
                }
            }

            Success.Set(context, success);
            IsSuccess.Set(context, success);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Success.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error during logoff: {ex.Message}");
        }
    }

    private bool LogoffWithShutdownCommand(bool force)
    {
        try
        {
            var args = "/l";
            if (force)
            {
                args += " /f";
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
            EnablePrivilege("SeShutdownPrivilege");

            var flags = NativeMethods.EWX_LOGOFF;
            if (force)
            {
                flags |= NativeMethods.EWX_FORCE;
            }
            else
            {
                flags |= NativeMethods.EWX_FORCEIFHUNG;
            }

            var result = NativeMethods.ExitWindowsEx(flags, 0);
            if (!result)
            {
                var error = Marshal.GetLastWin32Error();
                Debug.WriteLine($"ExitWindowsEx error: {error}");
            }

            return result;
        }
        catch
        {
            return false;
        }
    }

    private void EnablePrivilege(string privilege)
    {
        var identity = WindowsIdentity.GetCurrent(TokenAccessLevels.AdjustPrivileges | TokenAccessLevels.Query);
        NativeMethods.LUID luid;
        if (!NativeMethods.LookupPrivilegeValue(null, privilege, out luid))
        {
            throw new Win32Exception(Marshal.GetLastWin32Error());
        }

        NativeMethods.TOKEN_PRIVILEGES tp;
        tp.PrivilegeCount = 1;
        tp.Luid = luid;
        tp.Attributes = NativeMethods.SE_PRIVILEGE_ENABLED;

        if (!NativeMethods.AdjustTokenPrivileges(identity.Token, false, ref tp, 0, IntPtr.Zero, IntPtr.Zero))
        {
            throw new Win32Exception(Marshal.GetLastWin32Error());
        }
    }

    private bool LogoffWithWTSAPI()
    {
        try
        {
            if (Environment.UserInteractive)
            {
                return false;
            }

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
        return Environment.UserInteractive;
    }

    private static class NativeMethods
    {
        [DllImport("advapi32.dll", SetLastError = true)]
        public static extern bool ExitWindowsEx(uint uFlags, uint dwReason);

        [DllImport("advapi32.dll", SetLastError = true)]
        public static extern bool LookupPrivilegeValue(string lpSystemName, string lpName, out LUID lpLuid);

        [DllImport("advapi32.dll", SetLastError = true)]
        public static extern bool AdjustTokenPrivileges(
            IntPtr tokenHandle,
            bool disableAllPrivileges,
            ref TOKEN_PRIVILEGES newState,
            uint zero,
            IntPtr null1,
            IntPtr null2);

        [DllImport("wtsapi32.dll", SetLastError = true)]
        public static extern bool WTSDisconnectSession(IntPtr hServer, int sessionId, bool bWait);

        [StructLayout(LayoutKind.Sequential)]
        public struct LUID
        {
            public uint LowPart;
            public int HighPart;
        }

        [StructLayout(LayoutKind.Sequential)]
        public struct TOKEN_PRIVILEGES
        {
            public uint PrivilegeCount;
            public LUID Luid;
            public uint Attributes;
        }

        public const uint SE_PRIVILEGE_ENABLED = 0x00000002;
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
