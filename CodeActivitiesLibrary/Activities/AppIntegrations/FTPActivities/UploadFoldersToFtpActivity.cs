using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Authentication;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
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
        [DefaultValue(true)]
        public InArgument<bool> OverwriteFiles { get; set; }

        [DisplayName("Include Subdirectories")]
        [Description("If true, uploads all subdirectories recursively.")]
        [DefaultValue(true)]
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

        [DisplayName("Skipped Folders")]
        [Description("Returns the list of folders that were skipped during upload.")]
        public OutArgument<List<string>> SkippedFolders { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            var result = new UploadResult();
            var status = "Operation completed successfully.";

            try
            {
                var ftpClient = FtpConnection.Get(context);
                var localFolders = LocalFolders.Get(context) ?? new List<string>();
                var remoteDir = RemoteDirectory.Get(context) ?? string.Empty;
                var overwrite = OverwriteFiles.Get(context);
                var includeSubdirs = IncludeSubDirectories.Get(context);
                var timeout = TimeoutSeconds.Get(context);

                if (ftpClient == null)
                    throw new ArgumentException("FTP connection must not be null.");

                if (!ftpClient.IsConnected)
                {
                    ftpClient.Connect(); // Ensure connection is active
                }

                if (!localFolders.Any())
                    throw new ArgumentException("No folders specified for upload.");

                if (string.IsNullOrWhiteSpace(remoteDir))
                    throw new ArgumentException("Remote directory cannot be empty.");

                // Set FTP client configuration
                ftpClient.Config.DataConnectionType = FtpDataConnectionType.AutoPassive;
                ftpClient.Config.ValidateAnyCertificate = true;
                ftpClient.Config.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11 | SslProtocols.Tls;
                ftpClient.Config.ReadTimeout = timeout * 1000;
                ftpClient.Config.DataConnectionConnectTimeout = timeout * 1000;

                // Ensure remote root exists
                if (!ftpClient.DirectoryExists(remoteDir))
                    ftpClient.CreateDirectory(remoteDir);

                // Upload each folder
                foreach (var folderPath in localFolders)
                {
                    if (!Directory.Exists(folderPath))
                    {
                        result.SkippedFolders.Add(folderPath);
                        continue;
                    }

                    var folderName = new DirectoryInfo(folderPath).Name;
                    var targetDir = $"{remoteDir.TrimEnd('/')}/{folderName}";

                    if (!ftpClient.DirectoryExists(targetDir))
                        ftpClient.CreateDirectory(targetDir);

                    var folderResult = UploadFolder(ftpClient, folderPath, targetDir, includeSubdirs, overwrite);
                    result.FilesUploaded += folderResult.FilesUploaded;
                    result.SkippedFiles.AddRange(folderResult.SkippedFiles);
                    result.FoldersUploaded++;
                }

                status = $"Successfully uploaded {result.FoldersUploaded} folders containing {result.FilesUploaded} files to '{remoteDir}'.";

                // Set output values
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                FoldersUploadedCount.Set(context, result.FoldersUploaded);
                FilesUploadedCount.Set(context, result.FilesUploaded);
                SkippedFiles.Set(context, result.SkippedFiles);
                SkippedFolders.Set(context, result.SkippedFolders);
            }
            catch (Exception ex)
            {
                status = $"Error uploading folders to FTP: {ex.Message}";
                Console.WriteLine($"Error uploading folders: {ex}");

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
                FoldersUploadedCount.Set(context, 0);
                FilesUploadedCount.Set(context, 0);
                SkippedFiles.Set(context, result.SkippedFiles);
                SkippedFolders.Set(context, result.SkippedFolders);
            }
        }

        private UploadResult UploadFolder(
            FtpClient client,
            string localPath,
            string remotePath,
            bool includeSubdirs,
            bool overwrite)
        {
            var result = new UploadResult();

            try
            {
                // Upload files in current directory
                foreach (var file in Directory.GetFiles(localPath))
                {
                    if (!File.Exists(file))
                    {
                        result.SkippedFiles.Add(file);
                        continue;
                    }

                    var fileName = Path.GetFileName(file);
                    var remoteFile = $"{remotePath.TrimEnd('/')}/{fileName}";

                    if (client.FileExists(remoteFile) && !overwrite)
                    {
                        result.SkippedFiles.Add(file);
                        continue;
                    }

                    var uploadStatus = client.UploadFile(file, remoteFile, FtpRemoteExists.Overwrite, false);
                    if (uploadStatus == FtpStatus.Success)
                    {
                        result.FilesUploaded++;
                    }
                    else
                    {
                        result.SkippedFiles.Add(file);
                    }
                }

                // Recursively upload subdirectories
                if (includeSubdirs)
                {
                    foreach (var dir in Directory.GetDirectories(localPath))
                    {
                        var dirName = new DirectoryInfo(dir).Name;
                        var targetSubdir = $"{remotePath.TrimEnd('/')}/{dirName}";

                        if (!client.DirectoryExists(targetSubdir))
                            client.CreateDirectory(targetSubdir);

                        var subResult = UploadFolder(client, dir, targetSubdir, includeSubdirs, overwrite);
                        result.FilesUploaded += subResult.FilesUploaded;
                        result.SkippedFiles.AddRange(subResult.SkippedFiles);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading folder '{localPath}': {ex.Message}");
            }

            return result;
        }

        private class UploadResult
        {
            public int FoldersUploaded { get; set; } = 0;
            public int FilesUploaded { get; set; } = 0;
            public List<string> SkippedFiles { get; set; } = new List<string>();
            public List<string> SkippedFolders { get; set; } = new List<string>();
        }
    }
}