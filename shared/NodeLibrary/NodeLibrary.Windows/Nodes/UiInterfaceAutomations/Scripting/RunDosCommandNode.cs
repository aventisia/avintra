using System.Diagnostics;

namespace NodeLibrary.ScriptingNodes;

[DisplayName("Run DOS Command"), Description("Runs a DOS command or console application in invisible mode and retrieves its output upon completion.")]
[NodeMetadata(icon: "/assets/Scripting.svg", supportedPlatforms: "windows")]
public class RunDosCommandNode : BaseNode
{
    [DisplayName("Command"), Description("The DOS command to execute.")]
    public required InArgument<string> Command { get; set; }

    [DisplayName("Command Output"), Description("Returns the output of the command.")]
    public OutArgument<string> CommandOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var command = Command.Get(context)?.Trim();
        var status = "Command executed successfully.";

        try
        {
            if (string.IsNullOrWhiteSpace(command))
                throw new ArgumentException("Command cannot be null or empty.");

            string output;
            string error;
            int exitCode;
            using (var process = new Process())
            {
                process.StartInfo.FileName = "cmd.exe";
                process.StartInfo.Arguments = $"/c {command}";
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
                throw new InvalidOperationException($"Command failed with exit code {exitCode}. {error}".Trim());

            CommandOutput.Set(context, output);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error executing command: {ex.Message}");
        }
    }
}
