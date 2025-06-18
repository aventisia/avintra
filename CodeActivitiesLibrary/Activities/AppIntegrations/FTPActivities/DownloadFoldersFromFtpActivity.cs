using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Download Folder(s) from FTP")]
    [Description("Downloads one or more folders from an FTP server.")]
    public class DownloadFoldersFromFtpActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Folder Names")]
        [Description("The list of folder names to download.")]
        public InArgument<List<string>> FolderNames { get; set; }

        [RequiredArgument]
        [DisplayName("Local Directory")]
        [Description("The local directory to save the downloaded folders.")]
        public InArgument<string> LocalDirectory { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var folderNames = FolderNames.Get(context);
            var localDirectory = LocalDirectory.Get(context);
            var status = "";
            try
            {
                foreach (var folderName in folderNames)
                {
                    // Create the directory if it doesn't exist
                    if (!Directory.Exists(Path.Combine(localDirectory, folderName)))
                        Directory.CreateDirectory(Path.Combine(localDirectory, folderName));
                    // Download files in the folder
                    var files = connection.GetNameListing($"{folderName}");
                    var downloadFileStream = connection.DownloadFiles(localDirectory, files);
                    //TODO need to handle the downloadFileStream properly
                }

                status = $"Folders downloaded successfully.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error downloading folders: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

        }
    }
}