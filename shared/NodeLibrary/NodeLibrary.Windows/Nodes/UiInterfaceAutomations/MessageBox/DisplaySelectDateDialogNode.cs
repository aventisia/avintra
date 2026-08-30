using NodeLibrary.MessageBoxNodes.Enums;

namespace NodeLibrary.MessageBoxNodes;

[DisplayName("Display Select Date Dialog"), Description("Displays a dialog box that prompts the user to enter a date or date range.")]
[NodeMetadata(icon: "/assets/MessageBox.svg")]
public class DisplaySelectDateDialogNode : BaseNode
{
    [DisplayName("Dialog Title"), Description("The title text displayed at the top of the date dialog.")]
    public InArgument<string> DialogTitle { get; set; } = new InArgument<string>();

    [DisplayName("Dialog Message"), Description("The message displayed in the date dialog.")]
    public InArgument<string> DialogMessage { get; set; } = new InArgument<string>();

    [DisplayName("Dialog Type"), Description("Specifies whether the dialog prompts for a single date or a date range.")]
    public InArgument<DialogTypeEnum> DialogType { get; set; } = new InArgument<DialogTypeEnum>();

    [DisplayName("Prompt For"), Description("Specifies whether to prompt for date only or date and time.")]
    public InArgument<PromptForEnum> PromptFor { get; set; } = new InArgument<PromptForEnum>();

    [DisplayName("Default Value"), Description("The default date value displayed.")]
    public InArgument<string> DefaultValue { get; set; } = new InArgument<string>();

    [DisplayName("Keep Date Selection Dialog Always On Top"), Description("If true, the dialog stays on top of other windows.")]
    public InArgument<bool> KeepOnTop { get; set; } = new InArgument<bool>(false);

    [DisplayName("Selected Date"), Description("The date or date range selected by the user.")]
    public OutArgument<string> SelectedDate { get; set; } = new OutArgument<string>();

    [DisplayName("Button Pressed"), Description("Indicates whether the OK or Cancel button was pressed.")]
    public OutArgument<bool> ButtonPressed { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var title = DialogTitle.Get(context);
            var message = DialogMessage.Get(context);
            var defaultValue = DefaultValue.Get(context);
            var dialogType = DialogType.Get(context);
            var promptFor = PromptFor.Get(context);
            _ = KeepOnTop.Get(context);

            if (!MessageBoxInteractionHelpers.IsInteractivePromptAvailable())
            {
                throw new InvalidOperationException("Date selection requires an interactive execution context.");
            }

            var resultDate = "";

            Console.WriteLine(title ?? "Select Date");
            Console.WriteLine(message ?? "Enter date value.");

            var format = promptFor == PromptForEnum.DateOnly ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm";
            string promptText = dialogType == DialogTypeEnum.DateRange
                ? $"Enter date range as '{format} to {format}', or :cancel"
                : $"Enter date as '{format}', or :cancel";

            var fallbackDefault = promptFor == PromptForEnum.DateOnly
                ? DateTime.Now.ToString("yyyy-MM-dd")
                : DateTime.Now.ToString("yyyy-MM-dd HH:mm");

            var valueToUse = string.IsNullOrWhiteSpace(defaultValue) ? fallbackDefault : defaultValue;
            Console.WriteLine(promptText);
            var entered = MessageBoxInteractionHelpers.Prompt("Value:", valueToUse);

            if (string.Equals(entered, ":cancel", StringComparison.OrdinalIgnoreCase))
            {
                ButtonPressed.Set(context, false);
                SelectedDate.Set(context, string.Empty);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Dialog was cancelled.");
                return;
            }

            if (dialogType == DialogTypeEnum.DateRange)
            {
                resultDate = NormalizeDateRange(entered ?? valueToUse, promptFor);
            }
            else
            {
                var parsed = DateTime.Parse(entered ?? valueToUse, CultureInfo.InvariantCulture);
                resultDate = parsed.ToString(format, CultureInfo.InvariantCulture);
            }

            ButtonPressed.Set(context, true);
            SelectedDate.Set(context, resultDate);
            status = "Date selected successfully.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error displaying date dialog: {ex.Message}");
        }
    }

    private static string NormalizeDateRange(string input, PromptForEnum promptFor)
    {
        var format = promptFor == PromptForEnum.DateOnly ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm";

        var parts = input.Split([" to ", "|", ",", ";"], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length < 2)
        {
            var single = DateTime.Parse(input, CultureInfo.InvariantCulture).ToString(format, CultureInfo.InvariantCulture);
            return $"{single} to {single}";
        }

        var start = DateTime.Parse(parts[0], CultureInfo.InvariantCulture).ToString(format, CultureInfo.InvariantCulture);
        var end = DateTime.Parse(parts[1], CultureInfo.InvariantCulture).ToString(format, CultureInfo.InvariantCulture);
        return $"{start} to {end}";
    }
}
