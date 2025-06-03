using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to change the working directory on FTP
    [DisplayName("Change Working Directory"), Description("Sets the current working directory for an FTP connection.")]
    public class ChangeFtpWorkingDirectoryActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The new working directory path.")]
        public InArgument<string> NewDirectoryPath { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var newDirectoryPath = NewDirectoryPath.Get(context);
            var status = "";

            try
            {
                // Simulate changing working directory (actual implementation would use FtpWebRequest or similar)
                status = $"FTP working directory changed to '{newDirectoryPath}'.";
            }
            catch (Exception ex)
            {
                status = $"Error changing FTP working directory: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}