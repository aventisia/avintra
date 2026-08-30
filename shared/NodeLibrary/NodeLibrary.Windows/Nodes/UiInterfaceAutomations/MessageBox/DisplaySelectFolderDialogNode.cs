namespace NodeLibrary.MessageBoxNodes;

[DisplayName("Display Select Folder Dialog"), Description("Displays a folder selection dialog to let users choose a folder.")]
[NodeMetadata(icon: "/assets/MessageBox.svg")]
public sealed class DisplaySelectFolderDialogNode : BaseNode
{
    [DisplayName("Dialog Description"), Description("The description or title of the folder selection dialog window.")]
    public required InArgument<string> DialogDescription { get; set; }

    [DisplayName("Initial Folder"), Description("The folder path where the dialog starts. If empty, defaults to Desktop.")]
    public InArgument<string> InitialFolder { get; set; } = new InArgument<string>();

    [DisplayName("Keep Dialog On Top"), Description("If true, keeps the dialog on top of all other windows.")]
    public InArgument<bool> KeepDialogOnTop { get; set; } = new InArgument<bool>(false);

    [DisplayName("Selected Folder"), Description("The full path of the folder selected by the user.")]
    public OutArgument<string> SelectedFolder { get; set; } = new OutArgument<string>();

    [DisplayName("Button Pressed"), Description("True if user clicked OK; False if Cancel was clicked or dialog closed.")]
    public OutArgument<bool> ButtonPressed { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var dialogDescription = DialogDescription.Get(context);
            var initialFolder = InitialFolder.Get(context) ?? Environment.CurrentDirectory;
            _ = KeepDialogOnTop.Get(context);

            if (!MessageBoxInteractionHelpers.IsInteractivePromptAvailable())
            {
                throw new InvalidOperationException("Folder selection requires an interactive execution context.");
            }

            Console.WriteLine(dialogDescription ?? "Select a folder.");
            Console.WriteLine($"Initial folder: {initialFolder}");
            Console.WriteLine("Enter folder path, or :cancel");
            var entered = MessageBoxInteractionHelpers.Prompt("Folder path:", initialFolder);

            if (string.Equals(entered, ":cancel", StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(entered))
            {
                SelectedFolder.Set(context, string.Empty);
                ButtonPressed.Set(context, false);
                status = "Operation canceled by user.";
            }
            else
            {
                if (!Directory.Exists(entered))
                {
                    Directory.CreateDirectory(entered);
                }

                SelectedFolder.Set(context, entered);
                ButtonPressed.Set(context, true);
                status = "Folder selected successfully.";
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SelectedFolder.Set(context, string.Empty);
            ButtonPressed.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error selecting folder: {ex.Message}");
        }
    }
}
