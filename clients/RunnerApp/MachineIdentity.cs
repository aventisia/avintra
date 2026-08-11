using System.Reflection;

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
    /// Current OS username.
    /// </summary>
    public static string Username => Environment.UserName;

    /// <summary>
    /// NetBIOS / hostname of the machine.
    /// </summary>
    public static string Hostname => Environment.MachineName;

    /// <summary>
    /// RunnerApp assembly version, used when connecting to the backend hub.
    /// </summary>
    public static string AppVersion => GetAppVersion();

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
