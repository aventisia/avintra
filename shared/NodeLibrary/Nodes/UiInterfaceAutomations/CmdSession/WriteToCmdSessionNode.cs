using System.Diagnostics;

namespace NodeLibrary.CmdSessionNodes;

[DisplayName("Write to CMD Session"), Description("Executes a command on an open CMD session.")]
[NodeMetadata(icon: "/assets/CMDSession.svg")]
public class WriteToCmdSessionNode : BaseNode
{
    [DisplayName("CMD Session"), Description("The process representing the open CMD session.")]
    public required InArgument<Process> CmdSession { get; set; }

    [DisplayName("Command"), Description("The command to execute in the CMD session.ex:dir >")]
    public required InArgument<string> Command { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var process = CmdSession.Get(context);
            var command = Command.Get(context);

            if (process == null || process.HasExited)
            {
                throw new InvalidOperationException("CMD session is not active.");
            }

            process.StandardInput.WriteLine(command);
            process.StandardInput.Flush();

            status = $"Command sent: {command}";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to write command: {ex.Message}");
        }
    }
}
