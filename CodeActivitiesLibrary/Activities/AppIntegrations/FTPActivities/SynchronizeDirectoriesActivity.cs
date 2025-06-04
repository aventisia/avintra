using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to synchronize directories
    [DisplayName("Synchronize Directories"),
     Description("Synchronizes the files and subdirectories of a given Folder with a given remote FTP directory.")]
    public class SynchronizeDirectoriesActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The local directory to synchronize.")]
        public InArgument<string> LocalDirectory { get; set; }

        [RequiredArgument, Category("Input"), Description("The remote directory on the FTP server.")]
        public InArgument<string> RemoteDirectory { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var localDirectory = LocalDirectory.Get(context);
            var remoteDirectory = RemoteDirectory.Get(context);
            var status = "";

            try
            {
                // Simulate synchronizing directories (actual implementation would use FtpWebRequest or similar)
                status = $"Simulated synchronization of '{localDirectory}' with '{remoteDirectory}'.";
            }
            catch (Exception ex)
            {
                status = $"Error synchronizing directories: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}