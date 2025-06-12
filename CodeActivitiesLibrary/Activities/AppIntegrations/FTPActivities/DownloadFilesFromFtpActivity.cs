using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    [DisplayName("Download File(s) from FTP")]
    [Description("Downloads one or more files from an FTP server.")]
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

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var localDirectory = LocalDirectory.Get(context);
            var ifFileExists = IfFileExists.Get(context);

            var status = "";

            try
            {
                if (DownloadMultipleFiles.Get(context))
                {
                    var fileNames = FileNames.Get(context);
                    DownloadFiles(connection, fileNames, localDirectory, ifFileExists);
                    status = "Files downloaded successfully.";
                }
                else
                {
                    var fileName = FileName.Get(context);
                    DownloadFile(connection, fileName, localDirectory, ifFileExists);
                    status = "File downloaded successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error downloading file(s): {ex.Message}";
                // Handle exception
            }

            StatusMessage.Set(context, status);
        }

        private void DownloadFile(FtpClient connection, string fileName, string localDirectory,
            FileExistsOperation ifFileExists = FileExistsOperation.Overwrite)
        {
            var localFilePath = Path.Combine(localDirectory, fileName);
            switch (ifFileExists)
            {
                case FileExistsOperation.Overwrite:
                    connection.DownloadFile(fileName, localFilePath);
                    break;
                case FileExistsOperation.DontDownload:
                    if (File.Exists(localFilePath))
                        return;
                    connection.DownloadFile(fileName, localFilePath);
                    break;
                case FileExistsOperation.DownloadWithUniqueName:
                    // Generate a unique file name
                    var fileExt = Path.GetExtension(fileName);
                    var baseName = Path.GetFileNameWithoutExtension(fileName);
                    var i = 1;
                    while (File.Exists(localFilePath))
                    {
                        localFilePath = $"{localDirectory}/{baseName}_{i}{fileExt}";
                        i++;
                    }

                    connection.DownloadFile(fileName, localFilePath);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(ifFileExists), ifFileExists, null);
            }
        }

        private void DownloadFiles(FtpClient connection, List<string> fileNames, string localDirectory,
            FileExistsOperation ifFileExists = FileExistsOperation.Overwrite)
        {
            foreach (var fileName in fileNames)
            {
                DownloadFile(connection, fileName, localDirectory, ifFileExists);
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