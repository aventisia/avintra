using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to download one or more folders from an FTP server
    [DisplayName("Download Folder(s) from FTP"), Description("Downloads one or more folders from an FTP server.")]
    public class DownloadFoldersFromFtpActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The FTP server URL (e.g., ftp://example.com).")]
        public InArgument<string> FtpServerUrl { get; set; }

        [RequiredArgument, Category("Input"), Description("The username for authentication.")]
        public InArgument<string> Username { get; set; }

        [RequiredArgument, Category("Input"), Description("The password for authentication.")]
        public InArgument<string> Password { get; set; }

        [RequiredArgument, Category("Input"), Description("The list of folder names to download.")]
        public InArgument<IEnumerable<string>> FoldersToDownload { get; set; }

        [RequiredArgument, Category("Input"), Description("The local directory to save the downloaded folders.")]
        public InArgument<string> LocalDirectory { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var ftpServerUrl = FtpServerUrl.Get(context);
            var username = Username.Get(context);
            var password = Password.Get(context);
            var foldersToDownload = FoldersToDownload.Get(context);
            var localDirectory = LocalDirectory.Get(context);
            var status = "";

            try
            {
                // Simulate downloading folders from FTP (actual implementation would use FtpWebRequest or similar)
                foreach (var folder in foldersToDownload)
                {
                    // Simulate downloading each folder
                    status = $"Simulated download of folder '{folder}' from '{ftpServerUrl}' to '{localDirectory}'.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error downloading folders from FTP: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

}