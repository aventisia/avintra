using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Change Working Directory")]
    [Description("Sets the current working directory for an FTP connection.")]
    public class ChangeFtpWorkingDirectoryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("New Directory Path")]
        [Description("The new working directory path.")]
        public InArgument<string> NewDirectoryPath { get; set; }

        // Output Arguments
        [DisplayName("Actual Directory Path")]
        [Description("Returns the actual directory path after change.")]
        public OutArgument<string> ActualDirectoryPath { get; set; }

        [DisplayName("Success")]
        [Description("Indicates whether the operation was successful.")]
        public OutArgument<bool> Success { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var newDirectoryPath = NewDirectoryPath.Get(context);
            var actualPath = newDirectoryPath;
            var success = false;
            var status = "";
            try
            {
                connection.SetWorkingDirectory(newDirectoryPath);
                actualPath = connection.GetWorkingDirectory();
                success = true;
                status = $"Successfully changed working directory to: {actualPath}";

                ActualDirectoryPath.Set(context, actualPath);
                Success.Set(context, success);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error deleting directory: {ex.Message}";
                ActualDirectoryPath.Set(context, actualPath);
                Success.Set(context, success);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
        }
    }
}