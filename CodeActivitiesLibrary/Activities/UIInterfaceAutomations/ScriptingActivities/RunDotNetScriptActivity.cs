using CodeActivitiesLibrary.Extensions;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Threading.Tasks;

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
            string output = string.Empty;

            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(scriptCode))
                {
                    throw new ArgumentException(".NET Script code cannot be null or empty.");
                }

                // Configure script options
                var options = ScriptOptions.Default
                    .AddReferences(typeof(object).Assembly, typeof(Console).Assembly)
                    .AddImports("System")
                    .WithGlobalObjects(new { Console });

                // Create and run the script
                var result = CSharpScript.RunAsync(scriptCode, options).Result;

                // Capture the output from Console.WriteLine
                output = result.ToString();

                // Set the output and success status
                ScriptOutput.Set(context, output);
                StatusMessage.Set(context, "Script executed successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error executing .NET script: {ex.InnerException?.Message ?? ex.Message}");
            }
        }
    }
}