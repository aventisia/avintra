using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run Python Script")]
    [Description("Executes some custom Python script and retrieves its output into a variable.")]
    [ActivityMetaData(nodeImg: "/assets/Scripting.svg")]
    public class RunPythonScriptActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Python Script Code")]
        [Description("The Python script source. Can be inline code, a file path, a URL, or a Base64 data URI.")]
        public InArgument<string> ScriptCode { get; set; }

        [DisplayName("Script Output")]
        [Description("Returns the output of the script.")]
        public OutArgument<string> ScriptOutput { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            string resolvedFilePath = null;
            bool isTemporaryFile = false;

            try
            {
                var source = ScriptCode.Get(context)?.Trim();

                if (string.IsNullOrWhiteSpace(source))
                    throw new ArgumentException("Source cannot be empty.");

                resolvedFilePath = ScriptSourceResolverHelper.Resolve(source, ".py", out isTemporaryFile);

                var (output, error, exitCode) = ExecutePythonFile(resolvedFilePath);

                ScriptOutput.Set(context, string.IsNullOrWhiteSpace(error) ? output : error);

                IsSuccess.Set(context, exitCode == 0);

                // Set minimal status message: only "Success" or "Error"
                StatusMessage.Set(
                    context,
                    exitCode == 0
                        ? "Success"
                        : "Error");
            }
            catch (Exception ex)
            {
                ScriptOutput.Set(context, ex.ToString());
                // Set minimal status message on exception
                StatusMessage.Set(context, "Error");
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

        // Executes the Python file and captures output, error, and exit code.
        private (string output, string error, int exitCode) ExecutePythonFile(string filePath)
        {
            using (var process = new Process())
            {
                process.StartInfo.FileName = "python";
                process.StartInfo.Arguments = $"\"{filePath}\"";
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.CreateNoWindow = true;
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;

                process.Start();

                var output = process.StandardOutput.ReadToEnd();
                var error = process.StandardError.ReadToEnd();

                process.WaitForExit();

                return (output, error, process.ExitCode);
            }
        }
    }
}