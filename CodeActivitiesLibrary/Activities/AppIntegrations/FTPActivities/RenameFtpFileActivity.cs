using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to rename an FTP file
    [DisplayName("Rename FTP File"), Description("Renames a file that resides on an FTP server.")]
    public class RenameFtpFileActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The old file name.")]
        public InArgument<string> OldFileName { get; set; }

        [RequiredArgument, Category("Input"), Description("The new file name.")]
        public InArgument<string> NewFileName { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var oldFileName = OldFileName.Get(context);
            var newFileName = NewFileName.Get(context);
            var status = "";

            try
            {
                // Simulate renaming FTP file (actual implementation would use FtpWebRequest or similar)
                status = $"Simulated renaming of file '{oldFileName}' to '{newFileName}'.";
            }
            catch (Exception ex)
            {
                status = $"Error renaming FTP file: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

}