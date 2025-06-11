using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run PowerShell Script")]
    [Description("Executes some custom PowerShell script and retrieves its output into a variable.")]
    public class RunPowerShellScriptActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The PowerShell script code to execute.")]
        [DisplayName("PowerShell Script Code")]
        public InArgument<string> ScriptCode { get; set; }

        [Description("Returns the output of the script.")]
        [DisplayName("Script Output")]
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
                    process.StartInfo.FileName = "powershell.exe";
                    process.StartInfo.Arguments = $"-Command \"{scriptCode}\"";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;

                    process.Start();
                    output = process.StandardOutput.ReadToEnd();
                    process.WaitForExit();
                }

                ScriptOutput.Set(context, output);
                StatusMessage.Set(context, "PowerShell script executed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error executing PowerShell script: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}