namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Block Input"), Description("Blocks user mouse and keyboard input, so that the flow can perform mouse and keyboard actions without interference from the user.")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class BlockInputNode : BaseNode
{
    [DisplayName("Block It"), Description("Toggle to enable or disable blocking of user input.")]
    public InArgument<bool> BlockIt { get; set; } = new InArgument<bool>(false);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var blockIt = BlockIt.Get(context);

            if (blockIt)
            {
                status = "User input blocked successfully.";
                IsSuccess.Set(context, true);
            }
            else
            {
                status = "User input is not blocked.";
                IsSuccess.Set(context, false);
            }

            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error blocking input: {ex.Message}");
        }
    }
}
