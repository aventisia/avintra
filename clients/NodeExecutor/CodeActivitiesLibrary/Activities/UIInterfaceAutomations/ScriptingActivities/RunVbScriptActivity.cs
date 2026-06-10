using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.ScriptingActivities.Helpers;
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
        [FieldType(FieldType.CodeEditor)]
        public InArgument<string> ScriptCode_vb { get; set; }

        [DisplayName("Script Output")]
        [Description("Returns the output of the script.")]
        public OutArgument<string> ScriptOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string source = ScriptCode_vb.Get(context);
            string output = string.Empty;
            string resolvedFilePath = string.Empty;
            bool isTemporary = false;

            try
            {
                if (string.IsNullOrWhiteSpace(source))
                    throw new ArgumentException("VBScript code cannot be null or empty.");

                // Resolve local file, http/https URL, data: URI or inline script into a file path
                resolvedFilePath = ScriptSourceResolverHelper.Resolve(source, ".vbs", out isTemporary);

                // Run the script using cscript
                using (Process process = new Process())
                {
                    process.StartInfo.FileName = "cscript.exe";
                    process.StartInfo.Arguments = $"/nologo \"{resolvedFilePath}\"";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.CreateNoWindow = true;

                    process.Start();

                    output = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();

                    process.WaitForExit();

                    if (!string.IsNullOrWhiteSpace(error))
                        throw new Exception(error.Trim());

                    output = output.Trim();
                }

                ScriptOutput.Set(context, output);
                // Improved status message: concise success confirmation
                StatusMessage.Set(context, "VBScript executed successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                // Provide the error message both in ScriptOutput and StatusMessage for clarity
                var msg = ex.Message ?? "Unknown error";
                ScriptOutput.Set(context, $"Error: {msg}");
                StatusMessage.Set(context, $"VBScript execution failed: {msg}");
                IsSuccess.Set(context, false);
            }
            finally
            {
                // Clean up temp script file only if resolver created one
                if (isTemporary && !string.IsNullOrEmpty(resolvedFilePath) && File.Exists(resolvedFilePath))
                {
                    try { File.Delete(resolvedFilePath); } catch { }
                }
            }
        }
    }
}