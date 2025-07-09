using CodeActivitiesLibrary.Extensions;
using SharpCompress.Archives;
using SharpCompress.Archives.Zip;
using SharpCompress.Common;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;

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

        [DisplayName("Type of Compression")]
        [Description("The type of compression to use for the zip archive.")]
        [DefaultValue(CompressionType.Deflate)]
        public InArgument<CompressionType> TypeOfCompression { get; set; }

        [RequiredArgument]
        [DisplayName("Output Zip Path")]
        [Description("The path to save the resulting zip file.")]
        public InArgument<string> OutputZipPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourcePaths = SourcePaths.Get(context);
            var outputZipPath = OutputZipPath.Get(context);
            var compressionType = TypeOfCompression.Get(context);

            try
            {
                // Create the zip archive
                using (var archive = ZipArchive.Create())
                {
                    foreach (var sourcePath in sourcePaths)
                    {
                        var normalizedPath = Path.GetFullPath(sourcePath);

                        if (Directory.Exists(normalizedPath))
                        {
                            AddDirectoryToZip(archive, normalizedPath, "");
                        }
                        else if (File.Exists(normalizedPath))
                        {
                            var entryName = Path.GetFileName(normalizedPath);
                            archive.AddEntry(entryName, normalizedPath);
                        }
                        else
                        {
                            throw new FileNotFoundException($"Source path not found: {sourcePath}");
                        }
                    }

                    // Save the zip archive
                    archive.SaveTo(outputZipPath, compressionType);
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
        private static void AddDirectoryToZip(IArchive archive, string sourceDir, string destinationDir)
        {
            foreach (var filePath in Directory.GetFiles(sourceDir))
            {
                var entryName = string.IsNullOrEmpty(destinationDir)
                    ? Path.GetFileName(filePath)
                    : destinationDir + "/" + Path.GetFileName(filePath);
                ((ZipArchive)archive).AddEntry(entryName, filePath);
            }

            foreach (var dirPath in Directory.GetDirectories(sourceDir))
            {
                var newDestinationDir = string.IsNullOrEmpty(destinationDir)
                    ? Path.GetFileName(dirPath)
                    : destinationDir + "/" + Path.GetFileName(dirPath);
                AddDirectoryToZip(archive, dirPath, newDestinationDir);
            }
        }
    }
}