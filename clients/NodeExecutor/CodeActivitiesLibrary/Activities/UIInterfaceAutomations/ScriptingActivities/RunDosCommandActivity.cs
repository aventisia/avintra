using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run DOS Command")]
    [Description(
        "Runs a DOS command or console application in invisible mode and retrieves its output upon completion.")]
    [ActivityMetaData(
        nodeImg: "/assets/Scripting.svg", 
        supportedPlatforms: "windows")]
    public class RunDosCommandActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Command")]
        [Description("The DOS command to execute.")]
        public InArgument<string> Command { get; set; }

        [DisplayName("Command Output")]
        [Description("Returns the output of the command.")]
        public OutArgument<string> CommandOutput { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var command = Command.Get(context);
            var output = "";
            var status = "";

            try
            {
                using (var process = new Process())
                {
                    process.StartInfo.FileName = "cmd.exe";
                    process.StartInfo.Arguments = $"/c {command}";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;

                    process.Start();
                    output = process.StandardOutput.ReadToEnd();
                    process.WaitForExit();
                }

                CommandOutput.Set(context, output);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Command executed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error executing command: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}