namespace NodeLibrary.FileNodes;

[DisplayName("Wait For File"), Description("Suspends running the flow until a file is created or deleted.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class WaitForFileNode : BaseNode
{
    [DisplayName("File Path"), Description("The full path of the file to wait for.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Wait for File to be"), Description("Specifies whether to wait for file creation or deletion.")]
    public InArgument<WaitForFileModeEnum> Mode { get; set; } =
        new InArgument<WaitForFileModeEnum>(WaitForFileModeEnum.Create);

    [DisplayName("Fail with Timeout Error"), Description("Enable this to fail the activity if the file does not appear within the specified duration.")]
    public InArgument<bool> FailWithTimeoutError { get; set; } = new InArgument<bool>(false);

    [DisplayName("Duration (seconds)"), Description("The maximum time to wait for the file before timing out.")]
    [RenderIfCondition(nameof(FailWithTimeoutError), true)]
    public InArgument<int> Duration { get; set; } = new InArgument<int>(5);

    protected override void Execute(INodeContext context)
    {
        var filePath = FilePath.Get(context);
        var mode = Mode.Get(context);
        var failWithTimeoutError = FailWithTimeoutError.Get(context);
        var duration = Duration.Get(context);
        var status = "Operation completed successfully.";

        try
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be empty.");

            var startTime = DateTime.Now;
            bool success = false;

            while (true)
            {
                try
                {
                    if (mode == WaitForFileModeEnum.Create)
                    {
                        if (!File.Exists(filePath))
                            File.Create(filePath ?? string.Empty).Close(); // Create empty file
                        success = File.Exists(filePath);
                    }
                    else if (mode == WaitForFileModeEnum.Delete)
                    {
                        if (File.Exists(filePath))
                            File.Delete(filePath);
                        success = !File.Exists(filePath);
                    }

                    if (success)
                    {
                        status = $"File '{filePath}' successfully {(mode == WaitForFileModeEnum.Create ? "created" : "deleted")}.";
                        break;
                    }
                }
                catch (Exception ex)
                {
                    status = $"Error during file operation: {ex.Message}";
                    if (!failWithTimeoutError)
                        break;
                }

                if (failWithTimeoutError && (DateTime.Now - startTime).TotalSeconds >= duration)
                {
                    status = $"Timeout: File '{filePath}' was not {(mode == WaitForFileModeEnum.Create ? "created" : "deleted")} within {duration} seconds.";
                    throw new TimeoutException(status);
                }

                Thread.Sleep(100); // Wait for 100 milliseconds before checking again
            }
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error waiting for file: {ex.Message}");
        }
    }
}

// Enum for specifying the mode
public enum WaitForFileModeEnum
{
    [Display(Name = "Created", Description = "Waits until the file is created.")]
    Create,

    [Display(Name = "Deleted", Description = "Waits until the file is deleted.")]
    Delete
}
