namespace NodeLibrary.FileNodes;

[DisplayName("If File Exists"), Description("Checks if a file exists or does not exist and marks the beginning of a conditional block.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class IfFileExistsNode : BaseNode
{
    [DisplayName("Condition"), Description("Specifies whether to check if the file exists or doesn't exist.")]
    public required InArgument<FileExistenceEnum> Condition { get; set; } = new InArgument<FileExistenceEnum>(FileExistenceEnum.Exists);

    [DisplayName("File Path"), Description("The full path of the file to check.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Result"), Description("True if the file meets the specified condition, otherwise false.")]
    public OutArgument<bool> Result { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var condition = Condition.Get(context);
            var filePath = FilePath.Get(context);

            // Validate inputs
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be empty.", nameof(FilePath));

            if (filePath.IndexOfAny(Path.GetInvalidPathChars()) != -1)
                throw new ArgumentException("File path contains invalid characters.", nameof(FilePath));

            // Check file existence
            var fileExists = File.Exists(filePath);

            bool conditionMet;

            // Classic switch-case (C# 7.3 compatible)
            switch (condition)
            {
                case FileExistenceEnum.Exists:
                    conditionMet = fileExists;
                    break;

                case FileExistenceEnum.DoesntExist:
                    conditionMet = !fileExists;
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(condition), condition, "Invalid condition value");
            }

            // Set result and status
            Result.Set(context, conditionMet);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"File '{filePath}' {(fileExists ? "exists" : "does not exist")}. Condition satisfied: {conditionMet}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            Result.Set(context, false);
            StatusMessage.Set(context, $"Error checking file existence: {ex.Message}");
        }
    }
}

// Enum for specifying the condition
public enum FileExistenceEnum
{
    [Display(Name = "Exists", Description = "Indicates that the file should exist.")]
    Exists,

    [Display(Name = "Doesn't Exist", Description = "Indicates that the file should not exist.")]
    DoesntExist
}
