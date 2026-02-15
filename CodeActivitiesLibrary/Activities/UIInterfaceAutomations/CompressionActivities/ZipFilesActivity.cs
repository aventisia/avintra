using CodeActivitiesLibrary.Extensions;
using SharpCompress.Archives;
using SharpCompress.Archives.Zip;
using SharpCompress.Common;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CompressionActivities
{
    [DisplayName("Zip Files")]
    [Description("Compress one or more files or folders into a zip archive.")]
    [ActivityMetaData(nodeImg: "/assets/Compression.svg")]
    public class ZipFilesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Source Paths")]
        [Description("Accepts: string[], List<string>, or comma-separated string of file/folder paths.")]
        public InArgument<object> SourcePaths { get; set; }

        [DisplayName("Compression Level")]
        [Description("The compression level to use: Optimal, Fastest, or NoCompression.")]
        [DefaultValue(CompressionLevel.Optimal)]
        public InArgument<CompressionLevel> CompressionLevelType { get; set; }

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
                    var input = SourcePaths.Get(context);
                    if (input == null)
                        throw new ArgumentException("SourcePaths cannot be null.");

                    string[] sourcePaths;

                    if (input is string[])
                    {
                        sourcePaths = (string[])input;
                    }
                    else if (input is IEnumerable<string>)
                    {
                        var list = (IEnumerable<string>)input;
                        sourcePaths = list.Where(s => !string.IsNullOrWhiteSpace(s)).ToArray();
                    }
                    else if (input is string str && !string.IsNullOrWhiteSpace(str))
                    {
                        sourcePaths = str.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                         .Select(p => p.Trim().Trim('"', '\'').Trim())
                                         .Where(p => !string.IsNullOrEmpty(p))
                                         .ToArray();
                    }
                    else
                    {
                        throw new ArgumentException(
                            $"Unsupported input type: {input?.GetType().Name}. " +
                            "Expected: string[], List<string>, or comma-separated string.");
                    }

                    if (!sourcePaths.Any())
                    {
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, "No valid source paths provided.");
                        return;
                    }
                    var outputZipPath = OutputZipPath.Get(context)?.Trim();
                    if (string.IsNullOrWhiteSpace(outputZipPath))
                        throw new ArgumentException("OutputZipPath cannot be null or empty.");

                    outputZipPath = outputZipPath.Trim('"', '\'');
                    if (!outputZipPath.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                        outputZipPath = Path.ChangeExtension(outputZipPath, ".zip");

                    var zipDir = Path.GetDirectoryName(outputZipPath);
                    if (!string.IsNullOrEmpty(zipDir) && !Directory.Exists(zipDir))
                        Directory.CreateDirectory(zipDir);

                    if (File.Exists(outputZipPath))
                        File.Delete(outputZipPath);

                    //  Collect All Files to Archive
                    var allFiles = new List<Tuple<string, string>>();

                    foreach (var rawPath in sourcePaths)
                    {
                        var cleanedPath = rawPath?.Trim().Trim('"', '\'').Trim();
                        if (string.IsNullOrWhiteSpace(cleanedPath)) continue;

                        var fullPath = Path.GetFullPath(cleanedPath);

                        if (File.Exists(fullPath))
                        {
                            allFiles.Add(Tuple.Create(fullPath, Path.GetFileName(fullPath)));
                        }
                        else if (Directory.Exists(fullPath))
                        {
                            var filesInDir = Directory.GetFiles(fullPath, "*", SearchOption.AllDirectories);
                            foreach (var file in filesInDir)
                            {
                                var relativePath = file.Substring(fullPath.Length)
                                    .TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                                    .Replace('\\', '/');
                                allFiles.Add(Tuple.Create(file, relativePath));
                            }
                        }
                        else
                        {
                            throw new FileNotFoundException($"Path not found: {fullPath}");
                        }
                    }

                    if (!allFiles.Any())
                    {
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, "No valid files found to archive.");
                        return;
                    }
                    // Create ZIP Archive     
                    var compressionLevel = CompressionLevelType.Get(context);

                    using (var zipFileStream = new FileStream(outputZipPath, FileMode.Create))
                    using (var archive = new System.IO.Compression.ZipArchive(zipFileStream, ZipArchiveMode.Create))
                    {
                        foreach (var fileEntry in allFiles)
                        {
                            archive.CreateEntryFromFile(fileEntry.Item1, fileEntry.Item2, compressionLevel);
                        }
                    }
                    var finalPath = Path.GetFullPath(outputZipPath);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Successfully created ZIP at '{finalPath}'.");
                    OutputZipFullPath.Set(context, finalPath);
                }
                catch (Exception ex)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Error zipping files: {ex.Message}");
                }
            }
        }
    }