using NodeLibrary.FileNodes.Enums;

namespace NodeLibrary.FileNodes;

[DisplayName("Move File(s)"), Description("Moves one or more files into a destination folder. Supports wildcard patterns and multiple paths separated by semicolons.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class MoveFileNode : BaseNode
{
    [DisplayName("Source file path(s)"), Description("One or more file paths to move, separated by semicolons. Supports wildcards (e.g., 'C:\\Inbox\\*.pdf;C:\\Inbox\\report.docx').")]
    public required InArgument<string> SourceFiles { get; set; }

    [DisplayName("Destination folder"), Description("The folder where files will be moved to (e.g., 'C:\\Archive\\Reports'). Created automatically if it does not exist.")]
    public required InArgument<string> DestinationFolder { get; set; }

    [DisplayName("If file exists"), Description("Action to take when a file with the same name already exists in the destination. Default: Do nothing (skip).")]
    public required InArgument<IfExistsActionEnum> IfExistsAction { get; set; } = new InArgument<IfExistsActionEnum>(IfExistsActionEnum.DoNothing);

    [DisplayName("Moved files"), Description("Returns the list of full paths of all successfully moved files in the destination folder.")]
    public OutArgument<IEnumerable<string>> MovedFiles { get; set; } = new OutArgument<IEnumerable<string>>();

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
            var movedFiles = new List<string>();

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
                                File.Delete(destinationPath);
                                File.Move(expandedPath, destinationPath);
                                movedFiles.Add(destinationPath);
                                break;
                        }
                    }
                    else
                    {
                        File.Move(expandedPath, destinationPath);
                        movedFiles.Add(destinationPath);
                    }
                }
            }

            MovedFiles.Set(context, movedFiles);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"{movedFiles.Count} file(s) moved successfully.");
        }
        catch (UnauthorizedAccessException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Access denied: {ex.Message}");
        }
        catch (IOException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"I/O error moving files: {ex.Message}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error moving files: {ex.Message}");
        }
    }
}
