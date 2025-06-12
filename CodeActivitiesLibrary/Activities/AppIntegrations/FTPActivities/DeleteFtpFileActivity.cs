using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    using FluentFTP;

    [DisplayName("Delete FTP File")]
    [Description("Deletes one or more files from an FTP server.")]
    public class DeleteFtpFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("File Names")]
        [Description("The list of file names to delete.")]
        public InArgument<IEnumerable<string>> FileNames { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var fileNames = FileNames.Get(context);
            var status = "";
            try
            {
                foreach (var fileName in fileNames)
                {
                    connection.DeleteFile(fileName);
                }

                status = "Files deleted successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting files: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}