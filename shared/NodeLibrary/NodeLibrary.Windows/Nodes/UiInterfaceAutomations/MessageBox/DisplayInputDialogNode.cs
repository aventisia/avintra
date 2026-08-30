using NodeLibrary.MessageBoxNodes.Enums;

namespace NodeLibrary.MessageBoxNodes;

[DisplayName("Display Input Dialog"), Description("Displays a dialog box that prompts the user to enter text.")]
[NodeMetadata(icon: "/assets/MessageBox.svg")]
public class DisplayInputDialogNode : BaseNode
{
    [DisplayName("Input Dialog Title"), Description("The title text displayed at the top of the input dialog.")]
    public InArgument<string> InputDialogTitle { get; set; } = new InArgument<string>();

    [DisplayName("Input Dialog Message"), Description("The main text content of the input dialog.")]
    public InArgument<string> InputDialogMessage { get; set; } = new InArgument<string>();

    [DisplayName("Default Value"), Description("The default text pre-filled in the input field.")]
    public InArgument<string> DefaultValue { get; set; } = new InArgument<string>();

    [DisplayName("Input Type"), Description("The type of input field (Text or Password).")]
    public InArgument<InputTypeEnum> InputType { get; set; } = new InArgument<InputTypeEnum>();

    [DisplayName("Keep Input Dialog Always on Top"), Description("If true, the input dialog will stay on top of other windows.")]
    public InArgument<bool> KeepOnTop { get; set; } = new InArgument<bool>(false);

    [DisplayName("User Input"), Description("The text entered by the user.")]
    public OutArgument<string> UserInput { get; set; } = new OutArgument<string>();

    [DisplayName("Button Pressed"), Description("The result indicating which button was pressed by the user.")]
    public OutArgument<DialogResultEnum> ButtonPressed { get; set; } = new OutArgument<DialogResultEnum>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var title = InputDialogTitle.Get(context);
            var message = InputDialogMessage.Get(context);
            var defaultValue = DefaultValue.Get(context);
            var inputType = InputType.Get(context);
            _ = KeepOnTop.Get(context);

            if (!MessageBoxInteractionHelpers.IsInteractivePromptAvailable())
            {
                throw new InvalidOperationException("Input dialog requires an interactive execution context.");
            }

            var resultEnum = DialogResultEnum.Cancel;
            var inputResult = string.Empty;

            Console.WriteLine(title ?? "Input Dialog");
            Console.WriteLine(message ?? "Enter value:");
            Console.WriteLine("Press Enter to submit input, or type :cancel to cancel.");

            var enteredValue = inputType == InputTypeEnum.Password
                ? MessageBoxInteractionHelpers.PromptPassword("Input:", defaultValue)
                : MessageBoxInteractionHelpers.Prompt("Input:", defaultValue);

            if (string.Equals(enteredValue, ":cancel", StringComparison.OrdinalIgnoreCase))
            {
                inputResult = string.Empty;
                resultEnum = DialogResultEnum.Cancel;
            }
            else
            {
                inputResult = enteredValue ?? string.Empty;
                resultEnum = DialogResultEnum.OK;
            }

            UserInput.Set(context, inputResult);
            ButtonPressed.Set(context, resultEnum);
            status = $"Dialog closed with: {resultEnum}";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error displaying input dialog: {ex.Message}");
        }
    }
}
