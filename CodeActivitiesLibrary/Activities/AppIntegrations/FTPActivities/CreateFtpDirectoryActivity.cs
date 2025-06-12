using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    [DisplayName("Create FTP Directory")]
    [Description("Creates a directory on an FTP server.")]
    public class CreateFtpDirectoryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Directory Name")]
        [Description("The name of the directory to create.")]
        public InArgument<string> DirectoryName { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var directoryName = DirectoryName.Get(context);
            var status = "";
            try
            {
                connection.CreateDirectory(directoryName);
                status = $"Directory '{directoryName}' created successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error creating directory: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}