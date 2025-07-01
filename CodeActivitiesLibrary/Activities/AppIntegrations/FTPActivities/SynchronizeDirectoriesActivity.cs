using CodeActivitiesLibrary.Activities.AppIntegrations.FTPActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Security.Authentication;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
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
        [Description("If true, deletes files from the target location that are not present in the source.")]
        public InArgument<bool> DeleteFilesNotPresentLocally { get; set; }

        [DisplayName("Include Subdirectories")]
        [Description("If true, includes subdirectories during synchronization.")]
        public InArgument<bool> IncludeSubDirectories { get; set; }

        [DisplayName("Overwrite Mode")]
        [Description("Specifies when to overwrite files.")]
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
        [Description("Returns the number of directories created during synchronization.")]
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
                ftpClient.Config.ValidateAnyCertificate = true;
                ftpClient.Config.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11 | SslProtocols.Tls;

                switch (syncMode)
                {
                    case SyncModeEnum.Upload:
                        UploadDirectory(ftpClient, localDir, remoteDir, includeSubdirs, overwriteMode, compareMethod, ref filesTransferred, ref dirsCreated, deleteMissing);
                        break;
                    case SyncModeEnum.Download:
                        DownloadDirectory(ftpClient, localDir, remoteDir, includeSubdirs, overwriteMode, compareMethod, ref filesTransferred, ref dirsCreated, deleteMissing);
                        break;
                    case SyncModeEnum.Bidirectional:
                        UploadDirectory(ftpClient, localDir, remoteDir, includeSubdirs, overwriteMode, compareMethod, ref filesTransferred, ref dirsCreated, deleteMissing);
                        DownloadDirectory(ftpClient, localDir, remoteDir, includeSubdirs, overwriteMode, compareMethod, ref filesTransferred, ref dirsCreated, deleteMissing);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(syncMode));
                }

                status = $"Synchronization complete: {filesTransferred} files transferred, {dirsCreated} directories created.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                FilesTransferred.Set(context, filesTransferred);
                DirectoriesCreated.Set(context, dirsCreated);
            }
            catch (Exception ex)
            {
                status = $"Error during synchronization: {ex.Message}";
                FilesTransferred.Set(context, null);
                DirectoriesCreated.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        // ------------------------
        // Upload logic
        // ------------------------
        private void UploadDirectory(FtpClient client, string localDir, string remoteDir,
            bool includeSubdirs, OverwriteModeEnum overwriteMode, FileCompareMethodEnum compareMethod,
            ref int filesTransferred, ref int dirsCreated, bool deleteFilesNotPresentLocally)
        {
            if (!client.DirectoryExists(remoteDir))
            {
                client.CreateDirectory(remoteDir);
                dirsCreated++;
            }

            var localFiles = Directory.GetFiles(localDir);
            foreach (var file in localFiles)
            {
                var remoteFile = remoteDir + "/" + Path.GetFileName(file);

                if (!ShouldUpload(client, file, remoteFile, overwriteMode, compareMethod)) continue;

                if (client.UploadFile(file, remoteFile, FtpRemoteExists.Overwrite, false) == FtpStatus.Success)
                    filesTransferred++;
            }

            if (deleteFilesNotPresentLocally)
            {
                var remoteFiles = client.GetNameListing(remoteDir);
                foreach (var remoteItem in remoteFiles)
                {
                    var remoteName = Path.GetFileName(remoteItem);
                    var localPath = Path.Combine(localDir, remoteName);

                    if (!File.Exists(localPath) && client.FileExists(remoteItem))
                        client.DeleteFile(remoteItem);
                }
            }

            if (includeSubdirs)
            {
                foreach (var dir in Directory.GetDirectories(localDir))
                {
                    var remoteSubdir = remoteDir + "/" + Path.GetFileName(dir);
                    UploadDirectory(client, dir, remoteSubdir, includeSubdirs, overwriteMode, compareMethod, ref filesTransferred, ref dirsCreated, deleteFilesNotPresentLocally);
                }
            }
        }

        // ------------------------
        // Download logic
        // ------------------------
        private void DownloadDirectory(FtpClient client, string localDir, string remoteDir,
            bool includeSubdirs, OverwriteModeEnum overwriteMode, FileCompareMethodEnum compareMethod,
            ref int filesTransferred, ref int dirsCreated, bool deleteFilesNotPresentLocally)
        {
            if (!Directory.Exists(localDir))
                Directory.CreateDirectory(localDir);

            var remoteItems = client.GetListing(remoteDir, FtpListOption.AllFiles);
            foreach (var item in remoteItems)
            {
                if (item.Type == FtpObjectType.File)
                {
                    var localFile = Path.Combine(localDir, item.Name);
                    var remoteFile = remoteDir + "/" + item.Name;

                    if (!ShouldDownload(client, localFile, remoteFile, overwriteMode, compareMethod)) continue;

                    if (client.DownloadFile(localFile, remoteFile) == FtpStatus.Success)
                        filesTransferred++;
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

                    DownloadDirectory(client, localSubdir, remoteSubdir, includeSubdirs, overwriteMode, compareMethod, ref filesTransferred, ref dirsCreated, deleteFilesNotPresentLocally);
                }
            }

            if (deleteFilesNotPresentLocally)
            {
                foreach (var local in Directory.GetFiles(localDir))
                {
                    var name = Path.GetFileName(local);
                    var remoteFile = remoteDir + "/" + name;
                    if (!client.FileExists(remoteFile) && File.Exists(local))
                        File.Delete(local);
                }
            }
        }

        // ------------------------
        // Compare helpers
        // ------------------------
        private bool ShouldUpload(FtpClient client, string localFile, string remoteFile, OverwriteModeEnum mode, FileCompareMethodEnum compareMethod)
        {
            if (!client.FileExists(remoteFile))
                return true;

            var localInfo = new FileInfo(localFile);
            var remoteSize = client.GetFileSize(remoteFile);
            var remoteTime = client.GetModifiedTime(remoteFile);

            switch (compareMethod)
            {
                case FileCompareMethodEnum.ByNameOnly:
                    return true;
                case FileCompareMethodEnum.ByNameAndSize:
                    return localInfo.Length != remoteSize;
                case FileCompareMethodEnum.ByNameAndDate:
                    return localInfo.LastWriteTime > remoteTime;
            }

            return false;
        }

        private bool ShouldDownload(FtpClient client, string localFile, string remoteFile, OverwriteModeEnum mode, FileCompareMethodEnum compareMethod)
        {
            if (!File.Exists(localFile))
                return true;

            var localInfo = new FileInfo(localFile);
            var remoteSize = client.GetFileSize(remoteFile);
            var remoteTime = client.GetModifiedTime(remoteFile);

            switch (compareMethod)
            {
                case FileCompareMethodEnum.ByNameOnly:
                    return true;
                case FileCompareMethodEnum.ByNameAndSize:
                    return remoteSize != localInfo.Length;
                case FileCompareMethodEnum.ByNameAndDate:
                    return remoteTime > localInfo.LastWriteTime;
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
}
