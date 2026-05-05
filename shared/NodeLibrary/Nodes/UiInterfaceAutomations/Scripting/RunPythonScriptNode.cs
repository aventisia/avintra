using System.Diagnostics;

namespace NodeLibrary.ScriptingNodes;

[DisplayName("Run Python Script"), Description("Executes some custom Python script and retrieves its output into a variable.")]
[NodeMetadata(icon: "/assets/Scripting.svg")]
public class RunPythonScriptNode : BaseNode
{
    [DisplayName("Python Script Code"), Description("The Python script code to execute.")]
    public required InArgument<string> ScriptCode { get; set; }

    [DisplayName("Script Output"), Description("Returns the output of the script.")]
    public OutArgument<string> ScriptOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var scriptCode = ScriptCode.Get(context);
        var status = "Python script executed successfully.";
        string tempFilePath = string.Empty;

        try
        {
            if (string.IsNullOrWhiteSpace(scriptCode))
                throw new ArgumentException("Python script code cannot be null or empty.");

            tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.py");
            File.WriteAllText(tempFilePath, scriptCode, Encoding.UTF8);

            string output;
            string error;
            int exitCode;
            using (var process = new Process())
            {
                var (pythonExecutable, pythonArgsPrefix) = ResolvePythonExecutable();
                process.StartInfo.FileName = pythonExecutable;

                foreach (var arg in pythonArgsPrefix)
                {
                    process.StartInfo.ArgumentList.Add(arg);
                }

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
                throw new InvalidOperationException($"Python exited with code {exitCode}. {error}".Trim());

            ScriptOutput.Set(context, output);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error executing Python script: {ex.Message}");
        }
        finally
        {
            if (!string.IsNullOrEmpty(tempFilePath) && File.Exists(tempFilePath))
            {
                try { File.Delete(tempFilePath); } catch { }
            }
        }
    }

    private static (string executable, string[] argsPrefix) ResolvePythonExecutable()
    {
        var pathValue = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
        var pathDirs = pathValue.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries);

        bool HasExecutable(string exeName) => pathDirs.Any(dir => File.Exists(Path.Combine(dir, exeName)));

        if (HasExecutable("python.exe")) return ("python.exe", []);
        if (HasExecutable("python3.exe")) return ("python3.exe", []);
        if (HasExecutable("py.exe")) return ("py.exe", ["-3"]);

        return ("python.exe", []);
    }
}
