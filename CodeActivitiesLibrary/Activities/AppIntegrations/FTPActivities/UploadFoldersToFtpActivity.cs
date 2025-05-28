using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to upload one or more folders to an FTP server
    [DisplayName("Upload Folder(s) to FTP"), Description("Uploads one or more folders to an FTP server.")]
    public class UploadFoldersToFtpActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The FTP server URL (e.g., ftp://example.com).")]
        public InArgument<string> FtpServerUrl { get; set; }

        [RequiredArgument, Category("Input"), Description("The username for authentication.")]
        public InArgument<string> Username { get; set; }

        [RequiredArgument, Category("Input"), Description("The password for authentication.")]
        public InArgument<string> Password { get; set; }

        [RequiredArgument, Category("Input"), Description("The list of local folder paths to upload.")]
        public InArgument<IEnumerable<string>> FoldersToUpload { get; set; }

        [RequiredArgument, Category("Input"), Description("The remote directory on the FTP server.")]
        public InArgument<string> RemoteDirectory { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var ftpServerUrl = FtpServerUrl.Get(context);
            var username = Username.Get(context);
            var password = Password.Get(context);
            var foldersToUpload = FoldersToUpload.Get(context);
            var remoteDirectory = RemoteDirectory.Get(context);
            var status = "";

            try
            {
                // Simulate uploading folders to FTP (actual implementation would use FtpWebRequest or similar)
                foreach (var folder in foldersToUpload)
                {
                    // Simulate uploading each folder
                    status = $"Simulated upload of folder '{folder}' to '{remoteDirectory}' on '{ftpServerUrl}'.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error uploading folders to FTP: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}