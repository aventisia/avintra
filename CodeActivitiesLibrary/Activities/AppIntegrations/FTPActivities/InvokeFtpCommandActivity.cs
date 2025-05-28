using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to invoke an FTP command
    [DisplayName("Invoke FTP Command"), Description("Invokes the given literal FTP command on the server.")]
    public class InvokeFtpCommandActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The FTP command to execute.")]
        public InArgument<string> Command { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var command = Command.Get(context);
            var status = "";

            try
            {
                // Simulate invoking FTP command (actual implementation would use FtpWebRequest or similar)
                status = $"Simulated execution of FTP command: '{command}'.";
            }
            catch (Exception ex)
            {
                status = $"Error invoking FTP command: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}