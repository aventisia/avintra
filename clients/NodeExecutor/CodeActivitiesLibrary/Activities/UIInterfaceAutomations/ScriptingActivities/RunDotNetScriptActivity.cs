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
    [ActivityMetaData(nodeImg: "/assets/Scripting.svg")]
    public class RunDotNetScriptActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName(".NET Script Code")]
        [Description("The .NET script code to execute. Can be inline code, a file path, a URL, or a Base64 data URI..")]
        public InArgument<string> ScriptCode { get; set; }

        [DisplayName("Script Output")]
        [Description("Returns the output of the script.")]
        public OutArgument<string> ScriptOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var source = ScriptCode.Get(context);
            string output = string.Empty;
            string resolvedFilePath = null;
            bool isTemporary = false;

            try
            {
                if (string.IsNullOrWhiteSpace(source))
                {
                    throw new ArgumentException(".NET Script code cannot be null or empty.");
                }

                // Resolve local file, http/https URL, data: URI or inline script into a file path (.csx)
                resolvedFilePath = ScriptSourceResolverHelper.Resolve(source, ".csx", out isTemporary);

                // Read the code from file (resolver always returns a file path)
                var code = File.ReadAllText(resolvedFilePath);

                // Configure script options
                var options = ScriptOptions.Default
                        .AddReferences(typeof(object).Assembly, typeof(Console).Assembly)
                        .AddImports("System");

                // Redirect console output
                var stringWriter = new StringWriter();
                var originalOut = Console.Out;
                Console.SetOut(stringWriter);

                try
                {
                    var result = CSharpScript.RunAsync(code, options).Result;

                    output = stringWriter.ToString();

                    if (result.ReturnValue != null)
                    {
                        output += result.ReturnValue.ToString();
                    }
                }
                finally
                {
                    Console.SetOut(originalOut);
                }

                ScriptOutput.Set(context, output);
                StatusMessage.Set(context, "Script executed successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);

                // Provide a concise, actionable status message and set ScriptOutput with the error
                var msg = ex.InnerException?.Message ?? ex.Message ?? "Unknown error";
                ScriptOutput.Set(context, $"Error: {msg}");
                StatusMessage.Set(context, $".NET script execution failed: {msg}");
            }
            finally
            {
                // Clean up temp script file only if resolver created it
                if (isTemporary && !string.IsNullOrEmpty(resolvedFilePath) && File.Exists(resolvedFilePath))
                {
                    try { File.Delete(resolvedFilePath); } catch { }
                }
            }
        }
    }
}