namespace RunnerApp;

/// <summary>
/// Best-effort debug logger that writes to both the console and a local log file so that
/// runs launched from the Tauri desktop app (which does not capture stdout) still leave a
/// debuggable trace. Log file lives under %LOCALAPPDATA%\AvintraDesktopApp\logs\.
/// </summary>
public static class DebugLog
{
    private static readonly string LogFilePath =
        Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "AvintraDesktopApp",
            "logs",
            "runner-debug.log");

    private static readonly object Gate = new();

    public static void Info(string message) => Write("INFO", message);

    public static void Warn(string message) => Write("WARN", message);

    public static void Error(string message, Exception? ex = null)
    {
        Write("ERROR", ex is null ? message : $"{message}\n{ex}");
    }

    private static void Write(string level, string message)
    {
        var line = $"[{DateTimeOffset.Now:O}] [{level}] {message}";
        try
        {
            lock (Gate)
            {
                Directory.CreateDirectory(Path.GetDirectoryName(LogFilePath)!);
                File.AppendAllText(LogFilePath, line + Environment.NewLine);
            }
        }
        catch
        {
            // Never let logging break execution.
        }

        Console.WriteLine(line);
    }
}
