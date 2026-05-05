using System.Diagnostics;

namespace NodeLibrary.ScriptingNodes;

[DisplayName("Run VBScript"), Description("Executes custom VBScript code and retrieves its output.")]
[NodeMetadata(icon: "/assets/Scripting.svg", supportedPlatforms: "windows")]
public class RunVbScriptNode : BaseNode
{
    [DisplayName("VBScript Code"), Description("The VBScript code to execute.")]
    public required InArgument<string> ScriptCode { get; set; }

    [DisplayName("Script Output"), Description("Returns the output of the script.")]
    public OutArgument<string> ScriptOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var scriptCode = ScriptCode.Get(context);
        var status = "VBScript executed successfully.";
        string tempFilePath = string.Empty;

        try
        {
            if (string.IsNullOrWhiteSpace(scriptCode))
                throw new ArgumentException("VBScript code cannot be null or empty.");

            tempFilePath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".vbs");
            File.WriteAllText(tempFilePath, scriptCode, Encoding.UTF8);

            string output;
            string error;
            int exitCode;
            using (var process = new Process())
            {
                process.StartInfo.FileName = "cscript.exe";
                process.StartInfo.Arguments = $"/nologo \"{tempFilePath}\"";
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
                    throw new Exception($"VBScript exited with code {exitCode}. {error}".Trim());

                output = output.Trim();
            }

            ScriptOutput.Set(context, output);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error executing VBScript: {ex.Message}");
        }
        finally
        {
            if (!string.IsNullOrEmpty(tempFilePath) && File.Exists(tempFilePath))
            {
                try { File.Delete(tempFilePath); } catch { }
            }
        }
    }
}
