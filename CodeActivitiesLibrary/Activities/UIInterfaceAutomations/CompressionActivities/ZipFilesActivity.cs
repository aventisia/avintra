using CodeActivitiesLibrary.Extensions;
using SharpCompress.Archives;
using SharpCompress.Archives.Zip;
using SharpCompress.Common;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CompressionActivities
{
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

        [DisplayName("Output Zip Full Path")]
        [Description("The full path of the resulting zip file.")]
        public OutArgument<string> OutputZipFullPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourcePaths = SourcePaths.Get(context);
            var outputZipPath = OutputZipPath.Get(context);
            var compressionType = TypeOfCompression.Get(context);

            try
            {
                if (sourcePaths == null || !sourcePaths.Any())
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "No source paths provided.");
                    OutputZipFullPath.Set(context, null);
                    return;
                }

                // Ensure output directory exists
                var zipDir = Path.GetDirectoryName(outputZipPath);
                if (!string.IsNullOrWhiteSpace(zipDir) && !Directory.Exists(zipDir))
                    Directory.CreateDirectory(zipDir);

                // Delete existing ZIP file if it exists
                if (File.Exists(outputZipPath))
                    File.Delete(outputZipPath);

                long totalSizeBytes = 0;

                foreach (var path in sourcePaths)
                {
                    var fullPath = Path.GetFullPath(path);

                    if (File.Exists(fullPath))
                    {
                        totalSizeBytes += new FileInfo(fullPath).Length;
                    }
                    else if (Directory.Exists(fullPath))
                    {
                        totalSizeBytes += Directory.GetFiles(fullPath, "*", SearchOption.AllDirectories)
                                                   .Sum(file => new FileInfo(file).Length);
                    }
                }

                // Skip zip if total size < 5MB
                if (totalSizeBytes < 5 * 1024 * 1024)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Total size is less than 5MB, skipping zip.");
                    OutputZipFullPath.Set(context, null);
                    return;
                }

                using (var archive = ZipArchive.Create())
                {
                    foreach (var sourcePath in sourcePaths.Select(Path.GetFullPath))
                    {
                        if (Directory.Exists(sourcePath))
                        {
                            AddDirectoryToZip(archive, sourcePath, "");
                        }
                        else if (File.Exists(sourcePath))
                        {
                            var entryName = Path.GetFileName(sourcePath);
                            archive.AddEntry(entryName, sourcePath);
                        }
                        else
                        {
                            throw new FileNotFoundException($"Source path not found: {sourcePath}");
                        }
                    }

                    // Save the zip archive
                    archive.SaveTo(outputZipPath, compressionType);
                }

                // Set results
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully created ZIP at '{outputZipPath}'.");
                OutputZipFullPath.Set(context, Path.GetFullPath(outputZipPath));
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error zipping files: {ex.Message}");
                OutputZipFullPath.Set(context, null);
            }
        }

        private static void AddDirectoryToZip(IWritableArchive archive, string sourceDir, string destinationDir)
        {
            foreach (var filePath in Directory.GetFiles(sourceDir))
            {
                var relativePath = Path.GetFileName(filePath);
                var entryName = string.IsNullOrEmpty(destinationDir)
                    ? relativePath
                    : $"{destinationDir}/{relativePath}";
                archive.AddEntry(entryName, filePath);
            }

            foreach (var dirPath in Directory.GetDirectories(sourceDir))
            {
                var newDestinationDir = string.IsNullOrEmpty(destinationDir)
                    ? Path.GetFileName(dirPath)
                    : $"{destinationDir}/{Path.GetFileName(dirPath)}";
                AddDirectoryToZip(archive, dirPath, newDestinationDir);
            }
        }
    }
}
