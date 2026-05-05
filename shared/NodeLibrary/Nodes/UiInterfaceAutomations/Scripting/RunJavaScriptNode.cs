using System.Diagnostics;

namespace NodeLibrary.ScriptingNodes;

[DisplayName("Run JavaScript"), Description("Executes some custom JavaScript code and retrieves its output into a variable.")]
[NodeMetadata(icon: "/assets/Scripting.svg")]
public class RunJavaScriptNode : BaseNode
{
    [DisplayName("JavaScript Code"), Description("The JavaScript code to execute.")]
    public required InArgument<string> ScriptCode { get; set; }

    [DisplayName("Script Output"), Description("Returns the output of the script.")]
    public OutArgument<string> ScriptOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var scriptCode = ScriptCode.Get(context);
        var status = "JavaScript executed successfully.";

        try
        {
            if (string.IsNullOrWhiteSpace(scriptCode))
                throw new ArgumentException("JavaScript code cannot be null or empty.");

            if (scriptCode.TrimStart().StartsWith("{") && scriptCode.Contains("JavaScript Code"))
                throw new FormatException("Input appears to be wrapped in JSON. Please provide raw JavaScript code only.");

            string tempJsFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".js");
            File.WriteAllText(tempJsFile, scriptCode, Encoding.UTF8);

            string output;
            string error;
            int exitCode;
            using (var process = new Process())
            {
                process.StartInfo.FileName = "cscript.exe";
                process.StartInfo.Arguments = $"/nologo \"{tempJsFile}\"";
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;
                process.StartInfo.CreateNoWindow = true;
                process.StartInfo.StandardOutputEncoding = Encoding.UTF8;
                process.StartInfo.StandardErrorEncoding = Encoding.UTF8;

                process.Start();
                output = process.StandardOutput.ReadToEnd();
                error = process.StandardError.ReadToEnd();
                process.WaitForExit();
                exitCode = process.ExitCode;

                if (exitCode != 0)
                    throw new Exception($"JavaScript exited with code {exitCode}. {error}".Trim());

                output = output.Trim();
            }

            if (File.Exists(tempJsFile)) File.Delete(tempJsFile);

            ScriptOutput.Set(context, output);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error executing JavaScript: {ex.Message}");
        }
    }
}
