using NodeLibrary.CmdSessionNodes.Helpers;
using System.Diagnostics;

namespace NodeLibrary.CmdSessionNodes;

[DisplayName("Wait for Text on CMD Session"), Description("Waits for a specific text on a previously opened CMD session.")]
[NodeMetadata(icon: "/assets/CMDSession.svg")]
public class WaitForTextOnCmdSessionNode : BaseNode
{
    [DisplayName("CMD Session"), Description("The process representing the open CMD session.")]
    public required InArgument<Process> CmdSession { get; set; }

    [DisplayName("Text to Wait For"), Description("The text or regular expression to wait for in the CMD session output.")]
    public required InArgument<string> TextToWaitFor { get; set; }

    [DisplayName("Timeout (ms)"), Description("Maximum time to wait in milliseconds. Default: 5000.")]
    public InArgument<int> TimeoutMs { get; set; } = new InArgument<int>(5000);

    [DisplayName("Found"), Description("Test the result, wait for text is true or false")]
    public OutArgument<bool> Found { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var process = CmdSession.Get(context);
            var searchText = TextToWaitFor.Get(context);
            var timeout = TimeoutMs.Get(context);

            if (process == null || process.HasExited)
            {
                throw new InvalidOperationException("CMD session is not active.");
            }

            if (string.IsNullOrEmpty(searchText))
            {
                throw new ArgumentException("Search text cannot be null or empty.");
            }

            var found = false;
            var startTime = DateTime.UtcNow;
            var buffer = CmdSessionStateHelper.GetBuffer(process);

            while ((DateTime.UtcNow - startTime).TotalMilliseconds < timeout)
            {
                string currentOutput;
                lock (buffer)
                {
                    currentOutput = buffer.ToString();
                }

                if (currentOutput.Contains(searchText))
                {
                    found = true;
                    break;
                }

                Thread.Sleep(100);
            }

            Found.Set(context, found);
            status = found
                ? $"Text '{searchText}' found."
                : $"Timeout ({timeout}ms): Text not found.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error waiting for text: {ex.Message}");
        }
    }
}
