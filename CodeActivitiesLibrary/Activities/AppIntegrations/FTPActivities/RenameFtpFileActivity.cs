using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("Rename FTP File")]
    [Description("Renames a file that resides on an FTP server.")]
    [ActivityMetaData(nodeImg:"/assets/FTP.svg")]

    public class RenameFtpFileActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FtpClient object representing an open connection to an FTP server.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Old File Name")]
        [Description("The original name of the file to be renamed.")]
        public InArgument<string> OldFileName { get; set; }

        [RequiredArgument]
        [DisplayName("New File Name")]
        [Description("The new name for the file.")]
        public InArgument<string> NewFileName { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait before failing due to timeout.")]
        [DefaultValue(30)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status;
            try
            {
                var ftpClient = FtpConnection.Get(context);
                var oldName = OldFileName.Get(context);
                var newName = NewFileName.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (ftpClient == null || !ftpClient.IsConnected)
                    throw new ArgumentException("FTP connection must be valid and active.");

                if (string.IsNullOrWhiteSpace(oldName))
                    throw new ArgumentException("Old file name cannot be empty.");

                if (string.IsNullOrWhiteSpace(newName))
                    throw new ArgumentException("New file name cannot be empty.");

                // Set timeouts
                ftpClient.Config.ConnectTimeout = (int)timeout.TotalMilliseconds;
                ftpClient.Config.ReadTimeout = (int)timeout.TotalMilliseconds;
                ftpClient.Config.DataConnectionConnectTimeout = (int)timeout.TotalMilliseconds;
                ftpClient.Config.DataConnectionReadTimeout = (int)timeout.TotalMilliseconds;

                // Normalize paths
                oldName = oldName.Trim('/');
                newName = newName.Trim('/');

                // Check if source exists
                if (!ftpClient.FileExists(oldName))
                    throw new FileNotFoundException($"File '{oldName}' not found on the server.");

                // Perform rename
                ftpClient.Rename(oldName, newName);

                // If it did not throw, assume success
                status = $"Successfully renamed '{oldName}' to '{newName}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);

            }
            catch (Exception ex)
            {
                status = $"Error renaming file: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            
        }
    }
}