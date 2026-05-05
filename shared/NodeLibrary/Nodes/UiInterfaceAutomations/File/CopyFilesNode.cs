using NodeLibrary.FileNodes.Enums;

namespace NodeLibrary.FileNodes;

[DisplayName("Copy File(s)"), Description("Copies one or more files into a destination folder.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class CopyFileNode : BaseNode
{
    [DisplayName("File(s) to copy"), Description("The path(s) of the file(s) to copy. Supports wildcards like *.txt.")]
    public required InArgument<string> SourceFiles { get; set; }

    [DisplayName("Destination folder"), Description("The destination folder where the files will be copied.")]
    public required InArgument<string> DestinationFolder { get; set; }

    [DisplayName("If file exists"), Description("Specifies the behavior when a file already exists in the destination folder.")]
    public required InArgument<IfExistsActionEnum> IfExistsAction { get; set; } = new InArgument<IfExistsActionEnum>(IfExistsActionEnum.DoNothing);


    [DisplayName("Copied Files"), Description("Returns the list of successfully copied files.")]
    public OutArgument<IEnumerable<string>> CopiedFiles { get; set; } = new OutArgument<IEnumerable<string>>();



    protected override void Execute(INodeContext context)
    {
        // Get input arguments
        var sourceFiles = SourceFiles.Get(context);
        var destinationFolder = DestinationFolder.Get(context);
        var ifExistsAction = IfExistsAction.Get(context);

        // Validate inputs
        if (string.IsNullOrWhiteSpace(sourceFiles))
        {
            throw new ArgumentException("Source files cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(destinationFolder))
        {
            throw new ArgumentException("Destination folder cannot be empty.");
        }

        var status = "Operation completed successfully.";

        try
        {
            // Ensure destination folder exists
            Directory.CreateDirectory(destinationFolder);

            // Split source files by semicolon (supports multiple files)
            var sourceFilePaths = sourceFiles.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

            // List to store successfully copied files
            var copiedFiles = new List<string>();

            foreach (var sourceFilePath in sourceFilePaths)
            {
                // Expand wildcards if present
                var expandedPaths = GetExpandedPaths(sourceFilePath);

                foreach (var expandedPath in expandedPaths)
                {
                    if (!File.Exists(expandedPath))
                    {
                        continue; // Skip non-existent files
                    }

                    var fileName = Path.GetFileName(expandedPath);
                    var destinationPath = Path.Combine(destinationFolder, fileName);

                    // Handle existing file scenario
                    if (File.Exists(destinationPath))
                    {
                        switch (ifExistsAction)
                        {
                            case IfExistsActionEnum.DoNothing:
                                continue; // Skip existing file
                            case IfExistsActionEnum.Overwrite:
                                File.Copy(expandedPath, destinationPath, true); // Overwrite existing file
                                copiedFiles.Add(destinationPath);
                                break;
                            default:
                                throw new ArgumentException("Invalid 'If file exists' action specified.");
                        }
                    }
                    else
                    {
                        // Copy the file
                        File.Copy(expandedPath, destinationPath);
                        copiedFiles.Add(destinationPath);
                    }
                }
            }

            // Set output arguments
            CopiedFiles.Set(context, copiedFiles);
            status = $"{copiedFiles.Count} file(s) copied successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error copying files: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }

    private IEnumerable<string> GetExpandedPaths(string pattern)
    {
        // Expand wildcards using Directory.GetFiles
        return Directory.GetFiles(Path.GetDirectoryName(pattern) ?? string.Empty, Path.GetFileName(pattern));
    }
}
