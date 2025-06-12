using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.ScriptingActivities
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
            var scriptCode = ScriptCode.Get(context);
            var output = "";
            var status = "";

            try
            {
                using (var process = new Process())
                {
                    process.StartInfo.FileName = "cscript.exe";
                    process.StartInfo.Arguments = $"/nologo /E:jscript \"\" echo {scriptCode} \"\"";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;

                    process.Start();
                    output = process.StandardOutput.ReadToEnd();
                    process.WaitForExit();
                }

                ScriptOutput.Set(context, output);
                StatusMessage.Set(context, "JavaScript executed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error executing JavaScript: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}