using CodeActivitiesLibrary.Activities.AppIntegrations.FTPActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Upload File to FTP")]
    [Description("Uploads a single file to an FTP server.")]
    public class UploadFilesToFtpActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FtpClient object representing an open connection to an FTP server.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Local File")]
        [Description("The local file path to upload.")]
        public InArgument<string> LocalFile { get; set; }

        [RequiredArgument]
        [DisplayName("Remote Directory")]
        [Description("The remote directory where the file should be uploaded.")]
        public InArgument<string> RemoteDirectory { get; set; }

        [DisplayName("Overwrite Mode")]
        [Description("Specifies when to overwrite the file on the server.")]
        [DefaultValue(OverwriteModeEnum.IfNewerOrSizeDifferent)]
        public InArgument<OverwriteModeEnum> OverwriteMode { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait before failing due to timeout.")]
        [DefaultValue(30)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Uploaded Files Count")]
        [Description("Returns the number of files successfully uploaded (0 or 1).")]
        public OutArgument<int> UploadedFilesCount { get; set; }

        [DisplayName("Skipped Files")]
        [Description("Returns the list containing the file that was skipped during upload, if any.")]
        public OutArgument<System.Collections.Generic.List<string>> SkippedFiles { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var uploadedCount = 0;
            var skippedFiles = new System.Collections.Generic.List<string>();

            try
            {
                var ftpClient = FtpConnection.Get(context);
                var filePath = LocalFile.Get(context);
                var remoteDir = RemoteDirectory.Get(context) ?? string.Empty;
                var overwriteMode = OverwriteMode.Expression != null
                    ? OverwriteMode.Get(context)
                    : OverwriteModeEnum.IfNewerOrSizeDifferent;

                if (ftpClient == null || !ftpClient.IsConnected)
                    throw new ArgumentException("FTP connection must be valid and active.");

                if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
                    throw new ArgumentException("The specified local file does not exist.");

                if (string.IsNullOrWhiteSpace(remoteDir))
                    throw new ArgumentException("Remote directory cannot be empty.");

                // Ensure remote directory exists
                if (!ftpClient.DirectoryExists(remoteDir))
                    ftpClient.CreateDirectory(remoteDir);

                // Set timeouts
                int timeoutMs = TimeoutSeconds.Get(context) * 1000;
                ftpClient.Config.ReadTimeout = timeoutMs;
                ftpClient.Config.DataConnectionConnectTimeout = timeoutMs;

                var fileName = Path.GetFileName(filePath);
                var remotePath = $"{remoteDir.TrimEnd('/')}/{fileName}";

                // Check overwrite conditions
                if (ftpClient.FileExists(remotePath))
                {
                    var localInfo = new FileInfo(filePath);
                    long remoteFileSize = -1;
                    DateTime remoteLastWriteTime = DateTime.MinValue;

                    try
                    {
                        remoteFileSize = ftpClient.GetFileSize(remotePath);
                        remoteLastWriteTime = ftpClient.GetModifiedTime(remotePath);
                    }
                    catch
                    {
                        remoteFileSize = -1;
                        remoteLastWriteTime = DateTime.MinValue;
                    }

                    bool shouldOverwrite = false;

                    switch (overwriteMode)
                    {
                        case OverwriteModeEnum.Always:
                            shouldOverwrite = true;
                            break;
                        case OverwriteModeEnum.Never:
                            shouldOverwrite = false;
                            break;
                        case OverwriteModeEnum.IfNewer:
                            shouldOverwrite = localInfo.LastWriteTime > remoteLastWriteTime;
                            break;
                        case OverwriteModeEnum.IfSizeDifferent:
                            shouldOverwrite = localInfo.Length != remoteFileSize;
                            break;
                        case OverwriteModeEnum.IfNewerOrSizeDifferent:
                            shouldOverwrite = localInfo.LastWriteTime > remoteLastWriteTime ||
                                              localInfo.Length != remoteFileSize;
                            break;
                        default:
                            shouldOverwrite = false;
                            break;
                    }

                    if (!shouldOverwrite)
                    {
                        skippedFiles.Add(filePath);
                        status = $"Skipped file (overwrite not allowed): {fileName}";
                        SetOutput(context, false, status, uploadedCount, skippedFiles);
                        return;
                    }
                }

                // Upload the file
                var uploadResult = ftpClient.UploadFile(filePath, remotePath, FtpRemoteExists.Overwrite, false);

                if (uploadResult == FtpStatus.Success)
                {
                    uploadedCount = 1;
                    status = $"File uploaded successfully to '{remotePath}'.";
                }
                else
                {
                    skippedFiles.Add(filePath);
                    status = $"File skipped due to upload failure: {fileName}";
                }

                SetOutput(context, true, status, uploadedCount, skippedFiles);
            }
            catch (Exception ex)
            {
                status = $"Error uploading file to FTP: {ex.Message}";
                Console.WriteLine(status);
                SetOutput(context, false, status, 0, skippedFiles);
            }
        }

        private void SetOutput(CodeActivityContext context, bool isSuccess, string status, int count, System.Collections.Generic.List<string> skipped)
        {
            IsSuccess.Set(context, isSuccess);
            StatusMessage.Set(context, status);
            UploadedFilesCount.Set(context, count);
            SkippedFiles.Set(context, skipped);
        }
    }
}
