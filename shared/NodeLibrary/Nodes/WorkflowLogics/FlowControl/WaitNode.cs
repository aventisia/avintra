namespace NodeLibrary.FlowControlNodes;

[DisplayName("Wait")]
[Description("Pauses the workflow execution for a specified number of seconds.")]
[NodeMetadata(icon: "/assets/Wait.svg")]
public class WaitNode : BaseNode
{
    [DisplayName("Duration (Seconds)")]
    [Description("The number of seconds to pause workflow execution.")]
    public required InArgument<int> Seconds { get; set; }

    protected override void Execute(INodeContext context)
    {
        try
        {
            var seconds = Seconds.Get(context);
            Thread.Sleep(seconds * 1000); // Convert to milliseconds
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Waited for {seconds} seconds.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error waiting: {ex.Message}");
        }
    }
}
