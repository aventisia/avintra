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
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Compression.svg")]
    public class ZipFilesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Source Paths")]
        [Description("Accepts: string[], List<string>, or comma-separated string of file/folder paths.")]
        public InArgument<object> SourcePaths { get; set; }

        [DisplayName("Type of Compression")]
        [Description("The type of compression to use for the zip archive.")]
        [DefaultValue(CompressionType.Deflate)]
        public InArgument<CompressionType> TypeOfCompression { get; set; }

        [RequiredArgument]
        [DisplayName("Output Zip Path")]
        [Description("Full path where the ZIP file will be saved (e.g., C:\\temp\\archive.zip).")]
        public InArgument<string> OutputZipPath { get; set; }

        [DisplayName("Output Zip Full Path")]
        [Description("Returns the full path of the created ZIP file.")]
        public OutArgument<string> OutputZipFullPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // -------------------------------
                // 1. Get and Convert Source Paths
                // -------------------------------
                var input = SourcePaths.Get(context);
                string[] sourcePaths;

                if (input == null)
                    throw new ArgumentException("SourcePaths cannot be null.");

                if (input is string[] arr)
                {
                    sourcePaths = arr;
                }
                else if (input is IEnumerable<string> list)
                {
                    sourcePaths = list?.Where(s => !string.IsNullOrWhiteSpace(s)).ToArray() ?? Array.Empty<string>();
                }
                else if (input is string str && !string.IsNullOrWhiteSpace(str))
                {
                    // Remove common formatting artifacts: brackets, extra quotes
                    str = str.Trim();
                    if (str.StartsWith("[") && str.EndsWith("]"))
                        str = str.Substring(1, str.Length - 2);

                    sourcePaths = str.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                     .Select(p => p.Trim().Trim('"', '\'').Trim()) // Remove surrounding quotes
                                     .Where(p => !string.IsNullOrEmpty(p))
                                     .ToArray();
                }
                else
                {
                    throw new ArgumentException(
                        $"Cannot convert {input.GetType().Name} to string[]. " +
                        "Expected: string[], List<string>, or comma-separated string.");
                }

                // Validate source paths
                if (!sourcePaths.Any())
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "No valid source paths provided.");
                    OutputZipFullPath.Set(context, null);
                    return;
                }

                // -------------------------------
                // 2. Handle Output Zip Path
                // -------------------------------
                var outputZipPath = OutputZipPath.Get(context)?.Trim();

                if (string.IsNullOrWhiteSpace(outputZipPath))
                {
                    throw new ArgumentException("OutputZipPath cannot be null or empty.");
                }

                // Clean output path: remove surrounding quotes
                outputZipPath = outputZipPath.Trim('"', '\'');

                // Ensure directory exists
                var zipDir = Path.GetDirectoryName(outputZipPath);
                if (string.IsNullOrWhiteSpace(zipDir))
                {
                    zipDir = Environment.CurrentDirectory;
                    outputZipPath = Path.Combine(zipDir, Path.GetFileName(outputZipPath));
                }

                if (!Directory.Exists(zipDir))
                    Directory.CreateDirectory(zipDir);

                // Ensure file ends with .zip
                if (!outputZipPath.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                {
                    var fileNameWithoutExt = Path.GetFileNameWithoutExtension(outputZipPath);
                    outputZipPath = Path.Combine(zipDir, $"{fileNameWithoutExt}.zip");
                }

                // Delete existing ZIP file
                if (File.Exists(outputZipPath))
                    File.Delete(outputZipPath);

                // -------------------------------
                // 3. Validate & Normalize Source Paths
                // -------------------------------
                long totalSizeBytes = 0;
                var validSourcePaths = new List<string>();

                foreach (var rawPath in sourcePaths)
                {
                    // Strip extra quotes and trim
                    var cleanedPath = rawPath?.Trim().Trim('"', '\'').Trim();
                    if (string.IsNullOrWhiteSpace(cleanedPath))
                        continue;

                    // Check for illegal characters
                    var illegalChars = Path.GetInvalidPathChars();
                    if (cleanedPath.IndexOfAny(illegalChars) >= 0)
                    {
                        throw new ArgumentException($"Invalid path: contains illegal characters -> {cleanedPath}");
                    }

                    string fullPath;
                    try
                    {
                        fullPath = Path.GetFullPath(cleanedPath);
                    }
                    catch (Exception ex)
                    {
                        throw new ArgumentException($"Invalid path format: '{cleanedPath}'", ex);
                    }

                    if (File.Exists(fullPath))
                    {
                        totalSizeBytes += new FileInfo(fullPath).Length;
                        validSourcePaths.Add(fullPath);
                    }
                    else if (Directory.Exists(fullPath))
                    {
                        var files = Directory.GetFiles(fullPath, "*", SearchOption.AllDirectories);
                        totalSizeBytes += files.Sum(f => new FileInfo(f).Length);
                        validSourcePaths.Add(fullPath);
                    }
                    else
                    {
                        throw new FileNotFoundException($"Path not found: {fullPath}");
                    }
                }

                if (!validSourcePaths.Any())
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "No valid files or folders found in source paths.");
                    OutputZipFullPath.Set(context, null);
                    return;
                }

                // Optional: Skip if less than 5MB
                if (totalSizeBytes < 5 * 1024 * 1024)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Total size is less than 5MB. Skipped zipping.");
                    OutputZipFullPath.Set(context, null);
                    return;
                }

                // -------------------------------
                // 4. Create ZIP Archive
                // -------------------------------
                using (var archive = ZipArchive.Create())
                {
                    foreach (var sourcePath in validSourcePaths)
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
                    }

                    var compressionType = TypeOfCompression.Get(context);
                    archive.SaveTo(outputZipPath, compressionType);
                }

                // -------------------------------
                // 5. Set Outputs
                // -------------------------------
                var finalPath = Path.GetFullPath(outputZipPath);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully created ZIP at '{finalPath}'.");
                OutputZipFullPath.Set(context, finalPath);
            }
            catch (ArgumentException)
            {
                throw; // Re-throw known argument errors
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
                var relativePath = filePath.Substring(sourceDir.Length)
                    .TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

                var entryName = string.IsNullOrEmpty(destinationDir)
                    ? relativePath
                    : $"{destinationDir}/{relativePath.Replace('\\', '/')}";

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