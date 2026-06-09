using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Delete FTP Directory")]
    [Description("Deletes a directory from an FTP server.")]
    [ActivityMetaData(nodeImg: "/assets/FTP.svg")]

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
                // check directory exists before attempting to delete
                if (!connection.DirectoryExists(directoryName))
                {
                    status = $"Directory '{directoryName}' does not exist.";
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, status);
                    return;
                }

                // delete directory
                connection.DeleteDirectory(directoryName);
                status = $"Directory '{directoryName}' deleted successfully.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error deleting directory: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

        }
    }
}