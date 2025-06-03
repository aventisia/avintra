using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CompressionActivities
{
    [DisplayName("Unzip Files")]
    [Description("Extracts files from a ZIP archive to a specified destination folder.")]
    public class UnzipFilesActivity : Extensions.BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var archivePath = ArchivePath.Get(context);
                var destinationFolder = DestinationFolder.Get(context);
                var password = Password.Get(context);
                var includeMask = IncludeMask.Get(context);
                var excludeMask = ExcludeMask.Get(context);

                // Validate required inputs
                if (string.IsNullOrWhiteSpace(archivePath))
                    throw new ArgumentException("Archive path is required.");

                if (!File.Exists(archivePath))
                    throw new FileNotFoundException("ZIP archive not found.", archivePath);

                if (string.IsNullOrWhiteSpace(destinationFolder))
                    throw new ArgumentException("Destination folder is required.");

                // Ensure destination exists
                Directory.CreateDirectory(destinationFolder);

                // Simulate unzipping process
                var success = ExtractZipFile(archivePath, destinationFolder, password, includeMask, excludeMask);

                if (success)
                    status = $"Successfully extracted files from '{archivePath}' to '{destinationFolder}'.";
                else
                    status = "Failed to extract files from ZIP archive.";
            }
            catch (Exception ex)
            {
                status = $"Error extracting ZIP file: {ex.Message}";
            }
            finally
            {
                StatusMessage.Set(context, status);
            }
        }

        private bool ExtractZipFile(string archivePath, string destinationFolder, string password, string includeMask,
            string excludeMask)
        {
            try
            {
                // TODO: Implement real extraction logic with password & filtering support
                // Standard ZipArchive does not support password-protected archives
                // For production use, consider:
                // - Ionic.Zip (DotNetZip)
                // - SharpCompress
                // - 7-Zip SDK via CLI or interop

                // Simulated behavior
                using (var archive = ZipFile.OpenRead(archivePath))
                {
                    foreach (var entry in archive.Entries)
                    {
                        // Skip directories and apply include/exclude masks
                        if (entry.FullName.EndsWith("/")) continue;

                        var fileName = Path.GetFileName(entry.FullName);

                        if (!string.IsNullOrEmpty(includeMask) && !MatchesMask(fileName, includeMask)) continue;
                        if (!string.IsNullOrEmpty(excludeMask) && MatchesMask(fileName, excludeMask)) continue;

                        var destinationPath = Path.Combine(destinationFolder, entry.FullName);
                        var destDir = Path.GetDirectoryName(destinationPath);

                        Directory.CreateDirectory(destDir);
                        entry.ExtractToFile(destinationPath, overwrite: true);
                    }
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        private bool MatchesMask(string fileName, string mask)
        {
            if (string.IsNullOrEmpty(mask)) return true;

            foreach (var pattern in mask.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries))
            {
                var regexPattern = "^" + Regex.Escape(pattern).Replace("\\*", ".*").Replace("\\?", ".") + "$";
                if (Regex.IsMatch(fileName, regexPattern, RegexOptions.IgnoreCase))
                    return true;
            }

            return false;
        }

        #region Inputs

        [RequiredArgument]

        [Description("The full path of the ZIP file to extract.")]
        public InArgument<string> ArchivePath { get; set; }

        [RequiredArgument]

        [Description("The full path of the folder to extract the archive to. Existing files may be overwritten.")]
        public InArgument<string> DestinationFolder { get; set; }


        [Description("The password used for this archive, if any.")]
        public InArgument<string> Password { get; set; }


        [Description(
            "Limits the extracted files to those matching the mask. Use wildcards like '*.txt'. Multiple filters separated by ';'.")]
        public InArgument<string> IncludeMask { get; set; }


        [Description("Excludes files matching the mask. Use wildcards like '*.log'. Multiple filters separated by ';'.")]
        public InArgument<string> ExcludeMask { get; set; }

        #endregion
    }
}