using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run PowerShell Script")]
    [Description("Executes some custom PowerShell script and retrieves its output into a variable.")]
    [ActivityMetaData(
        nodeImg: "/assets/Scripting.svg", 
        supportedPlatforms: "windows")]
    public class RunPowerShellScriptActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("PowerShell Script Code")]
        [Description("The PowerShell script code to execute.")]

        public InArgument<string> ScriptCode { get; set; }

        [DisplayName("Script Output")]
        [Description("Returns the output of the script.")]

        public OutArgument<string> ScriptOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var scriptCode = ScriptCode.Get(context);
            var output = "";

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
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error executing PowerShell script: {ex.Message}");
                IsSuccess.Set(context, false);

            }
        }
    }
}