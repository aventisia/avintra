using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace NodeLibrary.ScriptingNodes;

[DisplayName("Run .NET Script"), Description("Executes some custom .NET script and retrieves its output into a variable.")]
[NodeMetadata(icon: "/assets/Scripting.svg")]
public class RunDotNetScriptNode : BaseNode
{
    private static readonly object ConsoleOutLock = new();

    [DisplayName(".NET Script Code"), Description("The .NET script code to execute.")]
    public required InArgument<string> ScriptCode { get; set; }

    [DisplayName("Script Output"), Description("Returns the output of the script.")]
    public OutArgument<string> ScriptOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var scriptCode = ScriptCode.Get(context);
        var status = "Script executed successfully.";

        try
        {
            if (string.IsNullOrWhiteSpace(scriptCode))
                throw new ArgumentException(".NET Script code cannot be null or empty.");

            var options = ScriptOptions.Default
                .AddReferences(typeof(object).Assembly, typeof(Console).Assembly)
                .AddImports("System");

            string output;
            lock (ConsoleOutLock)
            {
                var stringWriter = new StringWriter(new StringBuilder());
                var originalOut = Console.Out;
                Console.SetOut(stringWriter);

                try
                {
                    var result = CSharpScript.RunAsync(scriptCode, options).GetAwaiter().GetResult();
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
            }

            ScriptOutput.Set(context, output);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error executing .NET script: {ex.InnerException?.Message ?? ex.Message}");
        }
    }
}
