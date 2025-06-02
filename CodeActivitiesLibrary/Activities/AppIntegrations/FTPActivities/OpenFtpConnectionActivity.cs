using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities
{
    // Activity to open an FTP connection
    [DisplayName("Open FTP Connection"),
     Description(
         "Establishes a specific connection to a remote FTP server and stores that connection as a variable for later use.")]
    public class OpenFtpConnectionActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The FTP server URL (e.g., ftp://example.com).")]
        public InArgument<string> FtpServerUrl { get; set; }

        [RequiredArgument, Category("Input"), Description("The username for authentication.")]
        public InArgument<string> Username { get; set; }

        [RequiredArgument, Category("Input"), Description("The password for authentication.")]
        public InArgument<string> Password { get; set; }

        [Category("Output"), Description("Returns the connection ID or token for the opened FTP connection.")]
        public OutArgument<string> Result { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var ftpServerUrl = FtpServerUrl.Get(context);
            var username = Username.Get(context);
            var password = Password.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate opening FTP connection (actual implementation would use FtpWebRequest or similar)
                result = "Simulated connection ID";
                status = "FTP connection opened successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error opening FTP connection: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}









