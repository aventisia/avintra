using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CompressionActivities
{
    // Activity to compress one or more files or folders into a zip archive
    [DisplayName("Zip Files")]
    [Description("Compress one or more files or folders into a zip archive.")]
    public class ZipFilesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Source Paths")]
        [Description("The list of file or folder paths to zip.")]
        public InArgument<IEnumerable<string>> SourcePaths { get; set; }

        [RequiredArgument]
        [DisplayName("Output Zip Path")]
        [Description("The path to save the resulting zip file.")]
        public InArgument<string> OutputZipPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourcePaths = SourcePaths.Get(context);
            var outputZipPath = OutputZipPath.Get(context);

            try
            {
                // Open or create the zip file in Create mode (clears previous contents)
                using (var zipArchive = ZipFile.Open(outputZipPath, ZipArchiveMode.Create))
                {
                    foreach (var sourcePath in sourcePaths)
                    {
                        var normalizedPath = Path.GetFullPath(sourcePath);

                        if (Directory.Exists(normalizedPath))
                        {
                            AddDirectoryToZip(zipArchive, normalizedPath, "");
                        }
                        else if (File.Exists(normalizedPath))
                        {
                            var entryName = Path.GetFileName(normalizedPath);
                            zipArchive.CreateEntryFromFile(normalizedPath, entryName);
                        }
                        else
                        {
                            throw new FileNotFoundException($"Source path not found: {sourcePath}");
                        }
                    }
                }

                // Success status
                IsSuccess?.Set(context, true);
                StatusMessage?.Set(context, $"Files zipped successfully to '{outputZipPath}'.");
            }
            catch (Exception ex)
            {
                // Error status
                IsSuccess?.Set(context, false);
                StatusMessage?.Set(context, $"Error zipping files: {ex.Message}");
            }
        }

        /// <summary>
        /// Recursively adds the directory and its contents to the zip archive.
        /// </summary>
        private static void AddDirectoryToZip(ZipArchive zipArchive, string sourceDir, string destinationDir)
        {
            foreach (var filePath in Directory.GetFiles(sourceDir))
            {
                var entryName = string.IsNullOrEmpty(destinationDir)
                    ? Path.GetFileName(filePath)
                    : destinationDir + "/" + Path.GetFileName(filePath);

                zipArchive.CreateEntryFromFile(filePath, entryName);
            }

            foreach (var dirPath in Directory.GetDirectories(sourceDir))
            {
                var newDestinationDir = string.IsNullOrEmpty(destinationDir)
                    ? Path.GetFileName(dirPath)
                    : destinationDir + "/" + Path.GetFileName(dirPath);

                AddDirectoryToZip(zipArchive, dirPath, newDestinationDir);
            }
        }
    }
}