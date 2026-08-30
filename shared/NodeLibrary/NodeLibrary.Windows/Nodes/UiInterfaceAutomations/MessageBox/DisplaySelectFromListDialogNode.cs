namespace NodeLibrary.MessageBoxNodes;

[DisplayName("Display Select From List Dialog"), Description("Displays a dialog box with options that lets the user select from a list.")]
[NodeMetadata(icon: "/assets/MessageBox.svg")]
public class DisplaySelectFromListDialogNode : BaseNode
{
    [DisplayName("Dialog Title"), Description("The title text displayed at the top of the dialog window.")]
    public InArgument<string> DialogTitle { get; set; } = new InArgument<string>();

    [DisplayName("Dialog Message"), Description("The message or prompt shown inside the dialog to guide the user.")]
    public InArgument<string> DialogMessage { get; set; } = new InArgument<string>();

    [DisplayName("List to Choose From"), Description("A list of items from which the user can select one or more options.")]
    public InArgument<string> ListToChooseFrom { get; set; } = new InArgument<string>();

    [DisplayName("Keep Select Dialog Always On Top"), Description("If true, keeps the dialog window always on top of other windows.")]
    public InArgument<bool> KeepOnTop { get; set; } = new InArgument<bool>(false);

    [DisplayName("Limit to List"), Description("If true, limits user input to only the items in the provided list.")]
    public InArgument<bool> LimitToList { get; set; } = new InArgument<bool>(false);

    [DisplayName("Allow Empty Selection"), Description("If true, allows the user to make no selection (optional choice).")]
    public InArgument<bool> AllowEmptySelection { get; set; } = new InArgument<bool>(false);

    [DisplayName("Allow Multiple Selection"), Description("If true, allows the user to select multiple items from the list.")]
    public InArgument<bool> AllowMultipleSelection { get; set; } = new InArgument<bool>(false);

    [DisplayName("Preselect Items Starting With '+'"), Description("If true, preselects all items in the list that start with a '+' character.")]
    public InArgument<bool> PreselectItemsStartingWithPlus { get; set; } = new InArgument<bool>(false);

    [DisplayName("Selected Item(s)"), Description("Returns the selected item(s) from the dialog as a string. For multiple selections, items are separated by commas.")]
    public OutArgument<string> SelectedItem { get; set; } = new OutArgument<string>();

    [DisplayName("Selected Index(es)"), Description("Returns the index or indices of the selected item(s) in the list.")]
    public OutArgument<int[]> SelectedIndex { get; set; } = new OutArgument<int[]>();

    [DisplayName("Button Pressed"), Description("Returns true if the user pressed the OK button; false if Cancel or closed the dialog.")]
    public OutArgument<bool> ButtonPressed { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed.";

        try
        {
            var title = DialogTitle.Get(context) ?? "Select Item";
            var message = DialogMessage.Get(context) ?? "Please select from the list below:";
            var allowMultiSelect = AllowMultipleSelection.Get(context);
            var preselectPlus = PreselectItemsStartingWithPlus.Get(context);
            var allowEmptySelection = AllowEmptySelection.Get(context);
            var limitToList = LimitToList.Get(context);
            _ = KeepOnTop.Get(context);

            if (!MessageBoxInteractionHelpers.IsInteractivePromptAvailable())
            {
                throw new InvalidOperationException("List selection requires an interactive execution context.");
            }

            object? rawListInput = ListToChooseFrom.Get(context);

            if (rawListInput == null)
            {
                throw new ArgumentException("List to choose from cannot be null.");
            }

            var items = new List<string>();

            switch (rawListInput)
            {
                case string str when !string.IsNullOrWhiteSpace(str):
                    items = str
                        .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(i => i.Trim())
                        .ToList();
                    break;

                case IEnumerable collection:
                    foreach (var item in collection)
                    {
                        if (item != null)
                            items.Add(item.ToString() ?? string.Empty);
                    }
                    break;

                default:
                    throw new ArgumentException("Unsupported list format. Please pass a comma-separated string or a list of strings.");
            }

            if (!items.Any())
            {
                throw new ArgumentException("No valid items found in the list.");
            }

            var preselectedIndices = new List<int>();
            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];
                if (preselectPlus && allowMultiSelect && item.StartsWith("+"))
                {
                    preselectedIndices.Add(i);
                }
            }

            Console.WriteLine(title);
            Console.WriteLine(message);
            for (int i = 0; i < items.Count; i++)
            {
                Console.WriteLine($"{i + 1}. {items[i]}");
            }

            if (allowMultiSelect && preselectedIndices.Count > 0)
            {
                Console.WriteLine($"Preselected: {string.Join(", ", preselectedIndices.Select(i => i + 1))}");
            }

            Console.WriteLine(allowMultiSelect
                ? "Enter one or more indices (comma-separated), empty to accept preselected, or :cancel"
                : "Enter an index, or :cancel");

            var rawSelection = MessageBoxInteractionHelpers.Prompt("Selection:");
            if (string.Equals(rawSelection, ":cancel", StringComparison.OrdinalIgnoreCase))
            {
                SelectedItem.Set(context, null);
                SelectedIndex.Set(context, null);
                ButtonPressed.Set(context, false);
                status = "User canceled the dialog.";
            }
            else
            {
                var selectedIndices = MessageBoxInteractionHelpers.ParseSelectedIndices(rawSelection, items.Count);

                if (allowMultiSelect && selectedIndices.Count == 0 && preselectedIndices.Count > 0 && string.IsNullOrWhiteSpace(rawSelection))
                {
                    selectedIndices = preselectedIndices;
                }

                if (!allowMultiSelect && selectedIndices.Count > 1)
                {
                    selectedIndices = [selectedIndices[0]];
                }

                if (!allowMultiSelect && selectedIndices.Count == 0 && !limitToList && !string.IsNullOrWhiteSpace(rawSelection))
                {
                    SelectedItem.Set(context, rawSelection);
                    SelectedIndex.Set(context, []);
                    ButtonPressed.Set(context, true);
                    status = "User entered a custom value.";
                }
                else if (selectedIndices.Count == 0)
                {
                    if (allowEmptySelection)
                    {
                        SelectedItem.Set(context, string.Empty);
                        SelectedIndex.Set(context, []);
                        ButtonPressed.Set(context, true);
                        status = "No selection made (allowed).";
                    }
                    else
                    {
                        SelectedItem.Set(context, null);
                        SelectedIndex.Set(context, null);
                        ButtonPressed.Set(context, false);
                        status = "No valid selection provided.";
                    }
                }
                else
                {
                    var selectedItems = selectedIndices.Select(i => items[i]).ToList();
                    SelectedItem.Set(context, string.Join(", ", selectedItems));
                    SelectedIndex.Set(context, selectedIndices.ToArray());
                    ButtonPressed.Set(context, true);
                    status = "User made a selection.";
                }
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SelectedItem.Set(context, null);
            SelectedIndex.Set(context, null);
            ButtonPressed.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }
}
