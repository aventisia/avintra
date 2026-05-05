using System.Runtime.InteropServices;

namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Get Keyboard Identifier"), Description("Retrieves the active keyboard identifier from the machine's registry.")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class GetKeyboardIdentifierNode : BaseNode
{
    [DisplayName("Keyboard Layout ID"), Description("The registry key of the active keyboard identifier.")]
    public OutArgument<string> KeyboardLayoutId { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var layoutName = new StringBuilder(9);
            if (!GetKeyboardLayoutName(layoutName))
                throw new InvalidOperationException("Failed to retrieve the active keyboard layout identifier.");

            var layoutId = layoutName.ToString();

            KeyboardLayoutId.Set(context, layoutId);
            status = $"Successfully retrieved keyboard layout ID: {layoutId}";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            KeyboardLayoutId.Set(context, string.Empty);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving keyboard layout ID: {ex.Message}");
        }
    }

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern bool GetKeyboardLayoutName(StringBuilder pwszKLID);
}




