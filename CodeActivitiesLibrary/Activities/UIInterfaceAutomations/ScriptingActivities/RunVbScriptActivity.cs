using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run VBScript")]
    [Description("Executes some custom VBScript code and retrieves its output into a variable.")]
    public class RunVbScriptActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("VBScript Code")]
        [Description("The VBScript code to execute.")]
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
                    throw new ArgumentException("VBScript code cannot be null or empty.");
                }

                // Escape double quotes in the script code
                scriptCode = scriptCode.Replace("\"", "\"\"");

                // Set up process to run cscript.exe with inline VBScript
                using (Process process = new Process())
                {
                    process.StartInfo.FileName = "cscript.exe";
                    process.StartInfo.Arguments = $"/nologo /E:vbscript \"//\" \"{scriptCode}\"";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.CreateNoWindow = true;
                    process.StartInfo.WorkingDirectory = Environment.SystemDirectory; // Set a valid working directory

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
                        throw new Exception($"VBScript error: {error}");
                    }

                    // Trim and clean the output
                    output = output.Trim();
                }

                // Set output and success status
                ScriptOutput.Set(context, output);
                StatusMessage.Set(context, "VBScript executed successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error executing VBScript: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}