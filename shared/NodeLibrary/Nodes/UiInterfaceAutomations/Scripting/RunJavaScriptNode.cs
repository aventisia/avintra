using System.Diagnostics;
using NodeLibrary.ScriptingNodes.Helpers;

namespace NodeLibrary.ScriptingNodes;

[DisplayName("Run JavaScript"), Description("Executes some custom JavaScript code and retrieves its output into a variable.")]
[NodeMetadata(icon: "/assets/Scripting.svg")]
public class RunJavaScriptNode : BaseNode
{
    [DisplayName("JavaScript Code"), Description("The JavaScript code to execute. Can be inline code, a file path, a URL, or a Base64 data URI.")]
    public required InArgument<string> ScriptCode { get; set; }

    [DisplayName("Script Output"), Description("Returns the output of the script.")]
    public OutArgument<string> ScriptOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        string? resolvedFilePath = null;
        bool isTemporaryFile = false;

        try
        {
            var source = ScriptCode.Get(context)?.Trim();

            if (string.IsNullOrWhiteSpace(source))
                throw new ArgumentException("JavaScript source cannot be empty.");

            // Keep existing JSON-wrapper guard for backwards-compatibility
            if (source.TrimStart().StartsWith("{") && source.Contains("JavaScript Code"))
            {
                throw new FormatException("Input appears to be wrapped in JSON. Please provide raw JavaScript code only.");
            }

            // Resolve local file, http/https URL, data: URI or inline script into a file path (.js)
            resolvedFilePath = ScriptSourceResolverHelper.Resolve(source, ".js", out isTemporaryFile);

            var (output, error, exitCode) = ExecuteJavaScriptFile(resolvedFilePath);

            // Normalize outputs
            output = output ?? string.Empty;
            error = error ?? string.Empty;

            ScriptOutput.Set(context, string.IsNullOrWhiteSpace(error) ? output : error);
            IsSuccess.Set(context, exitCode == 0);

            // Improved status messaging: concise success or actionable failure reason
            if (exitCode == 0)
            {
                StatusMessage.Set(context, "JavaScript executed successfully.");
            }
            else
            {
                var reason = !string.IsNullOrWhiteSpace(error) ? error.Trim() : $"Exit code {exitCode}";
                StatusMessage.Set(context, $"JavaScript execution failed: {reason}");
            }
        }
        catch (Exception ex)
        {
            var msg = ex.Message ?? "Unknown error";
            ScriptOutput.Set(context, $"Error: {msg}");
            StatusMessage.Set(context, $"JavaScript execution failed: {msg}");
            IsSuccess.Set(context, false);
        }
        finally
        {
            if (isTemporaryFile && !string.IsNullOrWhiteSpace(resolvedFilePath))
            {
                try
                {
                    if (File.Exists(resolvedFilePath))
                        File.Delete(resolvedFilePath);
                }
                catch
                {
                    // Ignore cleanup failures.
                }
            }
        }
    }

    // Executes the JavaScript file via cscript.exe and captures output, error and exit code.
    private (string output, string error, int exitCode) ExecuteJavaScriptFile(string filePath)
    {
        using (var process = new Process())
        {
            process.StartInfo.FileName = "cscript.exe";
            process.StartInfo.Arguments = $"/nologo \"{filePath}\"";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;

            process.Start();

            var output = process.StandardOutput.ReadToEnd();
            var error = process.StandardError.ReadToEnd();

            process.WaitForExit();

            return (output.Trim(), error, process.ExitCode);
        }
    }
}
