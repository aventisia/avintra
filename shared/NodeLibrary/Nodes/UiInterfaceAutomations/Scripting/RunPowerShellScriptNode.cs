using System.Diagnostics;

namespace NodeLibrary.ScriptingNodes;

[DisplayName("Run PowerShell Script"), Description("Executes some custom PowerShell script and retrieves its output into a variable.")]
[NodeMetadata(icon: "/assets/Scripting.svg", supportedPlatforms: "windows")]
public class RunPowerShellScriptNode : BaseNode
{
    [DisplayName("PowerShell Script Code"), Description("The PowerShell script code to execute.")]
    public required InArgument<string> ScriptCode { get; set; }

    [DisplayName("Script Output"), Description("Returns the output of the script.")]
    public OutArgument<string> ScriptOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var scriptCode = ScriptCode.Get(context);
        var status = "PowerShell script executed successfully.";
        string tempFilePath = string.Empty;

        try
        {
            if (string.IsNullOrWhiteSpace(scriptCode))
                throw new ArgumentException("PowerShell script code cannot be null or empty.");

            tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.ps1");
            File.WriteAllText(tempFilePath, scriptCode, Encoding.UTF8);

            string output;
            string error;
            int exitCode;
            using (var process = new Process())
            {
                process.StartInfo.FileName = ResolvePowerShellExecutable();
                process.StartInfo.ArgumentList.Add("-NoProfile");
                process.StartInfo.ArgumentList.Add("-NonInteractive");
                process.StartInfo.ArgumentList.Add("-ExecutionPolicy");
                process.StartInfo.ArgumentList.Add("Bypass");
                process.StartInfo.ArgumentList.Add("-File");
                process.StartInfo.ArgumentList.Add(tempFilePath);
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.CreateNoWindow = true;
                process.StartInfo.StandardOutputEncoding = Encoding.UTF8;
                process.StartInfo.StandardErrorEncoding = Encoding.UTF8;

                process.Start();
                output = process.StandardOutput.ReadToEnd();
                error = process.StandardError.ReadToEnd();
                process.WaitForExit();
                exitCode = process.ExitCode;
            }

            if (exitCode != 0)
                throw new InvalidOperationException($"PowerShell exited with code {exitCode}. {error}".Trim());

            ScriptOutput.Set(context, output);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error executing PowerShell script: {ex.Message}");
        }
        finally
        {
            if (!string.IsNullOrEmpty(tempFilePath) && File.Exists(tempFilePath))
            {
                try { File.Delete(tempFilePath); } catch { }
            }
        }
    }

    private static string ResolvePowerShellExecutable()
    {
        var pathValue = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
        var pathDirs = pathValue.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries);

        bool HasExecutable(string exeName) => pathDirs.Any(dir => File.Exists(Path.Combine(dir, exeName)));

        if (HasExecutable("pwsh.exe")) return "pwsh.exe";
        if (HasExecutable("powershell.exe")) return "powershell.exe";

        return "pwsh.exe";
    }
}
