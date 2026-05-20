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

            var sourceFilePaths = sourceFiles.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
            var copiedFiles = new List<string>();

            foreach (var sourceFilePath in sourceFilePaths)
            {
                var trimmedPath = sourceFilePath.Trim();
                var dir = Path.GetDirectoryName(trimmedPath);
                var filePattern = Path.GetFileName(trimmedPath);

                if (string.IsNullOrEmpty(dir) || !Directory.Exists(dir))
                    continue;

                foreach (var expandedPath in Directory.EnumerateFiles(dir, filePattern))
                {
                    var fileName = Path.GetFileName(expandedPath);
                    var destinationPath = Path.Combine(destinationFolder, fileName);

                    if (File.Exists(destinationPath))
                    {
                        switch (ifExistsAction)
                        {
                            case IfExistsActionEnum.DoNothing:
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
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"{copiedFiles.Count} file(s) copied successfully.");
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
}
