namespace NodeLibrary.FolderNodes;

[DisplayName("Wait for File"), Description("Suspends running the flow until a file is created or deleted.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class WaitForFileNode : BaseNode
{
    [DisplayName("Wait for file to be"), Description("Specifies whether to wait for the file to be Created or Deleted.")]
    public required InArgument<WaitForFileAction> Action { get; set; }

    [DisplayName("File path"), Description("The path to the file to monitor.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Fail with timeout error"), Description("Indicates whether to fail with a timeout error if the file is not created/deleted within the specified time.")]
    public InArgument<bool> FailWithTimeoutError { get; set; } = new InArgument<bool>(false);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var action = Action.Get(context);
            var filePath = FilePath.Get(context);
            var failWithTimeoutError = FailWithTimeoutError.Get(context);

            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be empty.");

            status = action switch
            {
                WaitForFileAction.Created => WaitForFileCreation(filePath, failWithTimeoutError),
                WaitForFileAction.Deleted => WaitForFileDeletion(filePath, failWithTimeoutError),
                _ => throw new ArgumentException("Invalid action specified.")
            };

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error waiting for file: {ex.Message}");
        }
    }

    private static string WaitForFileCreation(string filePath, bool failWithTimeoutError)
    {
        var retryCount = 0;
        const int maxRetries = 10;
        const int delayMilliseconds = 500;

        while (retryCount < maxRetries)
        {
            if (File.Exists(filePath))
                return $"File '{filePath}' was successfully created.";

            Thread.Sleep(delayMilliseconds);
            retryCount++;
        }

        if (failWithTimeoutError)
            throw new TimeoutException($"File '{filePath}' was not created within the specified time.");

        return $"File '{filePath}' was not created within the specified time.";
    }

    private static string WaitForFileDeletion(string filePath, bool failWithTimeoutError)
    {
        var retryCount = 0;
        const int maxRetries = 10;
        const int delayMilliseconds = 500;

        while (retryCount < maxRetries)
        {
            if (!File.Exists(filePath))
                return $"File '{filePath}' was successfully deleted.";

            Thread.Sleep(delayMilliseconds);
            retryCount++;
        }

        if (failWithTimeoutError)
            throw new TimeoutException($"File '{filePath}' was not deleted within the specified time.");

        return $"File '{filePath}' was not deleted within the specified time.";
    }
}

public enum WaitForFileAction
{
    [Display(Name = "Created"), Description("Waits for the file to be created at the specified path.")]
    Created,

    [Display(Name = "Deleted"), Description("Waits for the file to be deleted from the specified path.")]
    Deleted
}