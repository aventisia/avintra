using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Download File(s) from FTP")]
    [Description("Downloads one or more files from an FTP server.")]
    [ActivityMetaData(nodeImg: "/assets/FTP.svg")]

    public class DownloadFilesFromFtpActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [DisplayName("Download Multiple Files")]
        [Description("Whether to download a single file or multiple files.")]
        public InArgument<bool> DownloadMultipleFiles { get; set; } = false;

        [RequiredArgument]
        [DisplayName("File Name")]
        [Description("The name of the file to download.")]
        [RenderIfCondition(nameof(DownloadMultipleFiles), false)]
        public InArgument<string> FileName { get; set; }

        [DisplayName("File Name List")]
        [Description("The names of the file to download.")]
        [RenderIfCondition(nameof(DownloadMultipleFiles), true)]
        public InArgument<List<string>> FileNames { get; set; }

        [RequiredArgument]
        [DisplayName("Local Directory")]
        [Description("The local directory to save the downloaded files.")]
        public InArgument<string> LocalDirectory { get; set; }

        [DisplayName("Transfer Type")]
        [Description("The transfer type to use (ASCII or Binary).")]
        [DefaultValue(FileTransferType.Binary)]
        public InArgument<FileTransferType> TransferType { get; set; } = FileTransferType.Binary;

        [DisplayName("If File Exists")]
        [Description("The operation to perform if the file already exists locally.")]
        [DefaultValue(FileExistsOperation.Overwrite)]
        public InArgument<FileExistsOperation> IfFileExists { get; set; } = FileExistsOperation.Overwrite;

        [DisplayName("Downloaded Files Count")]
        [Description("Returns the number of files successfully downloaded.")]
        public OutArgument<int> DownloadedFilesCount { get; set; }

        [DisplayName("Skipped Files")]
        [Description("Returns the list of files that were skipped during download.")]
        public OutArgument<List<string>> SkippedFiles { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed.";
            var downloadedCount = 0;
            var skippedFiles = new List<string>();

            try
            {
                var connection = FtpConnection.Get(context);
                var localDirectory = LocalDirectory.Get(context);
                var ifFileExists = IfFileExists.Get(context);

                if (connection == null || !connection.IsConnected)
                    throw new ArgumentException("FTP connection must be valid and active.");

                if (!Directory.Exists(localDirectory))
                    Directory.CreateDirectory(localDirectory);

                if (DownloadMultipleFiles.Get(context))
                {
                    var fileNames = FileNames.Get(context) ?? new List<string>();
                    foreach (var fileName in fileNames)
                    {
                        if (!connection.FileExists(fileName))
                        {
                            skippedFiles.Add(fileName);
                            continue;
                        }

                        DownloadFile(connection, fileName, localDirectory, ifFileExists);
                        downloadedCount++;
                    }
                    status = $"Successfully downloaded {downloadedCount} files.";
                    if (skippedFiles.Count > 0)
                        status += $" Skipped: {string.Join(", ", skippedFiles)}";
                }
                else
                {
                    var fileName = FileName.Get(context);
                    if (!connection.FileExists(fileName))
                    {
                        status = $"File '{fileName}' does not exist on the server.";
                        skippedFiles.Add(fileName);
                    }
                    else
                    {
                        DownloadFile(connection, fileName, localDirectory, ifFileExists);
                        downloadedCount++;
                        status = $"File '{fileName}' downloaded successfully.";
                    }
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                DownloadedFilesCount.Set(context, downloadedCount);
                SkippedFiles.Set(context, skippedFiles);
            }
            catch (Exception ex)
            {
                status = $"Error downloading file(s): {ex.Message}";
                Console.WriteLine($"FTP Download Error: {ex}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
                DownloadedFilesCount.Set(context, null);
                SkippedFiles.Set(context, null);
            }
        }

        private void DownloadFile(FtpClient connection, string fileName, string localDirectory,
            FileExistsOperation ifFileExists)
        {
            var localFilePath = Path.Combine(localDirectory, fileName);
            var localFolder = Path.GetDirectoryName(localFilePath);
            if (!string.IsNullOrEmpty(localFolder))
            {
                Directory.CreateDirectory(localFolder);
            }

            switch (ifFileExists)
            {
                case FileExistsOperation.Overwrite:
                    connection.DownloadFile(localFilePath, fileName);
                    break;

                case FileExistsOperation.DontDownload:
                    if (File.Exists(localFilePath))
                        return;
                    connection.DownloadFile(localFilePath, fileName);
                    break;

                case FileExistsOperation.DownloadWithUniqueName:
                    // Generate a unique file name
                    var fileExt = Path.GetExtension(fileName);
                    var baseName = Path.GetFileNameWithoutExtension(fileName);
                    var i = 1;
                    while (File.Exists(localFilePath))
                    {
                        localFilePath = Path.Combine(localDirectory, $"{baseName}_{i}{fileExt}");
                        i++;
                    }

                    connection.DownloadFile(localFilePath, fileName);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        public enum FileTransferType
        {
            [Display(Name = "ASCII", Description = "ASCII transfer type.")]
            ASCII,

            [Display(Name = "Binary", Description = "Binary transfer type.")]
            Binary
        }

        public enum FileExistsOperation
        {
            [Display(Name = "Overwrite", Description = "Overwrite the file if it exists.")]
            Overwrite,

            [Display(Name = "Don't Download", Description = "Don't download the file if it exists.")]
            DontDownload,

            [Display(Name = "Download with Unique Name",
                Description = "Download the file with a unique name if it exists.")]
            DownloadWithUniqueName
        }
    }
}