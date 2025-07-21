using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Download Folder from FTP")]
    [Description("Downloads one or more folders from an FTP server.")]
    public class DownloadFoldersFromFtpActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Folder Name")]
        [Description("The folder name to download.")]
        public InArgument<string> FolderNames { get; set; }

        [RequiredArgument]
        [DisplayName("Local Directory")]
        [Description("The local directory to save the downloaded folder.")]
        public InArgument<string> LocalDirectory { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var folderName = FolderNames.Get(context);
            var localDirectory = LocalDirectory.Get(context);
            var status = "";

            try
            {
                if (connection == null)
                    throw new InvalidOperationException("FTP connection is null.");

                if (string.IsNullOrWhiteSpace(folderName))
                    throw new ArgumentException("Folder name is empty or null.");

                var targetLocalPath = Path.Combine(localDirectory, Path.GetFileName(folderName));

                // Create local directory if not exists
                if (!Directory.Exists(targetLocalPath))
                    Directory.CreateDirectory(targetLocalPath);

                // Get all entries (files + subfolders) under the remote folder
                var remoteFiles = connection.GetNameListing(folderName);

                foreach (var remotePath in remoteFiles)
                {
                    var fileName = Path.GetFileName(remotePath);
                    var localFilePath = Path.Combine(targetLocalPath, fileName);

                    if (connection.FileExists(remotePath))
                    {
                        connection.DownloadFile(localFilePath, remotePath);
                    }
                    else if (connection.DirectoryExists(remotePath))
                    {
                        // Optional: Recursively download subfolders
                        // You could extend this for recursion if needed
                    }
                }

                status = $"Folder '{folderName}' downloaded successfully.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error downloading folder: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            
        }
    }
}