using NodeLibrary.MessageBoxNodes.Enums;

namespace NodeLibrary.MessageBoxNodes;

[DisplayName("Display Message"), Description("Displays a message box")]
[NodeMetadata(icon: "/assets/MessageBox.svg")]
public class DisplayMessageNode : BaseNode
{
    [DisplayName("Message Box Title"), Description("The title text displayed at the top of the message box.")]
    public InArgument<string> Title { get; set; } = new InArgument<string>();

    [DisplayName("Message to Display"), Description("The main content of the message box.")]
    public InArgument<string> Message { get; set; } = new InArgument<string>();

    [DisplayName("Message Box Icon"), Description("The icon to be displayed in the message box.")]
    public InArgument<MessageBoxIconEnum> Icon { get; set; } = new InArgument<MessageBoxIconEnum>();

    [DisplayName("Message Box Buttons"), Description("The buttons to display in the message box.")]
    public InArgument<MessageBoxButtonsEnum> Buttons { get; set; } = new InArgument<MessageBoxButtonsEnum>();

    [DisplayName("Default Button"), Description("The button that is highlighted by default.")]
    public InArgument<DefaultButtonEnum> DefaultButton { get; set; } = new InArgument<DefaultButtonEnum>();

    [DisplayName("Keep Message Box Always on Top"), Description("If true, the message box will stay on top of other windows.")]
    public InArgument<bool> KeepOnTop { get; set; } = new InArgument<bool>(false);

    [DisplayName("Close Message Box Automatically"), Description("If true, the message box will close automatically after the specified timeout.")]
    public InArgument<bool> AutoClose { get; set; } = new InArgument<bool>(false);

    [DisplayName("Timeout (Seconds)"), Description("The number of seconds after which the message box closes automatically if 'Close Message Box Automatically' is enabled.")]
    [RenderIfCondition(nameof(AutoClose), true)]
    public InArgument<int> Timeout { get; set; } = new InArgument<int>(0);

    [DisplayName("Button Pressed"), Description("The result indicating which button was pressed by the user.")]
    public OutArgument<DialogResultEnum> ButtonPressed { get; set; } = new OutArgument<DialogResultEnum>();

    protected override void Execute(INodeContext context)
    {
        var status = "Message box displayed successfully.";

        try
        {
            var title = Title.Get(context) ?? "Message";
            var messageText = Message.Get(context) ?? string.Empty;
            var iconEnum = Icon.Get(context);
            var buttonEnum = Buttons.Get(context);
            var defaultEnum = DefaultButton.Get(context);
            var keepOnTop = KeepOnTop.Get(context);
            var autoClose = AutoClose.Get(context);
            var timeout = Timeout.Get(context);

            var shown = MessageBoxInteractionHelpers.TryShowNativeMessage(
                title,
                messageText,
                buttonEnum,
                iconEnum,
                defaultEnum,
                keepOnTop,
                out var result);

            if (!shown)
            {
                if (!MessageBoxInteractionHelpers.IsInteractivePromptAvailable())
                {
                    throw new InvalidOperationException("Interactive message dialogs are not available in the current execution context.");
                }

                Console.WriteLine($"[{title}] {messageText}");
                Console.WriteLine("Press Enter to continue...");
                Console.ReadLine();
                result = DialogResultEnum.OK;
            }

            ButtonPressed.Set(context, result);
            status = autoClose && timeout > 0
                ? $"Message box closed with result: {result}. AutoClose ({timeout}s) is not supported in .NET 8 native mode."
                : $"Message box closed with result: {result}";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error showing message box: {ex.Message}");
        }
    }
}
