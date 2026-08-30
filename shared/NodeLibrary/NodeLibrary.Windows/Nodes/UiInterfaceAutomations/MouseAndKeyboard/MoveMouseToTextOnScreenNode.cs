namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Move Mouse to Text on Screen (OCR)"), Description("Moves the mouse over text found on the screen using OCR.")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class MoveMouseToTextOnScreenNode : BaseNode
{
    protected override void Execute(INodeContext context)
    {
        IsSuccess.Set(context, false);
        StatusMessage.Set(context, "Move Mouse to Text on Screen is not implemented yet.");
    }
}
