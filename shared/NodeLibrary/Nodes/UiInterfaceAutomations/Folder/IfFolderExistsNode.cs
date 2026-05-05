namespace NodeLibrary.FolderNodes;

[DisplayName("If Folder Exists"), Description("Checks whether the specified folder exists or doesn't exist based on the selected condition.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class IfFolderExistsNode : BaseNode
{
    [DisplayName("If Folder"), Description("Select the condition to check for the folder (Exists or Doesn't exist).")]
    public required InArgument<FolderCondition> Condition { get; set; } = new InArgument<FolderCondition>(FolderCondition.Exists);

    [DisplayName("Folder Path"), Description("The path of the folder to check for existence.")]
    public required InArgument<string> FolderPath { get; set; }

    [DisplayName("Result"), Description("Returns true if the folder meets the specified condition, otherwise false.")]
    public OutArgument<bool> Result { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var condition = Condition.Get(context);
            var folderPath = FolderPath.Get(context);

            if (string.IsNullOrWhiteSpace(folderPath))
                throw new ArgumentException("The 'Folder Path' cannot be null or empty.");

            var folderExists = Directory.Exists(folderPath);
            var result = condition switch
            {
                FolderCondition.Exists => folderExists,
                FolderCondition.DoesNotExist => !folderExists,
                _ => throw new InvalidOperationException($"Unsupported condition: {condition}")
            };

            status = result ? "Folder exists." : "Folder does not exist.";

            Result.Set(context, result);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Result.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error checking folder existence: {ex.Message}");
        }
    }
}

public enum FolderCondition
{
    [Description("Check if the folder exists.")]
    Exists,

    [Description("Check if the folder does not exist.")]
    DoesNotExist
}