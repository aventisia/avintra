using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Security.Authentication;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    [DisplayName("Upload Folder(s) to FTP")]
    [Description("Uploads one or more local folders to a remote FTP/FTPS server.")]
    public class UploadFoldersToFtpActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FtpClient object representing an open connection to an FTP server.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Local Folders")]
        [Description("The list of local folder paths to upload.")]
        public InArgument<List<string>> LocalFolders { get; set; }

        [RequiredArgument]
        [DisplayName("Remote Directory")]
        [Description("The remote directory where folders should be uploaded.")]
        public InArgument<string> RemoteDirectory { get; set; }

        [DisplayName("Overwrite Files")]
        [Description("If true, overwrites existing files on the server.")]
        public InArgument<bool> OverwriteFiles { get; set; }

        [DisplayName("Include Subdirectories")]
        [Description("If true, uploads all subdirectories recursively.")]
        public InArgument<bool> IncludeSubDirectories { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait before failing due to timeout.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Folders Uploaded Count")]
        [Description("Returns the number of folders successfully uploaded.")]
        public OutArgument<int> FoldersUploadedCount { get; set; }

        [DisplayName("Files Uploaded Count")]
        [Description("Returns the total number of files uploaded.")]
        public OutArgument<int> FilesUploadedCount { get; set; }

        [DisplayName("Skipped Files")]
        [Description("Returns the list of files that were skipped during upload.")]
        public OutArgument<List<string>> SkippedFiles { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var foldersUploaded = 0;
            var filesUploaded = 0;
            var skippedFiles = new List<string>();

            try
            {
                var ftpClient = FtpConnection.Get(context);
                var localFolders = LocalFolders.Get(context);
                var remoteDir = RemoteDirectory.Get(context);
                var overwrite = OverwriteFiles.Get(context);
                var includeSubdirs = IncludeSubDirectories.Get(context);

                if (ftpClient == null || !ftpClient.IsConnected)
                    throw new ArgumentException("FTP connection must be valid and active.");

                if (localFolders == null || !localFolders.Any())
                    throw new ArgumentException("No folders specified for upload.");

                if (string.IsNullOrWhiteSpace(remoteDir))
                    throw new ArgumentException("Remote directory cannot be empty.");

                // Set configuration
                ftpClient.Config.DataConnectionType = FtpDataConnectionType.AutoPassive;
                ftpClient.Config.EncryptionMode = ftpClient.Config.EncryptionMode;
                ftpClient.Config.ValidateAnyCertificate = true;
                ftpClient.Config.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11 | SslProtocols.Tls;
                ftpClient.Config.ReadTimeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context)).Milliseconds;
                ftpClient.Config.DataConnectionConnectTimeout = ftpClient.Config.ReadTimeout;

                // Ensure remote root exists
                if (!ftpClient.DirectoryExists(remoteDir))
                    ftpClient.CreateDirectory(remoteDir);

                // Upload each folder
                foreach (var folderPath in localFolders)
                {
                    if (!Directory.Exists(folderPath))
                    {
                        skippedFiles.Add(folderPath);
                        continue;
                    }

                    var folderName = new DirectoryInfo(folderPath).Name;
                    var targetDir = remoteDir + "/" + folderName;

                    // Create remote directory
                    if (!ftpClient.DirectoryExists(targetDir))
                        ftpClient.CreateDirectory(targetDir);

                    // Upload files
                    UploadFolder(ftpClient, folderPath, targetDir, includeSubdirs, overwrite, ref filesUploaded,
                        ref skippedFiles);
                    foldersUploaded++;
                }

                status =
                    $"Successfully uploaded {foldersUploaded} folders containing {filesUploaded} files to '{remoteDir}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                FoldersUploadedCount.Set(context, foldersUploaded);
                FilesUploadedCount.Set(context, filesUploaded);
                SkippedFiles.Set(context, skippedFiles);
            }
            catch (Exception ex)
            {
                status = $"Error uploading folders to FTP: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
                FoldersUploadedCount.Set(context, null);
                FilesUploadedCount.Set(context, null);
                SkippedFiles.Set(context, null);
            }
        }

        private void UploadFolder(
            FtpClient client,
            string localPath,
            string remotePath,
            bool includeSubdirs,
            bool overwrite,
            ref int fileCount,
            ref List<string> skippedList)
        {
            try
            {
                // Upload files in current directory
                foreach (var file in Directory.GetFiles(localPath))
                {
                    var fileName = Path.GetFileName(file);
                    var remoteFile = $"{remotePath}/{fileName}";

                    if (client.FileExists(remoteFile))
                    {
                        if (!overwrite)
                        {
                            skippedList.Add(file);
                            continue;
                        }

                        // Optional: Compare dates or sizes
                        var localInfo = new FileInfo(file);
                        var remoteInfo = client.GetFileSize(remoteFile);
                    }

                    // Upload file
                    if (client.UploadFile(file, remoteFile, FtpRemoteExists.Overwrite, false) == FtpStatus.Success)
                    {
                        fileCount++;
                    }
                }

                // Recursively upload subdirectories
                if (includeSubdirs)
                {
                    foreach (var dir in Directory.GetDirectories(localPath))
                    {
                        var dirName = new DirectoryInfo(dir).Name;
                        var targetSubdir = $"{remotePath}/{dirName}";
                        if (!client.DirectoryExists(targetSubdir))
                            client.CreateDirectory(targetSubdir);
                        UploadFolder(client, dir, targetSubdir, includeSubdirs, overwrite, ref fileCount,
                            ref skippedList);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading folder '{localPath}': {ex.Message}");
            }
        }
    }
}