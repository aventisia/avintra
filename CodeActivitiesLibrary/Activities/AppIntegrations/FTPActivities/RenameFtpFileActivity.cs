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


        [DisplayName("Success")]
        [Description("Returns true if the file was successfully renamed.")]
        public OutArgument<bool> Success { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var success = false;

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
                ftpClient.Config.ReadTimeout = timeout.Milliseconds;
                ftpClient.Config.DataConnectionConnectTimeout = timeout.Milliseconds;
                ftpClient.Config.DataConnectionReadTimeout = timeout.Milliseconds;

                // Check if file exists
                if (!ftpClient.FileExists(oldName))
                    throw new FileNotFoundException($"File '{oldName}' not found on the server.");

                // Rename the file
                ftpClient.Rename(oldName, newName);

                var result = ftpClient.FileExists(newName);

                if (!result)
                    throw new IOException($"Failed to rename '{oldName}' to '{newName}'.");

                status = $"Successfully renamed '{oldName}' to '{newName}'.";
                success = true;
                Success.Set(context, success);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error renaming file: {ex.Message}";
                success = false;
                Success.Set(context, success);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }

        }
    }
}