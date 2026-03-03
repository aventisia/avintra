using CodeActivitiesLibrary.Extensions;
using SharpCompress.Archives;
using SharpCompress.Archives.Zip;
using SharpCompress.Common;
using SharpCompress.Readers;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Security;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CompressionActivities
{
    [DisplayName("Unzip Files")]
    [Description("Extracts files from a ZIP archive to a specified destination folder.")]
    [ActivityMetaData(nodeImg: "/assets/Compression.svg")]
    public class UnzipFilesActivity : BaseCodeActivity
    {

        #region Inputs

        [RequiredArgument]
        [DisplayName("Archive Path")]
        [Description("The full path of the ZIP file to extract.")]
        public InArgument<string> ArchivePath { get; set; }

        [RequiredArgument]
        [DisplayName("Destination Folder")]
        [Description("The full path of the folder to extract the archive to. Existing files may be overwritten.")]
        public InArgument<string> DestinationFolder { get; set; }

        [DisplayName("Password")]
        [Description("The password used for this archive, if any.")]
        public InArgument<SecureString> Password { get; set; }

        [DisplayName("Include Mask")]
        [Description(
            "Limits the extracted files to those matching the mask. Use wildcards like '*.txt'. Multiple filters separated by ';'.")]
        public InArgument<string> IncludeMask { get; set; }

        [DisplayName("Exclude Mask")]
        [Description(
            "Excludes files matching the mask. Use wildcards like '*.log'. Multiple filters separated by ';'.")]
        public InArgument<string> ExcludeMask { get; set; }

        #endregion
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var archivePath = ArchivePath.Get(context);
                var destinationFolder = DestinationFolder.Get(context);
                var password = ConvertSecureStringToString(Password.Get(context));
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
                // Extract files from the ZIP archive
                var success = ExtractZipFile(archivePath, destinationFolder, password, includeMask, excludeMask);
                if (success)
                    status = $"Successfully extracted files from '{archivePath}' to '{destinationFolder}'.";
                else
                    status = "Failed to extract files from ZIP archive.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error extracting ZIP file: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            finally
            {
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
        }

        private bool ExtractZipFile(string archivePath, string destinationFolder, string password, string includeMask,
            string excludeMask)
        {
            try
            {
                var readerOptions = string.IsNullOrEmpty(password) 
                    ? null 
                    : ReaderOptions.ForEncryptedArchive(password);

                using (var archive = ZipArchive.OpenArchive(archivePath, readerOptions))
                {
                    foreach (var entry in archive.Entries)
                    {
                        if (entry.IsDirectory) continue;
                        var fileName = Path.GetFileName(entry.Key);
                        if (!string.IsNullOrEmpty(includeMask) && !MatchesMask(fileName, includeMask)) continue;
                        if (!string.IsNullOrEmpty(excludeMask) && MatchesMask(fileName, excludeMask)) continue;
                        
                        var destinationPath = Path.Combine(destinationFolder, entry.Key);
                        var destDir = Path.GetDirectoryName(destinationPath);
                        Directory.CreateDirectory(destDir);
                        
                        using (var entryStream = entry.OpenEntryStream())
                        using (var fileStream = File.Create(destinationPath))
                        {
                            entryStream.CopyTo(fileStream);
                        }
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
    }
}