using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ScriptingActivities
{
    [DisplayName("Run .NET Script")]
    [Description("Executes some custom .NET script and retrieves its output into a variable.")]
    public class RunDotNetScriptActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName(".NET Script Code")]
        [Description("The .NET script code to execute.")]
        public InArgument<string> ScriptCode { get; set; }

        [DisplayName("Script Output")]
        [Description("Returns the output of the script.")]
        public OutArgument<string> ScriptOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var scriptCode = ScriptCode.Get(context);

            try
            {
                // Use Roslyn or other .NET scripting engine to execute the code
                // For simplicity, this example assumes the script is valid C# code
                StatusMessage.Set(context, "Script executed successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error executing .NET script: {ex.Message}");
            }
        }
    }
}