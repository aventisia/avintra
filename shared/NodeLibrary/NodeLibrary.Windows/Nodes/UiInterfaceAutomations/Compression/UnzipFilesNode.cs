using System.IO.Compression;

namespace NodeLibrary.CompressionNodes;

[DisplayName("Unzip Files"), Description("Extracts files from a ZIP archive to a specified destination folder.")]
[NodeMetadata(icon: "/assets/Compression.svg")]
public class UnzipFilesNode : BaseNode
{
    #region Inputs

    [DisplayName("Archive Path"), Description("The full path of the ZIP file to extract.")]
    public required InArgument<string> ArchivePath { get; set; }

    [DisplayName("Destination Folder"), Description("The full path of the folder to extract the archive to. Existing files may be overwritten.")]
    public required InArgument<string> DestinationFolder { get; set; }

    [DisplayName("Include Mask"), Description("Limits the extracted files to those matching the mask. Use wildcards like '*.txt'. Multiple filters separated by ';'.")]
    public InArgument<string> IncludeMask { get; set; } = new InArgument<string>();

    [DisplayName("Exclude Mask"), Description("Excludes files matching the mask. Use wildcards like '*.log'. Multiple filters separated by ';'.")]
    public InArgument<string> ExcludeMask { get; set; } = new InArgument<string>();

    #endregion

    protected override void Execute(INodeContext context)
    {
        try
        {
            var archivePath = ArchivePath.Get(context)?.Trim().Trim('"', '\'');
            var destinationFolder = DestinationFolder.Get(context)?.Trim().Trim('"', '\'');
            var includeMask = IncludeMask.Get(context);
            var excludeMask = ExcludeMask.Get(context);

            if (string.IsNullOrWhiteSpace(archivePath))
                throw new ArgumentException("Archive path is required.");

            if (!File.Exists(archivePath))
                throw new FileNotFoundException("ZIP archive not found.", archivePath);

            if (string.IsNullOrWhiteSpace(destinationFolder))
                throw new ArgumentException("Destination folder is required.");

            Directory.CreateDirectory(destinationFolder);

            using var archive = ZipFile.OpenRead(archivePath);
            foreach (var entry in archive.Entries)
            {
                // Entries with an empty Name are directory entries — skip them
                if (string.IsNullOrEmpty(entry.Name)) continue;

                var fileName = entry.Name;
                if (!string.IsNullOrEmpty(includeMask) && !MatchesMask(fileName, includeMask)) continue;
                if (!string.IsNullOrEmpty(excludeMask) && MatchesMask(fileName, excludeMask)) continue;

                // Preserve internal directory structure stored in FullName
                var destinationPath = Path.GetFullPath(
                    Path.Combine(destinationFolder, entry.FullName.Replace('/', Path.DirectorySeparatorChar)));

                // Guard against zip-slip path traversal
                if (!destinationPath.StartsWith(Path.GetFullPath(destinationFolder) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException($"Entry '{entry.FullName}' would extract outside the destination folder.");

                var destDir = Path.GetDirectoryName(destinationPath)!;
                Directory.CreateDirectory(destDir);

                entry.ExtractToFile(destinationPath, overwrite: true);
            }

            var status = $"Successfully extracted files from '{archivePath}' to '{destinationFolder}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error extracting ZIP file: {ex.Message}");
        }
    }

    private static bool MatchesMask(string fileName, string mask)
    {
        if (string.IsNullOrEmpty(mask)) return true;
        foreach (var pattern in mask.Split(';', StringSplitOptions.RemoveEmptyEntries))
        {
            var regexPattern = "^" + Regex.Escape(pattern.Trim()).Replace("\\*", ".*").Replace("\\?", ".") + "$";
            if (Regex.IsMatch(fileName, regexPattern, RegexOptions.IgnoreCase))
                return true;
        }
        return false;
    }
}
