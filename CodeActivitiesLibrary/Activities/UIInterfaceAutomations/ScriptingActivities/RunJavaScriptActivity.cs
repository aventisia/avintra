using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run JavaScript")]
    [Description("Executes some custom JavaScript code and retrieves its output into a variable.")]
    public class RunJavaScriptActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("JavaScript Code")]
        [Description("The JavaScript code to execute.")]
        public InArgument<string> ScriptCode { get; set; }

        [DisplayName("Script Output")]
        [Description("Returns the output of the script.")]
        public OutArgument<string> ScriptOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string scriptCode = ScriptCode.Get(context);
            string output = string.Empty;

            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(scriptCode))
                {
                    throw new ArgumentException("JavaScript code cannot be null or empty.");
                }

                // Set up process to run cscript.exe with inline JavaScript
                using (Process process = new Process())
                {
                    process.StartInfo.FileName = "cscript.exe";
                    process.StartInfo.Arguments = $"/nologo /E:jscript - \"{scriptCode.Replace("\"", "\"\"")}\"";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.CreateNoWindow = true;

                    // Start the process
                    process.Start();

                    // Read output and error streams
                    output = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();

                    // Wait for exit
                    process.WaitForExit();

                    // If there's an error, throw it
                    if (!string.IsNullOrEmpty(error))
                    {
                        throw new Exception($"JavaScript error: {error}");
                    }

                    // Trim and clean the output
                    output = output.Trim();
                }

                // Set output and success status
                ScriptOutput.Set(context, output);
                StatusMessage.Set(context, "JavaScript executed successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error executing JavaScript: {ex.Message}");
            }
        }
    }
}