namespace RunnerApp;

/// <summary>
/// Best-effort debug logger that writes to both the console and a local log file so that
/// runs launched from the Tauri desktop app (which does not capture stdout) still leave a
/// debuggable trace.
///
/// When running as a Windows service the service account profile is not accessible to end
/// users, so logs are written under %PROGRAMDATA%\Avintra\Runner\logs (writable by
/// LocalSystem and visible to admins).
///
/// Logging layout:
/// - Service logs: %PROGRAMDATA%\Avintra\Runner\logs\runner-debug-yyyy-MM-dd.log
///   A new file is created each calendar day so no single file grows unbounded.
/// - Worker logs: %PROGRAMDATA%\Avintra\Runner\logs\jobs\{jobId}\runner-debug.log
///   Each job execution gets its own log file. Only the most recent 100 job log folders are
///   retained; older folders are deleted automatically when a new worker session starts.
/// </summary>
public static class DebugLog
{
    private static readonly string BaseLogDir =
        Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "Avintra",
            "Runner",
            "logs");

    private static string ServiceLogFilePath =>
        Path.Combine(BaseLogDir, $"runner-debug-{DateTimeOffset.Now:yyyy-MM-dd}.log");

    private static readonly object Gate = new();

    /// <summary>
    /// The current service log file path. Changes each calendar day.
    /// </summary>
    public static string CurrentLogFilePath => ServiceLogFilePath;

    public static void Info(string message) => Write(ServiceLogFilePath, "INFO", message);

    public static void Warn(string message) => Write(ServiceLogFilePath, "WARN", message);

    public static void Error(string message, Exception? ex = null)
    {
        Write(ServiceLogFilePath, "ERROR", ex is null ? message : $"{message}\n{ex}");
    }

    /// <summary>
    /// Starts a new per-execution log session for a worker job. Creates a dedicated log file
    /// under %PROGRAMDATA%\Avintra\Runner\logs\jobs\{jobId} and prunes older job log folders
    /// so only the most recent 100 remain.
    /// </summary>
    public static Session StartJobSession(Guid jobId)
    {
        var jobDir = Path.Combine(BaseLogDir, "jobs", jobId.ToString("D"));
        var logPath = Path.Combine(jobDir, "runner-debug.log");

        PruneOldJobSessions();

        Directory.CreateDirectory(jobDir);
        return new Session(logPath);
    }

    /// <summary>
    /// Keeps only the most recent 100 job log folders. Called before creating a new session.
    /// </summary>
    private static void PruneOldJobSessions()
    {
        try
        {
            var jobsDir = Path.Combine(BaseLogDir, "jobs");
            if (!Directory.Exists(jobsDir))
                return;

            var dirs = new DirectoryInfo(jobsDir)
                .GetDirectories()
                .OrderByDescending(d => d.LastWriteTimeUtc)
                .Skip(100)
                .ToList();

            foreach (var dir in dirs)
            {
                try { dir.Delete(recursive: true); }
                catch { /* best effort */ }
            }
        }
        catch
        {
            // Best-effort cleanup; never block execution.
        }
    }

    /// <summary>
    /// A log session targeting a specific file. Useful for per-job worker logs while the
    /// static methods continue to write to the shared service log.
    /// </summary>
    public sealed class Session : IDisposable
    {
        private readonly string _filePath;
        private readonly object _gate = new();

        public Session(string filePath)
        {
            _filePath = filePath;
        }

        public string FilePath => _filePath;

        public void Info(string message) => Write(_filePath, "INFO", message);

        public void Warn(string message) => Write(_filePath, "WARN", message);

        public void Error(string message, Exception? ex = null)
        {
            Write(_filePath, "ERROR", ex is null ? message : $"{message}\n{ex}");
        }

        public void Dispose()
        {
            // Flush is synchronous because Write already appends to disk.
        }
    }

    private static void Write(string filePath, string level, string message)
    {
        var line = $"[{DateTimeOffset.Now:O}] [{level}] {message}";
        try
        {
            lock (Gate)
            {
                var logDir = Path.GetDirectoryName(filePath)!;
                Directory.CreateDirectory(logDir);
                File.AppendAllText(filePath, line + Environment.NewLine);
            }
        }
        catch
        {
            // Never let logging break execution.
        }

        Console.WriteLine(line);
    }
}
