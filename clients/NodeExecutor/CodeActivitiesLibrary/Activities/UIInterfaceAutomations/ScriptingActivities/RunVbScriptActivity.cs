using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run VBScript")]
    [Description("Executes custom VBScript code and retrieves its output.")]
    [ActivityMetaData(
        nodeImg: "/assets/Scripting.svg", 
        supportedPlatforms: "windows")]
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
            string tempFilePath = string.Empty;

            try
            {
                if (string.IsNullOrWhiteSpace(scriptCode))
                    throw new ArgumentException("VBScript code cannot be null or empty.");

                // 1. Write the script to a temporary file
                tempFilePath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".vbs");
                File.WriteAllText(tempFilePath, scriptCode);

                // 2. Run the script using cscript
                using (Process process = new Process())
                {
                    process.StartInfo.FileName = "cscript.exe";
                    process.StartInfo.Arguments = $"/nologo \"{tempFilePath}\"";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.CreateNoWindow = true;

                    // Start the process
                    process.Start();

                    // Read the output and error streams
                    output = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();

                    // Wait for exit
                    process.WaitForExit();

                    // If there's an error, throw it
                    if (!string.IsNullOrWhiteSpace(error))
                        throw new Exception($"VBScript error: {error}");

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
                ScriptOutput.Set(context, $"Error: {ex.Message}");
                StatusMessage.Set(context, "Failed to execute VBScript.");
                IsSuccess.Set(context, false);
            }
            finally
            {
                // Clean up temp script file
                if (!string.IsNullOrEmpty(tempFilePath) && File.Exists(tempFilePath))
                {
                    try { File.Delete(tempFilePath); } catch { }
                }
            }
        }
    }
}