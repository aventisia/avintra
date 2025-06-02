using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CompressionActivities
{
    // Activity to compress one or more files or folders into a zip archive
    [DisplayName("Zip Files"), Description("Compress one or more files or folders into a zip archive.")]
    public class ZipFilesActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The list of file or folder paths to zip.")]
        public InArgument<IEnumerable<string>> SourcePaths { get; set; }

        [RequiredArgument, Category("Input"), Description("The path to save the resulting zip file.")]
        public InArgument<string> OutputZipPath { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var sourcePaths = SourcePaths.Get(context);
            var outputZipPath = OutputZipPath.Get(context);
            var status = "";

            try
            {
                using (var zipArchive = ZipFile.Open(outputZipPath, ZipArchiveMode.Create))
                {
                    foreach (var sourcePath in sourcePaths)
                    {
                        if (Directory.Exists(sourcePath))
                        {
                            AddDirectoryToZip(zipArchive, sourcePath, "");
                        }
                        else if (File.Exists(sourcePath))
                        {
                            zipArchive.CreateEntryFromFile(sourcePath, Path.GetFileName(sourcePath));
                        }
                        else
                        {
                            throw new FileNotFoundException($"Source path not found: {sourcePath}");
                        }
                    }
                }

                status = $"Files zipped successfully to '{outputZipPath}'.";
            }
            catch (Exception ex)
            {
                status = $"Error zipping files: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private static void AddDirectoryToZip(ZipArchive zipArchive, string sourceDir, string destinationDir)
        {
            foreach (var filePath in Directory.GetFiles(sourceDir))
            {
                zipArchive.CreateEntryFromFile(filePath, Path.Combine(destinationDir, Path.GetFileName(filePath)));
            }

            foreach (var dirPath in Directory.GetDirectories(sourceDir))
            {
                var newDestinationDir = string.IsNullOrEmpty(destinationDir)
                    ? Path.GetFileName(dirPath)
                    : Path.Combine(destinationDir, Path.GetFileName(dirPath));

                AddDirectoryToZip(zipArchive, dirPath, newDestinationDir);
            }
        }
    }
}
