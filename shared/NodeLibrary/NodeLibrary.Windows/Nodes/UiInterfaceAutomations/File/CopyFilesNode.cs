using NodeLibrary.FileNodes.Enums;

namespace NodeLibrary.FileNodes;

[DisplayName("Copy File(s)"), Description("Copies one or more files into a destination folder. Supports wildcard patterns and multiple paths separated by semicolons.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class CopyFileNode : BaseNode
{
    [DisplayName("Source file path(s)"), Description("One or more file paths to copy, separated by semicolons. Supports wildcards (e.g., 'C:\\Data\\*.txt;C:\\Logs\\report.csv').")]
    public required InArgument<string> SourceFiles { get; set; }

    [DisplayName("Destination folder"), Description("The folder where files will be copied to (e.g., 'C:\\Backup\\Documents'). Created automatically if it does not exist.")]
    public required InArgument<string> DestinationFolder { get; set; }

    [DisplayName("If file exists"), Description("Action to take when a file with the same name already exists in the destination. Default: Do nothing (skip).")]
    public required InArgument<IfExistsActionEnum> IfExistsAction { get; set; } = new InArgument<IfExistsActionEnum>(IfExistsActionEnum.DoNothing);

    [DisplayName("Copied files"), Description("Returns the list of full paths of all successfully copied files.")]
    public OutArgument<IEnumerable<string>> CopiedFiles { get; set; } = new OutArgument<IEnumerable<string>>();

    protected override void Execute(INodeContext context)
    {
        var sourceFiles = SourceFiles.Get(context);
        var destinationFolder = DestinationFolder.Get(context);
        var ifExistsAction = IfExistsAction.Get(context);

        if (string.IsNullOrWhiteSpace(sourceFiles))
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, "Source file path(s) cannot be empty.");
            return;
        }

        if (string.IsNullOrWhiteSpace(destinationFolder))
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, "Destination folder cannot be empty.");
            return;
        }

        try
        {
            Directory.CreateDirectory(destinationFolder);

            if (!Directory.Exists(destinationFolder))
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Destination folder could not be created or accessed: {destinationFolder}");
                return;
            }

            var sourceFilePaths = sourceFiles.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
            var copiedFiles = new List<string>();
            var skippedFiles = new List<string>();
            var notFoundPaths = new List<string>();

            foreach (var sourceFilePath in sourceFilePaths)
            {
                var trimmedPath = sourceFilePath.Trim();
                var dir = Path.GetDirectoryName(trimmedPath);
                var filePattern = Path.GetFileName(trimmedPath);

                if (string.IsNullOrEmpty(dir))
                {
                    notFoundPaths.Add(trimmedPath);
                    continue;
                }

                if (!Directory.Exists(dir))
                {
                    notFoundPaths.Add(trimmedPath);
                    continue;
                }

                var matchedFiles = Directory.EnumerateFiles(dir, filePattern).ToList();
                if (!matchedFiles.Any())
                {
                    notFoundPaths.Add(trimmedPath);
                    continue;
                }

                foreach (var expandedPath in matchedFiles)
                {
                    var fileName = Path.GetFileName(expandedPath);
                    var destinationPath = Path.Combine(destinationFolder, fileName);

                    if (File.Exists(destinationPath))
                    {
                        switch (ifExistsAction)
                        {
                            case IfExistsActionEnum.DoNothing:
                                skippedFiles.Add(destinationPath);
                                continue;
                            case IfExistsActionEnum.Overwrite:
                                File.Copy(expandedPath, destinationPath, overwrite: true);
                                copiedFiles.Add(destinationPath);
                                break;
                        }
                    }
                    else
                    {
                        File.Copy(expandedPath, destinationPath);
                        copiedFiles.Add(destinationPath);
                    }
                }
            }

            CopiedFiles.Set(context, copiedFiles);

            var message = BuildStatusMessage(copiedFiles.Count, skippedFiles.Count, notFoundPaths.Count);
            var allSucceeded = notFoundPaths.Count == 0 && skippedFiles.Count == 0 && copiedFiles.Count > 0;

            IsSuccess.Set(context, allSucceeded);
            StatusMessage.Set(context, message);
        }
        catch (UnauthorizedAccessException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Access denied: {ex.Message}");
        }
        catch (IOException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"I/O error copying files: {ex.Message}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error copying files: {ex.Message}");
        }
    }

    private static string BuildStatusMessage(int copiedCount, int skippedCount, int notFoundCount)
    {
        if (copiedCount > 0 && skippedCount == 0 && notFoundCount == 0)
            return $"{copiedCount} file(s) copied successfully.";

        if (copiedCount == 0 && skippedCount == 0 && notFoundCount == 0)
            return "No source files were found to copy. Verify the source path(s) exist and are accessible.";

        var parts = new List<string>();

        if (copiedCount > 0)
            parts.Add($"{copiedCount} file(s) copied");

        if (skippedCount > 0)
            parts.Add($"{skippedCount} file(s) skipped because they already exist in the destination (If file exists = Do nothing)");

        if (notFoundCount > 0)
            parts.Add($"{notFoundCount} source path/pattern(s) did not match any files");

        return string.Join("; ", parts) + ".";
    }
}
