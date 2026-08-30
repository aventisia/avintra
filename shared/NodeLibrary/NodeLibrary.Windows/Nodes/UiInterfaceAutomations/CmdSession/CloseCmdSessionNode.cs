using System.Diagnostics;

namespace NodeLibrary.CmdSessionNodes;

[DisplayName("Close CMD Session"), Description("Closes a previously opened CMD session.")]
[NodeMetadata(icon: "/assets/CMDSession.svg")]
public class CloseCmdSessionNode : BaseNode
{
    [DisplayName("CMD Session"), Description("The process representing the open CMD session.")]
    public required InArgument<Process> CmdSession { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var process = CmdSession.Get(context);
            if (process == null)
            {
                status = "CMD session was already null.";
            }
            else
            {
                if (!process.HasExited)
                {
                    process.StandardInput.WriteLine("exit");
                    process.StandardInput.Flush();
                    process.WaitForExit(3000);
                    if (!process.HasExited)
                    {
                        process.Kill();
                    }
                }

                process.Dispose();
                status = "CMD session closed successfully.";
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error closing CMD session: {ex.Message}");
        }
    }
}
