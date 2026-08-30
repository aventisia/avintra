using NodeLibrary.CmdSessionNodes.Helpers;
using System.Diagnostics;

namespace NodeLibrary.CmdSessionNodes;

[DisplayName("Read from CMD Session"), Description("Reads the output of a CMD session.")]
[NodeMetadata(icon: "/assets/CMDSession.svg")]
public class ReadFromCmdSessionNode : BaseNode
{
    [DisplayName("CMD Session"), Description("The process representing the CMD session.")]
    public required InArgument<Process> CmdSession { get; set; }

    [DisplayName("CmdOutput"), Description("The CMD session's standard output.")]
    public OutArgument<string> CmdOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var process = CmdSession.Get(context);
            if (process == null || process.HasExited)
            {
                throw new InvalidOperationException("CMD session is not active.");
            }

            var buffer = CmdSessionStateHelper.GetBuffer(process);
            string output;
            lock (buffer)
            {
                output = buffer.ToString();
                buffer.Clear();
            }

            CmdOutput.Set(context, output);
            status = "Successfully read output from CMD session.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reading CMD session: {ex.Message}");
        }
    }
}
