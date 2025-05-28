using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{

    // Activity to list FTP directory contents
    [DisplayName("List FTP Directory"),
     Description("Retrieves the subdirectories and files contained in the current directory of an FTP connection.")]
    public class ListFtpDirectoryActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection ID or token for the FTP connection.")]
        public InArgument<string> ConnectionId { get; set; }

        [Category("Output"), Description("Returns the list of subdirectories and files in the current directory.")]
        public OutArgument<IEnumerable<string>> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connectionId = ConnectionId.Get(context);
            IEnumerable<string> result = null;
            var status = "";

            try
            {
                // Simulate listing FTP directory contents (actual implementation would use FtpWebRequest or similar)
                result = new List<string> { "file1.txt", "file2.txt", "subdir/" };
                status = "FTP directory listed successfully.";
            }
            catch (Exception ex)
            {
                result = null;
                status = $"Error listing FTP directory: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }


}