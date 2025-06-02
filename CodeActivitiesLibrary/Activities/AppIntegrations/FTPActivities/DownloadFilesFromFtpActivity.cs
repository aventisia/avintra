using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to download files from FTP
    [DisplayName("Download File(s) from FTP"), Description("Downloads one or more files from an FTP server.")]
    public class DownloadFilesFromFtpActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The list of file names to download.")]
        public InArgument<IEnumerable<string>> FilesToDownload { get; set; }

        [RequiredArgument, Category("Input"), Description("The local directory to save the downloaded files.")]
        public InArgument<string> LocalDirectory { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var filesToDownload = FilesToDownload.Get(context);
            var localDirectory = LocalDirectory.Get(context);
            var status = "";

            try
            {
                // Simulate downloading files from FTP (actual implementation would use FtpWebRequest or similar)
                status = $"Simulated download of {filesToDownload.Count()} files to '{localDirectory}'.";
            }
            catch (Exception ex)
            {
                status = $"Error downloading files from FTP: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}