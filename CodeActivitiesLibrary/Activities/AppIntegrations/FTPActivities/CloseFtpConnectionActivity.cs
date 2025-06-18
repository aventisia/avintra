using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    [DisplayName("Close Connection")]
    [Description("Closes an open FTP connection.")]
    public class CloseFtpConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Ftp Connection")]
        [Description("The FtpConnection object to close.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var status = "";
            try
            {
                connection?.Dispose();
                status = "FTP connection closed successfully.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error closing FTP connection: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}