using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to close an FTP connection
    [DisplayName("Close Connection"), Description("Closes an open FTP connection.")]
    public class CloseFtpConnectionActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var status = "";

            try
            {
                // Simulate closing FTP connection (actual implementation would use FtpWebRequest or similar)
                status = "FTP connection closed successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error closing FTP connection: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}