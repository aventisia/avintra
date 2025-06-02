using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to upload files to FTP
    [DisplayName("Upload File(s) to FTP"), Description("Uploads one or more files to an FTP server.")]
    public class UploadFilesToFtpActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The list of local file paths to upload.")]
        public InArgument<IEnumerable<string>> FilesToUpload { get; set; }

        [RequiredArgument, Category("Input"), Description("The remote directory on the FTP server.")]
        public InArgument<string> RemoteDirectory { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var filesToUpload = FilesToUpload.Get(context);
            var remoteDirectory = RemoteDirectory.Get(context);
            var status = "";

            try
            {
                // Simulate uploading files to FTP (actual implementation would use FtpWebRequest or similar)
                status = $"Simulated upload of {filesToUpload.Count()} files to '{remoteDirectory}'.";
            }
            catch (Exception ex)
            {
                status = $"Error uploading files to FTP: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}