namespace NodeLibrary.FileNodes;

[DisplayName("Delete File(s)"), Description("Permanently deletes one or more files. Supports wildcard patterns and multiple paths separated by semicolons.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class DeleteFileNode : BaseNode
{
    [DisplayName("File path(s) to delete"), Description("One or more file paths to delete, separated by semicolons. Supports wildcards (e.g., 'C:\\Temp\\*.log;C:\\Temp\\old_report.csv').")]
    public required InArgument<string> FilesToDelete { get; set; }

    protected override void Execute(INodeContext context)
    {
        var filesToDelete = FilesToDelete.Get(context);

        if (string.IsNullOrWhiteSpace(filesToDelete))
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, "File path(s) to delete cannot be empty.");
            return;
        }

        try
        {
            var filePatterns = filesToDelete.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
            var deletedCount = 0;

            foreach (var pattern in filePatterns)
            {
                var trimmedPattern = pattern.Trim();
                var dir = Path.GetDirectoryName(trimmedPattern);
                var filePattern = Path.GetFileName(trimmedPattern);

                if (string.IsNullOrEmpty(dir) || !Directory.Exists(dir))
                    continue;

                foreach (var filePath in Directory.EnumerateFiles(dir, filePattern))
                {
                    File.Delete(filePath);
                    deletedCount++;
                }
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, deletedCount > 0
                ? $"{deletedCount} file(s) deleted successfully."
                : "No matching files found to delete.");
        }
        catch (UnauthorizedAccessException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Access denied: {ex.Message}");
        }
        catch (IOException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"I/O error deleting files: {ex.Message}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting files: {ex.Message}");
        }
    }
}
