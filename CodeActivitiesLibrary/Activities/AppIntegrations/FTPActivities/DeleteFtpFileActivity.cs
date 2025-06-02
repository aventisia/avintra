using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to delete an FTP file
    [DisplayName("Delete FTP File"), Description("Deletes one or more files from an FTP server.")]
    public class DeleteFtpFileActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The list of file names to delete.")]
        public InArgument<IEnumerable<string>> FilesToDelete { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            var filesToDelete = FilesToDelete.Get(context);
            var status = "";

            try
            {
                // Simulate deleting files from FTP (actual implementation would use FtpWebRequest or similar)
                status = $"Simulated deletion of {filesToDelete.Count()} files.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting files from FTP: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}