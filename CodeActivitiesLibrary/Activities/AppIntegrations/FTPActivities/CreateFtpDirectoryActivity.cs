using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to create an FTP directory
    [DisplayName("Create FTP Directory"), Description("Creates a directory on an FTP server.")]
    public class CreateFtpDirectoryActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the directory to create.")]
        public InArgument<string> DirectoryName { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var directoryName = DirectoryName.Get(context);
            var status = "";

            try
            {
                // Simulate creating FTP directory (actual implementation would use FtpWebRequest or similar)
                status = $"Simulated creation of directory '{directoryName}'.";
            }
            catch (Exception ex)
            {
                status = $"Error creating FTP directory: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}