using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Security.Authentication;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    [DisplayName("Synchronize Directories")]
    [Description("Synchronizes the local directory with a remote FTP directory.")]
    public class SynchronizeDirectoriesActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FtpClient object representing an open connection to an FTP server.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Local Directory")]
        [Description("The local folder path to synchronize with the remote directory.")]
        public InArgument<string> LocalDirectory { get; set; }

        [RequiredArgument]
        [DisplayName("Remote Directory")]
        [Description("The remote folder path to synchronize with the local directory.")]
        public InArgument<string> RemoteDirectory { get; set; }

        [DisplayName("Sync Mode")]
        [Description(
            "Specifies whether to upload from local to remote, download from remote to local, or synchronize both ways.")]
        [DefaultValue(SyncModeEnum.Upload)]
        public InArgument<SyncModeEnum> SyncMode { get; set; }

        [DisplayName("File Comparison Method")]
        [Description("Specifies how to determine if a file needs to be synchronized.")]
        [DefaultValue(FileCompareMethodEnum.ByNameAndSize)]
        public InArgument<FileCompareMethodEnum> FileComparisonMethod { get; set; }

        [DisplayName("Delete Files Not Present Locally")]
        [Description("If true, deletes files from the remote directory that are not present in the local directory.")]
        public InArgument<bool> DeleteFilesNotPresentLocally { get; set; }

        [DisplayName("Include Subdirectories")]
        [Description("If true, includes subdirectories during synchronization.")]
        public InArgument<bool> IncludeSubDirectories { get; set; }

        [DisplayName("Overwrite Mode")]
        [Description("Specifies when to overwrite files on the remote server.")]
        [DefaultValue(OverwriteModeEnum.IfNewerOrSizeDifferent)]
        public InArgument<OverwriteModeEnum> OverwriteMode { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait before failing due to timeout.")]
        [DefaultValue(30)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Files Transferred")]
        [Description("Returns the number of files transferred during synchronization.")]
        public OutArgument<int> FilesTransferred { get; set; }

        [DisplayName("Directories Created")]
        [Description("Returns the number of directories created on the remote server.")]
        public OutArgument<int> DirectoriesCreated { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var filesTransferred = 0;
            var dirsCreated = 0;

            try
            {
                var ftpClient = FtpConnection.Get(context);
                var localDir = LocalDirectory.Get(context);
                var remoteDir = RemoteDirectory.Get(context);
                var syncMode = SyncMode.Get(context);
                var compareMethod = FileComparisonMethod.Get(context);
                var includeSubdirs = IncludeSubDirectories.Get(context);
                var deleteMissing = DeleteFilesNotPresentLocally.Get(context);
                var overwriteMode = OverwriteMode.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (ftpClient == null || !ftpClient.IsConnected)
                    throw new ArgumentException("FTP connection must be valid and active.");

                if (string.IsNullOrWhiteSpace(localDir) || !Directory.Exists(localDir))
                    throw new ArgumentException("Local directory does not exist.");

                if (string.IsNullOrWhiteSpace(remoteDir))
                    throw new ArgumentException("Remote directory cannot be empty.");

                // Set configuration
                ftpClient.Config.DataConnectionType = FtpDataConnectionType.AutoPassive;
                ftpClient.Config.EncryptionMode = ftpClient.Config.EncryptionMode;
                ftpClient.Config.ValidateAnyCertificate = true;
                ftpClient.Config.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11 | SslProtocols.Tls;

                switch (syncMode)
                {
                    case SyncModeEnum.Upload:
                        UploadDirectory(ftpClient, localDir, remoteDir, includeSubdirs, overwriteMode,
                            compareMethod, ref filesTransferred, ref dirsCreated);
                        break;

                    case SyncModeEnum.Download:
                        DownloadDirectory(ftpClient, localDir, remoteDir, includeSubdirs, overwriteMode,
                            compareMethod, ref filesTransferred, ref dirsCreated);
                        break;

                    case SyncModeEnum.Bidirectional:
                        // First upload, then download
                        UploadDirectory(ftpClient, localDir, remoteDir, includeSubdirs, overwriteMode,
                            compareMethod, ref filesTransferred, ref dirsCreated);

                        DownloadDirectory(ftpClient, localDir, remoteDir, includeSubdirs, overwriteMode,
                            compareMethod, ref filesTransferred, ref dirsCreated);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(syncMode));
                }

                status = $"Successfully synchronized '{localDir}' with '{remoteDir}'. " +
                         $"{filesTransferred} files transferred, {dirsCreated} directories created.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                FilesTransferred.Set(context, filesTransferred);
                DirectoriesCreated.Set(context, dirsCreated);
            }
            catch (Exception ex)
            {
                status = $"Error synchronizing directories: {ex.Message}";
                FilesTransferred.Set(context, null);
                DirectoriesCreated.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }


        }

        private void UploadDirectory(FtpClient client, string localDir, string remoteDir,
            bool includeSubdirs, OverwriteModeEnum overwriteMode, FileCompareMethodEnum compareMethod,
            ref int filesTransferred, ref int dirsCreated)
        {
            // Create remote directory if it doesn't exist
            if (!client.DirectoryExists(remoteDir))
            {
                client.CreateDirectory(remoteDir);
                dirsCreated++;
            }

            // Upload files
            foreach (var file in Directory.GetFiles(localDir))
            {
                var fileName = Path.GetFileName(file);
                var remoteFile = remoteDir + "/" + fileName;

                if (!ShouldUpload(client, file, remoteFile, overwriteMode)) continue;
                if (client.UploadFile(file, remoteFile, FtpRemoteExists.Overwrite, false) == FtpStatus.Success)
                {
                    filesTransferred++;
                }
            }

            if (includeSubdirs)
            {
                foreach (var dir in Directory.GetDirectories(localDir))
                {
                    var dirName = new DirectoryInfo(dir).Name;
                    var remoteSubdir = remoteDir + "/" + dirName;

                    UploadDirectory(client, dir, remoteSubdir, includeSubdirs, overwriteMode, compareMethod,
                        ref filesTransferred, ref dirsCreated);
                }
            }
        }

        private void DownloadDirectory(FtpClient client, string localDir, string remoteDir,
            bool includeSubdirs, OverwriteModeEnum overwriteMode, FileCompareMethodEnum compareMethod,
            ref int filesTransferred, ref int dirsCreated)
        {
            if (!Directory.Exists(localDir))
                Directory.CreateDirectory(localDir);

            // Get list of files from remote
            var remoteItems = client.GetListing(remoteDir, FtpListOption.AllFiles);
            foreach (var item in remoteItems)
            {
                if (item.Type == FtpObjectType.File)
                {
                    var localFile = Path.Combine(localDir, item.Name);
                    var remoteFile = remoteDir + "/" + item.Name;

                    if (!ShouldDownload(client, localFile, remoteFile, overwriteMode)) continue;
                    if (client.DownloadFile(localFile, remoteFile) == FtpStatus.Success)
                    {
                        filesTransferred++;
                    }
                }
                else if (item.Type == FtpObjectType.Directory && includeSubdirs)
                {
                    var localSubdir = Path.Combine(localDir, item.Name);
                    var remoteSubdir = remoteDir + "/" + item.Name;

                    if (!Directory.Exists(localSubdir))
                    {
                        Directory.CreateDirectory(localSubdir);
                        dirsCreated++;
                    }

                    DownloadDirectory(client, localSubdir, remoteSubdir, includeSubdirs, overwriteMode,
                        compareMethod, ref filesTransferred, ref dirsCreated);
                }
            }
        }

        private bool ShouldUpload(FtpClient client, string localFile, string remoteFile, OverwriteModeEnum mode)
        {
            if (!client.FileExists(remoteFile))
                return true;

            if (mode == OverwriteModeEnum.Always)
                return true;

            if (mode == OverwriteModeEnum.Never)
                return false;

            var localInfo = new FileInfo(localFile);
            var remoteInfo = client.GetFileSize(remoteFile);
            var remoteTime = client.GetModifiedTime(remoteFile);

            if (mode == OverwriteModeEnum.IfNewer)
            {
                return localInfo.LastWriteTime > remoteTime;
            }

            if (mode == OverwriteModeEnum.IfSizeDifferent)
            {
                return localInfo.Length != remoteInfo;
            }

            if (mode == OverwriteModeEnum.IfNewerOrSizeDifferent)
            {
                return localInfo.LastWriteTime > remoteTime || localInfo.Length != remoteInfo;
            }

            return false;
        }

        private bool ShouldDownload(FtpClient client, string localFile, string remoteFile, OverwriteModeEnum mode)
        {
            if (!File.Exists(localFile))
                return true;

            if (mode == OverwriteModeEnum.Always)
                return true;

            if (mode == OverwriteModeEnum.Never)
                return false;

            var remoteInfo = client.GetFileSize(remoteFile);
            var remoteTime = client.GetModifiedTime(remoteFile);
            var localInfo = new FileInfo(localFile);

            if (mode == OverwriteModeEnum.IfNewer)
            {
                return remoteTime > localInfo.LastWriteTime;
            }

            if (mode == OverwriteModeEnum.IfSizeDifferent)
            {
                return remoteInfo != localInfo.Length;
            }

            if (mode == OverwriteModeEnum.IfNewerOrSizeDifferent)
            {
                return remoteTime > localInfo.LastWriteTime || remoteInfo != localInfo.Length;
            }

            return false;
        }
    }

    public enum SyncModeEnum
    {
        [Display(Name = "Upload", Description = "Uploads files from local to remote only.")]
        Upload,

        [Display(Name = "Download", Description = "Downloads files from remote to local only.")]
        Download,

        [Display(Name = "Bidirectional", Description = "Synchronizes both directions.")]
        Bidirectional
    }

    public enum FileCompareMethodEnum
    {
        [Display(Name = "By Name and Size", Description = "Compares files by name and size.")]
        ByNameAndSize,

        [Display(Name = "By Name Only", Description = "Only compares files by name.")]
        ByNameOnly,

        [Display(Name = "By Name and Date", Description = "Compares files by name and last modified date.")]
        ByNameAndDate
    }

    public enum OverwriteModeEnum
    {
        [Display(Name = "Always", Description = "Always overwrite files.")]
        Always,

        [Display(Name = "Never", Description = "Never overwrite files.")]
        Never,

        [Display(Name = "If newer", Description = "Overwrite if remote file is newer.")]
        IfNewer,

        [Display(Name = "If size different", Description = "Overwrite if file sizes differ.")]
        IfSizeDifferent,

        [Display(Name = "If newer or size different", Description = "Overwrite if remote is newer or size differs.")]
        IfNewerOrSizeDifferent
    }
}