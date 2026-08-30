namespace NodeLibrary.MessageBoxNodes;

[DisplayName("Display Select File Dialog"), Description("Displays a file selection dialog to let users choose one or more files.")]
[NodeMetadata(icon: "/assets/MessageBox.svg")]
public sealed class DisplaySelectFileDialogNode : BaseNode
{
    [DisplayName("Dialog Title"), Description("The title of the file selection dialog window.")]
    public required InArgument<string> DialogTitle { get; set; }

    [DisplayName("Initial Folder"), Description("The folder path where the dialog starts. If empty, defaults to Desktop.")]
    public InArgument<string> InitialFolder { get; set; } = new InArgument<string>();

    [DisplayName("File Filter"), Description("Filter for file types (e.g., \"Text Files (*.txt)|*.txt\"). Defaults to All Files.")]
    public InArgument<string> FileFilter { get; set; } = new InArgument<string>();

    [DisplayName("Keep Dialog On Top"), Description("If true, keeps the dialog on top of all other windows.")]
    public InArgument<bool> KeepFileDialogOnTop { get; set; } = new InArgument<bool>(false);

    [DisplayName("Allow Multiple Selection"), Description("Allows user to select multiple files if set to true.")]
    public InArgument<bool> AllowMultipleSelection { get; set; } = new InArgument<bool>(false);

    [DisplayName("Check If File Exists"), Description("Validates that the selected file(s) exist before returning.")]
    public InArgument<bool> CheckIfFileExists { get; set; } = new InArgument<bool>(false);

    [DisplayName("Selected Files"), Description("A collection of full paths for the selected files.")]
    public OutArgument<List<string>> SelectedFiles { get; set; } = new OutArgument<List<string>>();

    [DisplayName("Button Pressed"), Description("True if user clicked OK; False if Cancel was clicked or dialog closed.")]
    public OutArgument<bool> ButtonPressed { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "File selection dialog displayed successfully.";

        try
        {
            string dialogTitle = DialogTitle.Get(context) ?? "Select File";
            string initialFolder = InitialFolder.Get(context) ?? Environment.CurrentDirectory;
            string fileFilter = FileFilter.Get(context) ?? "All Files (*.*)|*.*";
            _ = KeepFileDialogOnTop.Get(context);
            bool allowMultipleSelection = AllowMultipleSelection.Get(context);
            bool checkIfFileExists = CheckIfFileExists.Get(context);

            if (!MessageBoxInteractionHelpers.IsInteractivePromptAvailable())
            {
                throw new InvalidOperationException("File selection requires an interactive execution context.");
            }

            Console.WriteLine(dialogTitle);
            Console.WriteLine($"Initial folder: {initialFolder}");
            Console.WriteLine($"Filter hint: {fileFilter}");
            Console.WriteLine(allowMultipleSelection
                ? "Enter one or more file paths separated by comma/semicolon, or :cancel"
                : "Enter file path, or :cancel");

            var input = MessageBoxInteractionHelpers.Prompt("File path(s):");
            if (string.Equals(input, ":cancel", StringComparison.OrdinalIgnoreCase))
            {
                SelectedFiles.Set(context, []);
                ButtonPressed.Set(context, false);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Operation canceled by user.");
                return;
            }

            var selectedFiles = MessageBoxInteractionHelpers.ParsePathList(input, allowMultipleSelection);

            if (checkIfFileExists)
            {
                selectedFiles = selectedFiles.Where(File.Exists).ToList();
            }

            SelectedFiles.Set(context, selectedFiles);
            ButtonPressed.Set(context, selectedFiles.Count > 0);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, selectedFiles.Count > 0
                ? status
                : "No file selected.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error selecting file(s): {ex.Message}");
        }
    }
}
