using System.Reflection;
using System.Runtime.InteropServices;

namespace RunnerApp;

/// <summary>
/// Provides machine-local identity values for RunnerApp.
/// These values mirror the logic in the Tauri desktop app's
/// <c>get_user_metadata</c> command so the same physical machine
/// gets the same stable identifier regardless of which layer reads it.
/// </summary>
public static class MachineIdentity
{
    /// <summary>
    /// Stable OS installation identifier.
    /// Windows: HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography\MachineGuid
    /// Linux:   /etc/machine-id (fallback /var/lib/dbus/machine-id)
    /// Other:  Environment.MachineName
    /// </summary>
    public static string OsId => GetOsId();

    /// <summary>
    /// Current interactive OS username.
    /// On Windows, when running as a service (e.g. LocalSystem), this queries the active
    /// console/RDP session instead of returning the service account (e.g. THINKPAD$).
    /// This value is persisted in the Machines.Username column.
    /// </summary>
    public static string Username => GetUsername();

    /// <summary>
    /// The account under which the runner process is executing.
    /// For a Windows service this is typically LocalSystem / NT SERVICE\SERVICE_NAME
    /// or a machine account such as THINKPAD$. It is used to build the stable machine name.
    /// </summary>
    public static string ServiceAccountUsername => Environment.UserName;

    /// <summary>
    /// NetBIOS / hostname of the machine.
    /// </summary>
    public static string Hostname => Environment.MachineName;

    /// <summary>
    /// RunnerApp assembly version, used when connecting to the backend hub.
    /// </summary>
    public static string AppVersion => GetAppVersion();

    private static string GetUsername()
    {
        if (OperatingSystem.IsWindows())
        {
            try
            {
                var interactiveUsername = GetActiveWindowsSessionUsername();
                if (!string.IsNullOrWhiteSpace(interactiveUsername))
                {
                    return interactiveUsername;
                }
            }
            catch
            {
                // Fall through to the default identity.
            }
        }

        return Environment.UserName;
    }

    private static string? GetActiveWindowsSessionUsername()
    {
        const int WTS_CURRENT_SERVER_HANDLE = 0;
        const int WTSUserName = 5;

        if (!WTSEnumerateSessions(WTS_CURRENT_SERVER_HANDLE, 0, 1, out var sessionInfoPtr, out var sessionCount))
        {
            return null;
        }

        try
        {
            var sessionSize = Marshal.SizeOf(typeof(WTS_SESSION_INFO));
            var current = sessionInfoPtr;

            for (var i = 0; i < sessionCount; i++)
            {
                var session = Marshal.PtrToStructure<WTS_SESSION_INFO>(current);
                current = IntPtr.Add(current, sessionSize);

                // "Active" is the normal interactive logon state.
                if (session.State != WTS_CONNECTSTATE_CLASS.WTSActive)
                {
                    continue;
                }

                var bufferPtr = IntPtr.Zero;
                try
                {
                    if (!WTSQuerySessionInformation(WTS_CURRENT_SERVER_HANDLE, session.SessionId, WTSUserName, out bufferPtr, out _))
                    {
                        continue;
                    }

                    var username = Marshal.PtrToStringAnsi(bufferPtr);
                    if (!string.IsNullOrWhiteSpace(username))
                    {
                        return username;
                    }
                }
                finally
                {
                    if (bufferPtr != IntPtr.Zero)
                    {
                        WTSFreeMemory(bufferPtr);
                    }
                }
            }
        }
        finally
        {
            WTSFreeMemory(sessionInfoPtr);
        }

        return null;
    }

    [DllImport("wtsapi32.dll", SetLastError = true)]
    private static extern bool WTSEnumerateSessions(
        int hServer,
        int reserved,
        int version,
        out IntPtr ppSessionInfo,
        out int pCount);

    [DllImport("wtsapi32.dll", SetLastError = true)]
    private static extern bool WTSQuerySessionInformation(
        int hServer,
        int sessionId,
        int wtsInfoClass,
        out IntPtr ppBuffer,
        out int pBytesReturned);

    [DllImport("wtsapi32.dll", SetLastError = true)]
    private static extern void WTSFreeMemory(IntPtr pMemory);

    [StructLayout(LayoutKind.Sequential)]
    private struct WTS_SESSION_INFO
    {
        public int SessionId;
        [MarshalAs(UnmanagedType.LPStr)]
        public string pWinStationName;
        public WTS_CONNECTSTATE_CLASS State;
    }

    private enum WTS_CONNECTSTATE_CLASS
    {
        WTSActive,
        WTSConnected,
        WTSConnectQuery,
        WTSShadow,
        WTSDisconnected,
        WTSIdle,
        WTSListen,
        WTSReset,
        WTSDown,
        WTSInit
    }

    private static string GetOsId()
    {
        if (OperatingSystem.IsWindows())
        {
            try
            {
                using var key = Microsoft.Win32.Registry.LocalMachine
                    .OpenSubKey(@"SOFTWARE\Microsoft\Cryptography");

                if (key?.GetValue("MachineGuid") is string guid && !string.IsNullOrWhiteSpace(guid))
                {
                    return guid;
                }
            }
            catch
            {
                // Fall through to hostname fallback.
            }

            return Environment.MachineName;
        }

        // Linux: try systemd machine-id first, then D-Bus fallback.
        foreach (var path in new[] { "/etc/machine-id", "/var/lib/dbus/machine-id" })
        {
            try
            {
                var content = File.ReadAllText(path).Trim();
                if (!string.IsNullOrWhiteSpace(content))
                {
                    return content;
                }
            }
            catch
            {
                // Try the next location.
            }
        }

        return Environment.MachineName;
    }

    private static string GetAppVersion()
    {
        var version = Assembly.GetExecutingAssembly().GetName().Version;
        if (version != null)
        {
            return $"{version.Major}.{version.Minor}.{version.Build}";
        }

        return "1.0.0";
    }
}
