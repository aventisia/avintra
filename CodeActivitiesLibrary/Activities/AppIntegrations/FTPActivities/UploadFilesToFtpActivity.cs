using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    [DisplayName("Upload File(s) to FTP")]
    [Description("Uploads one or more files to an FTP server.")]
    public class UploadFilesToFtpActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FtpClient object representing an open connection to an FTP server.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Local Files")]
        [Description("The list of local file paths to upload.")]
        public InArgument<List<string>> LocalFiles { get; set; }


        [RequiredArgument]
        [DisplayName("Remote Directory")]
        [Description("The remote directory where files should be uploaded.")]
        public InArgument<string> RemoteDirectory { get; set; }


        [DisplayName("Overwrite Mode")]
        [Description("Specifies when to overwrite files on the server.")]
        [DefaultValue(OverwriteModeEnum.IfNewerOrSizeDifferent)]
        public InArgument<OverwriteModeEnum> OverwriteMode { get; set; }


        [DisplayName("Include Subdirectories")]
        [Description("If true, includes subdirectories when uploading multiple files.")]
        public InArgument<bool> IncludeSubDirectories { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait before failing due to timeout.")]
        [DefaultValue(30)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Status Message")]
        [Description("Returns status information about the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        [DisplayName("Uploaded Files Count")]
        [Description("Returns the number of files successfully uploaded.")]
        public OutArgument<int> UploadedFilesCount { get; set; }


        [DisplayName("Skipped Files")]
        [Description("Returns the list of files that were skipped during upload.")]
        public OutArgument<List<string>> SkippedFiles { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var uploadedCount = 0;
            var skippedFiles = new List<string>();

            try
            {
                var ftpClient = FtpConnection.Get(context);
                var localFiles = LocalFiles.Get(context);
                var remoteDir = RemoteDirectory.Get(context);
                var overwriteMode = OverwriteMode.Get(context);
                var includeSubDirs = IncludeSubDirectories.Get(context);

                if (ftpClient == null || !ftpClient.IsConnected)
                    throw new ArgumentException("FTP connection must be valid and active.");

                if (localFiles == null || !localFiles.Any())
                    throw new ArgumentException("No files specified for upload.");

                if (string.IsNullOrWhiteSpace(remoteDir))
                    throw new ArgumentException("Remote directory cannot be empty.");

                // Ensure remote directory exists
                if (!ftpClient.DirectoryExists(remoteDir))
                    ftpClient.CreateDirectory(remoteDir);

                // Set timeouts
                ftpClient.Config.ReadTimeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context)).Milliseconds;
                ftpClient.Config.DataConnectionConnectTimeout = ftpClient.Config.ReadTimeout;

                // Upload each file
                foreach (var filePath in localFiles)
                {
                    if (!File.Exists(filePath))
                    {
                        skippedFiles.Add(filePath);
                        continue;
                    }

                    var fileName = Path.GetFileName(filePath);
                    var remotePath = remoteDir + "/" + fileName;

                    // Check overwrite conditions
                    if (ftpClient.FileExists(remotePath))
                    {
                        var localInfo = new FileInfo(filePath);
                        var remoteInfo = ftpClient.GetFileSize(remotePath);
                        var remoteTime = ftpClient.GetModifiedTime(remotePath);

                        var shouldOverwrite = false;

                        switch (overwriteMode)
                        {
                            case OverwriteModeEnum.Always:
                                shouldOverwrite = true;
                                break;
                            case OverwriteModeEnum.Never:
                                shouldOverwrite = false;
                                break;
                            case OverwriteModeEnum.IfNewer:
                                shouldOverwrite = localInfo.LastWriteTime > remoteTime;
                                break;
                            case OverwriteModeEnum.IfSizeDifferent:
                                shouldOverwrite = localInfo.Length != remoteInfo;
                                break;
                            case OverwriteModeEnum.IfNewerOrSizeDifferent:
                                shouldOverwrite = localInfo.LastWriteTime > remoteTime ||
                                                  localInfo.Length != remoteInfo;
                                break;
                        }

                        if (!shouldOverwrite)
                        {
                            skippedFiles.Add(filePath);
                            continue;
                        }
                    }

                    // Upload the file
                    var success = false;
                    if (ftpClient is FtpClient ftp)
                    {
                        ftp.UploadFile(filePath, remotePath, FtpRemoteExists.Overwrite);
                        success = ftp.FileExists(remotePath);
                    }

                    if (success)
                    {
                        uploadedCount++;
                    }
                    else
                    {
                        skippedFiles.Add(filePath);
                    }
                }

                status = $"Successfully uploaded {uploadedCount} files to '{remoteDir}'.";
                if (skippedFiles.Count > 0)
                {
                    status += $" Skipped {skippedFiles.Count} files.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error uploading files to FTP: {ex.Message}";
            }

            StatusMessage.Set(context, status);
            UploadedFilesCount.Set(context, uploadedCount);
            SkippedFiles.Set(context, skippedFiles);
        }
    }
}