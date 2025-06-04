using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to delete an FTP directory
    [DisplayName("Delete FTP Directory"), Description("Deletes a directory from an FTP server.")]
    public class DeleteFtpDirectoryActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the directory to delete.")]
        public InArgument<string> DirectoryName { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var directoryName = DirectoryName.Get(context);
            var status = "";

            try
            {
                // Simulate deleting FTP directory (actual implementation would use FtpWebRequest or similar)
                status = $"Simulated deletion of directory '{directoryName}'.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting FTP directory: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}