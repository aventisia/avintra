using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Security;

namespace RunnerApp.Services;

/// <summary>
/// Launches a per-job worker process for the Windows service.
/// Default behavior runs the worker in the active interactive user session so that UI-dependent
/// nodes (MessageBox, Office dialogs, etc.) can display. With <paramref name="unattended"/> the
/// worker stays in the service's non-interactive session (session 0).
/// </summary>
public static class WorkerProcessLauncher
{
    // P/Invoke declarations for session switching on Windows.
    private const int WTS_CURRENT_SERVER_HANDLE = 0;

    [DllImport("wtsapi32.dll", SetLastError = true)]
    private static extern bool WTSQueryUserToken(int sessionId, out IntPtr phToken);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint WTSGetActiveConsoleSessionId();

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    private static extern bool CreateProcessAsUser(
        IntPtr hToken,
        string? lpApplicationName,
        string lpCommandLine,
        IntPtr lpProcessAttributes,
        IntPtr lpThreadAttributes,
        bool bInheritHandles,
        uint dwCreationFlags,
        IntPtr lpEnvironment,
        string? lpCurrentDirectory,
        ref STARTUPINFO lpStartupInfo,
        out PROCESS_INFORMATION lpProcessInformation);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr hObject);

    [DllImport("userenv.dll", SetLastError = true)]
    private static extern bool CreateEnvironmentBlock(out IntPtr lpEnvironment, IntPtr hToken, bool bInherit);

    [DllImport("userenv.dll", SetLastError = true)]
    private static extern bool DestroyEnvironmentBlock(IntPtr lpEnvironment);

    [DllImport("advapi32.dll", SetLastError = true)]
    private static extern bool GetTokenInformation(
        IntPtr TokenHandle,
        int TokenInformationClass,
        IntPtr TokenInformation,
        int TokenInformationLength,
        out int ReturnLength);

    private const int TokenUser = 1;

    [StructLayout(LayoutKind.Sequential)]
    private struct STARTUPINFO
    {
        public int cb;
        public IntPtr lpReserved;
        public IntPtr lpDesktop;
        public IntPtr lpTitle;
        public int dwX;
        public int dwY;
        public int dwXSize;
        public int dwYSize;
        public int dwXCountChars;
        public int dwYCountChars;
        public int dwFillAttribute;
        public int dwFlags;
        public short wShowWindow;
        public short cbReserved2;
        public IntPtr lpReserved2;
        public IntPtr hStdInput;
        public IntPtr hStdOutput;
        public IntPtr hStdError;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct PROCESS_INFORMATION
    {
        public IntPtr hProcess;
        public IntPtr hThread;
        public int dwProcessId;
        public int dwThreadId;
    }

    private const uint CREATE_NEW_CONSOLE = 0x00000010;
    private const uint CREATE_NO_WINDOW = 0x08000000;
    private const uint CREATE_UNICODE_ENVIRONMENT = 0x00000400;
    private const int STARTF_USESHOWWINDOW = 0x00000001;
    private const short SW_HIDE = 0;
    private const int ERROR_NO_TOKEN = 1008;

    /// <summary>
    /// Launches the worker process. Interactive sessions are tried first when not unattended.
    /// Falls back to launching in the current (session 0) process when unattended or when no
    /// interactive session is available.
    /// </summary>
    public static Process LaunchWorker(
        string executablePath,
        RunnerAppOptions workerOptions,
        string? machineJwt)
    {
        if (workerOptions.Unattended)
        {
            DebugLog.Info($"Launching worker for job {workerOptions.JobId} in unattended session-0 mode.");
            return LaunchInCurrentSession(executablePath, workerOptions, machineJwt);
        }

        var activeSessionId = WTSGetActiveConsoleSessionId();
        if (activeSessionId == unchecked((uint)-1))
        {
            DebugLog.Warn($"No active console session for job {workerOptions.JobId}; falling back to session-0 (service account).");
            return LaunchInCurrentSession(executablePath, workerOptions, machineJwt);
        }

        DebugLog.Info($"Launching worker for job {workerOptions.JobId} in active session {activeSessionId}.");
        return LaunchInSession(executablePath, workerOptions, machineJwt, (int)activeSessionId);
    }

    private static Process LaunchInSession(
        string executablePath,
        RunnerAppOptions workerOptions,
        string? machineJwt,
        int sessionId)
    {
        if (!OperatingSystem.IsWindows())
        {
            // Non-Windows platforms do not support session switching; run in current session.
            return LaunchInCurrentSession(executablePath, workerOptions, machineJwt);
        }

        if (!WTSQueryUserToken(sessionId, out var userToken))
        {
            var error = Marshal.GetLastWin32Error();
            var message = error == ERROR_NO_TOKEN
                ? $"Cannot query user token for session {sessionId}: the session is not interactive or the caller lacks permission."
                : $"WTSQueryUserToken failed for session {sessionId} (win32 error {error}).";
            DebugLog.Warn($"{message} Falling back to session-0 launch for job {workerOptions.JobId}.");
            return LaunchInCurrentSession(executablePath, workerOptions, machineJwt);
        }

        try
        {
            var commandLine = BuildCommandLine(executablePath, workerOptions);
            var startupInfo = new STARTUPINFO
            {
                cb = Marshal.SizeOf(typeof(STARTUPINFO)),
                lpDesktop = IntPtr.Zero,
                dwFlags = STARTF_USESHOWWINDOW,
                wShowWindow = SW_HIDE
            };

            // CREATE_NO_WINDOW prevents a visible console window from flashing when the
            // service spawns the worker in the interactive user session. CREATE_UNICODE_ENVIRONMENT
            // keeps the custom environment block (JWT + interactive username) as Unicode.
            var creationFlags = CREATE_NO_WINDOW | CREATE_UNICODE_ENVIRONMENT;

            // We pass AVINTRA_MACHINE_JWT as an environment variable so it does not appear in
            // command-line arguments that are visible to other users via Task Manager / WMI.
            // Use the actual username from the token/session so the flow's GetWindowsEnvironmentVariable
            // node reads the logged-in user instead of the service account.
            var sessionUsername = GetUsernameFromToken(userToken) ?? MachineIdentity.Username;
            DebugLog.Info($"Launching worker for job {workerOptions.JobId} as user '{sessionUsername}' in session {sessionId}.");

            var environment = BuildEnvironmentBlockFromToken(userToken, machineJwt, sessionUsername);
            var envPtr = environment;

            try
            {
                if (!CreateProcessAsUser(
                    userToken,
                    null,
                    commandLine,
                    IntPtr.Zero,
                    IntPtr.Zero,
                    false,
                    creationFlags,
                    envPtr,
                    null,
                    ref startupInfo,
                    out var processInfo))
                {
                    var error = Marshal.GetLastWin32Error();
                    throw new Win32Exception(error, "CreateProcessAsUser failed while launching worker process.");
                }

                // Close handles we no longer need; the process object is obtained by PID so the
                // caller can still wait/kill it.
                if (processInfo.hThread != IntPtr.Zero)
                    CloseHandle(processInfo.hThread);
                if (processInfo.hProcess != IntPtr.Zero)
                    CloseHandle(processInfo.hProcess);

                // Give the process a moment to start before attaching via PID.
                var sw = Stopwatch.StartNew();
                while (sw.Elapsed < TimeSpan.FromSeconds(5))
                {
                    try
                    {
                        var process = Process.GetProcessById(processInfo.dwProcessId);
                        if (!process.HasExited)
                            return process;
                    }
                    catch (ArgumentException)
                    {
                        // Process has not yet registered with the system.
                    }
                    Thread.Sleep(50);
                }

                throw new InvalidOperationException($"Worker process with PID {processInfo.dwProcessId} did not become available after launch.");
            }
            finally
            {
                if (envPtr != IntPtr.Zero)
                    DestroyEnvironmentBlock(envPtr);
            }
        }
        finally
        {
            CloseHandle(userToken);
        }
    }

    private static string? GetUsernameFromToken(IntPtr token)
    {
        try
        {
            if (!OperatingSystem.IsWindows())
                return null;

            // Determine required buffer size.
            if (!GetTokenInformation(token, TokenUser, IntPtr.Zero, 0, out var size) && size == 0)
                return null;

            var buffer = Marshal.AllocHGlobal(size);
            try
            {
                if (!GetTokenInformation(token, TokenUser, buffer, size, out _))
                    return null;

                // TOKEN_USER contains a pointer to SID_AND_ATTRIBUTES.
                var tokenUser = Marshal.PtrToStructure<TOKEN_USER>(buffer);
                var ntAccount = new System.Security.Principal.SecurityIdentifier(tokenUser.User.Sid)
                    .Translate(typeof(System.Security.Principal.NTAccount))
                    .Value;

                // Return only the username part (e.g. "Gaurav"), not "DOMAIN\Gaurav",
                // so Environment.GetEnvironmentVariable("USERNAME") matches normal Windows behavior.
                var separatorIndex = ntAccount.LastIndexOf('\\');
                return separatorIndex >= 0 ? ntAccount.Substring(separatorIndex + 1) : ntAccount;
            }
            finally
            {
                Marshal.FreeHGlobal(buffer);
            }
        }
        catch (Exception ex)
        {
            DebugLog.Warn($"Failed to resolve username from token: {ex.Message}");
            return null;
        }
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct TOKEN_USER
    {
        public SID_AND_ATTRIBUTES User;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct SID_AND_ATTRIBUTES
    {
        public IntPtr Sid;
        public uint Attributes;
    }

    /// <summary>
    /// Launch in the current process context. Used for unattended mode or non-Windows platforms.
    /// The worker runs hidden (no console window) because it is already detached from any UI.
    /// </summary>
    public static Process LaunchInCurrentSession(
        string executablePath,
        RunnerAppOptions workerOptions,
        string? machineJwt)
    {
        var psi = new ProcessStartInfo
        {
            FileName = executablePath,
            Arguments = BuildArguments(workerOptions),
            CreateNoWindow = true,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };

        if (!string.IsNullOrWhiteSpace(machineJwt))
        {
            psi.EnvironmentVariables["AVINTRA_MACHINE_JWT"] = machineJwt;
        }

        // Pass the interactive username so MachineIdentity.Username resolves correctly
        // even when the worker is launched from a Windows service process.
        psi.EnvironmentVariables["AVINTRA_INTERACTIVE_USERNAME"] = MachineIdentity.Username;

        var process = new Process { StartInfo = psi, EnableRaisingEvents = true };
        process.Start();
        return process;
    }

    private static string BuildCommandLine(string executablePath, RunnerAppOptions workerOptions)
    {
        var args = BuildArguments(workerOptions);
        // Quote the executable path for CreateProcessAsUser command line.
        return $"\"{executablePath}\" {args}";
    }

    private static string BuildArguments(RunnerAppOptions workerOptions)
    {
        var sb = new System.Text.StringBuilder();
        sb.Append("--worker");
        sb.Append(" --launcher service");
        sb.Append(CultureInvariant($" --appBaseUrl {Quote(workerOptions.AppBaseUrl)}"));

        if (workerOptions.JobId.HasValue)
        {
            sb.Append(CultureInvariant($" --jobId {workerOptions.JobId.Value}"));
        }

        if (workerOptions.Unattended)
        {
            sb.Append(" --unattended");
        }

        if (!string.IsNullOrWhiteSpace(workerOptions.AccessToken))
        {
            // Fallback only for direct CLI invocation. Service mode passes JWT via env.
            sb.Append(CultureInvariant($" --accessToken {Quote(workerOptions.AccessToken)}"));
        }

        if (workerOptions.WebsocketPort != 0)
        {
            sb.Append(CultureInvariant($" --websocketPort {workerOptions.WebsocketPort}"));
        }

        return sb.ToString();
    }

    private static IntPtr BuildEnvironmentBlockFromToken(IntPtr token, string? machineJwt, string interactiveUsername)
    {
        if (!OperatingSystem.IsWindows())
            return IntPtr.Zero;

        if (!CreateEnvironmentBlock(out var envBlock, token, false))
        {
            var error = Marshal.GetLastWin32Error();
            DebugLog.Warn($"CreateEnvironmentBlock failed (win32 error {error}); worker will inherit service environment.");
            return IntPtr.Zero;
        }

        try
        {
            var entries = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            // Read the token's environment block and copy it.
            var current = envBlock;
            while (true)
            {
                var entry = Marshal.PtrToStringUni(current);
                if (string.IsNullOrEmpty(entry))
                    break;

                var separatorIndex = entry.IndexOf('=');
                if (separatorIndex > 0)
                {
                    var key = entry.Substring(0, separatorIndex);
                    var value = entry.Substring(separatorIndex + 1);
                    entries[key] = value;
                }

                current = IntPtr.Add(current, (entry.Length + 1) * 2);
            }

            if (!string.IsNullOrWhiteSpace(machineJwt))
            {
                entries["AVINTRA_MACHINE_JWT"] = machineJwt;
            }

            entries["AVINTRA_INTERACTIVE_USERNAME"] = interactiveUsername;
            entries["USERNAME"] = interactiveUsername;

            var sb = new System.Text.StringBuilder();
            foreach (var kvp in entries)
            {
                sb.Append(kvp.Key);
                sb.Append('=');
                sb.Append(kvp.Value);
                sb.Append('\0');
            }
            sb.Append('\0');

            return Marshal.StringToHGlobalUni(sb.ToString());
        }
        finally
        {
            DestroyEnvironmentBlock(envBlock);
        }
    }

    private static string Quote(string value)
    {
        var escaped = value.Replace("\"", "\\\"");
        return $"\"{escaped}\"";
    }

    private static string CultureInvariant(FormattableString formattable) => formattable.ToString(CultureInfo.InvariantCulture);
}
