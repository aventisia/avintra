using CodeActivitiesLibrary.AppIntegrations.FTPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    using FluentFTP;

    [DisplayName("Invoke FTP Command")]
    [Description("Invokes the given literal FTP command on the server.")]
    public class InvokeFtpCommandActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Command")]
        [Description("The FTP command to execute.")]
        public InArgument<string> Command { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var command = Command.Get(context);
            var status = "";
            try
            {
                var response = connection.ExecuteCommand(command);
                status = response;
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error invoking FTP command: {ex.Message}";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
        }
    }
}