using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Delete FTP File")]
    [Description("Deletes a single file from an FTP server.")]
    public class DeleteFtpFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("File Name")]
        [Description("The name of the file to delete.")]
        public InArgument<string> FileName { get; set; }

        [DisplayName("Deleted Files")]
        [Description("The file that was successfully deleted.")]
        public OutArgument<string> DeletedFile { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var connection = FtpConnection.Get(context);
                var fileName = FileName.Get(context);

                if (connection == null)
                {
                    throw new InvalidOperationException("FTP connection is null.");
                }

                if (string.IsNullOrWhiteSpace(fileName))
                {
                    throw new ArgumentException("File name is empty or null.");
                }

                // Delete the file
                connection.DeleteFile(fileName);

                // Set output
                DeletedFile.Set(context, fileName);

                // Set success
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"File '{fileName}' deleted successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error deleting file: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}