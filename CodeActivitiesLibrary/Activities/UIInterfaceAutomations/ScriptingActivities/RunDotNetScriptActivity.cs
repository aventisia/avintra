using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run .NET Script"),
     Description("Executes some custom .NET script and retrieves its output into a variable.")]
    public class RunDotNetScriptActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The .NET script code to execute.")]
        public InArgument<string> ScriptCode { get; set; }

        [Category("Output"), Description("Returns the output of the script.")]
        public OutArgument<string> ScriptOutput { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var scriptCode = ScriptCode.Get(context);
            var status = "";

            try
            {
                // Use Roslyn or other .NET scripting engine to execute the code
                // For simplicity, this example assumes the script is valid C# code
                StatusMessage.Set(context, "Script executed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error executing .NET script: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}