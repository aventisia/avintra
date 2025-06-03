using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run VBScript")]
    [Description("Executes some custom VBScript code and retrieves its output into a variable.")]
    public class RunVbScriptActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [Description("The VBScript code to execute.")]
        public InArgument<string> ScriptCode { get; set; }


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
                    process.StartInfo.Arguments = $"/nologo /E:vbscript \"\" echo {scriptCode} \"\"";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;

                    process.Start();
                    output = process.StandardOutput.ReadToEnd();
                    process.WaitForExit();
                }

                ScriptOutput.Set(context, output);
                StatusMessage.Set(context, "VBScript executed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error executing VBScript: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}