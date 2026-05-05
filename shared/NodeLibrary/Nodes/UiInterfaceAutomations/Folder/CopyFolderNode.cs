using NodeLibrary.FolderNodes.Enums;

namespace NodeLibrary.FolderNodes;

[DisplayName("Folder to Copy"), Description("The path of the source folder that you want to copy the folder")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class CopyFolderNode : BaseNode
{
    [DisplayName("Folder to Copy"), Description("The path of the source folder that you want to duplicate.")]
    public required InArgument<string> SourceFolder { get; set; }

    [DisplayName("Destination Folder"), Description("The path where the folder should be copied.")]
    public required InArgument<string> DestinationFolder { get; set; }

    [DisplayName("If Folder Exists"), Description("Specifies what action to take if the destination folder already exists.")]
    public required InArgument<IfExistsActionEnum> IfExistsAction { get; set; } = new InArgument<IfExistsActionEnum>(IfExistsActionEnum.DoNothing);

    [DisplayName("Copied Folder"), Description("The copied folder path as a confirmation output.")]
    public OutArgument<string> CopiedFolder { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var source = SourceFolder.Get(context);
            var destination = DestinationFolder.Get(context);
            var action = IfExistsAction.Get(context);
            var shouldCopy = true;

            if (string.IsNullOrWhiteSpace(source))
                throw new ArgumentException("Source folder path cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(destination))
                throw new ArgumentException("Destination folder path cannot be null or empty.");

            if (!Directory.Exists(source))
                throw new DirectoryNotFoundException($"Source folder does not exist: {source}");

            var folderName = new DirectoryInfo(source).Name;
            var destinationPath = Path.Combine(destination, folderName);

            if (Directory.Exists(destinationPath))
            {
                switch (action)
                {
                    case IfExistsActionEnum.DoNothing:
                        CopiedFolder.Set(context, destinationPath);
                        status = "Destination folder already exists. No action taken.";
                        shouldCopy = false;
                        break;

                    case IfExistsActionEnum.Overwrite:
                        Directory.Delete(destinationPath, true);
                        break;
                }
            }

            if (shouldCopy)
            {
                CopyAll(new DirectoryInfo(source), new DirectoryInfo(destinationPath));
                CopiedFolder.Set(context, destinationPath);
                status = "Folder copied successfully.";
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error copying folder: {ex.Message}");
        }
    }

    private static void CopyAll(DirectoryInfo source, DirectoryInfo target)
    {
        Directory.CreateDirectory(target.FullName);

        foreach (var fi in source.GetFiles())
            fi.CopyTo(Path.Combine(target.FullName, fi.Name), true);

        foreach (var subDir in source.GetDirectories())
        {
            var nextTargetSubDir = target.CreateSubdirectory(subDir.Name);
            CopyAll(subDir, nextTargetSubDir);
        }
    }
}