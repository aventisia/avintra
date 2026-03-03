using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;
using System.Security;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Open FTP Connection")]
    [Description(
        "Establishes a specific connection to a remote FTP server and stores that connection as a variable for later use.")]
    [ActivityMetaData(nodeImg:"/assets/FTP.svg")]

    public class OpenFtpConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Host")]
        [Description("The FTP server URL (e.g., ftp.example.com).")]
        public InArgument<string> Host { get; set; }

        [DisplayName("Port")]
        [Description("The port number for the FTP connection (default is21).")]
        [DefaultValue(21)]
        public InArgument<int> Port { get; set; }

        [DisplayName("Active Mode")]
        [Description("If true, uses active mode for FTP connection.")]
        public InArgument<bool> ActiveMode { get; set; }

        [RequiredArgument]
        [DisplayName("Username")]
        [Description("The username for authentication.")]
        public InArgument<string> Username { get; set; }

        [RequiredArgument]
        [DisplayName("Password")]
        [Description("The password for authentication.")]
        public InArgument<SecureString> Password { get; set; }

        [DisplayName("FTP Connection")]
        [Description("The connection object for the opened FTP connection.")]
        public OutArgument<FtpClient> FtpConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var host = Host.Get(context);
                var port = Port.Get(context);
                var activeMode = ActiveMode.Get(context);
                var username = Username.Get(context);
                var password = ConvertSecureStringToString(Password.Get(context));
                if (string.IsNullOrWhiteSpace(host))
                    throw new ArgumentException("Host cannot be empty.");
                if (port <= 0)
                    throw new ArgumentException("Port must be greater than0.");
                if (string.IsNullOrWhiteSpace(username))
                    throw new ArgumentException("Username cannot be empty.");
                if (string.IsNullOrWhiteSpace(password))
                    throw new ArgumentException("Password cannot be empty.");
                var client = new FtpClient(host, port);
                client.Credentials = new System.Net.NetworkCredential(username, password);
                client.Config = new FtpConfig()
                {
                    DataConnectionType = activeMode ? FtpDataConnectionType.PORT : FtpDataConnectionType.PASV
                };
                client.Connect();
                FtpConnection.Set(context, client);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "FTP connection open successfully");
            }
            catch (Exception ex)
            {
                // Status message is handled by BaseCodeActivity
                FtpConnection.Set(context, null);
                StatusMessage.Set(context, $"Failed to connect to FTP server: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}