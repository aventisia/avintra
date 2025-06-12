using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    using FluentFTP;

    [DisplayName("Delete FTP Directory")]
    [Description("Deletes a directory from an FTP server.")]
    public class DeleteFtpDirectoryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Directory Name")]
        [Description("The name of the directory to delete.")]
        public InArgument<string> DirectoryName { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var directoryName = DirectoryName.Get(context);
            var status = "";
            try
            {
                connection.DeleteDirectory(directoryName);
                status = $"Directory '{directoryName}' deleted successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting directory: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}