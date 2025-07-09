using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
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

        // Output Arguments
       
        [DisplayName("Deleted Files")]
        [Description("List of files that were successfully deleted.")]
        public OutArgument<IEnumerable<string>> DeletedFiles { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = FtpConnection.Get(context);
            var fileNames = FileNames.Get(context);

            var deletedFiles = new List<string>();

            try
            {
                foreach (var fileName in fileNames)
                {
                    try
                    {
                        connection.DeleteFile(fileName);
                        deletedFiles.Add(fileName);
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue with next file
                        Console.WriteLine($"Failed to delete {fileName}: {ex.Message}");
                    }
                }

                // Set output arguments
                DeletedFiles.Set(context, deletedFiles);

                // Determine overall success
                IsSuccess.Set(context, deletedFiles.Count > 0);
                StatusMessage.Set(context, deletedFiles.Count > 0
                    ? $"{deletedFiles.Count} file(s) deleted successfully."
                    : "No files were deleted.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error during FTP operation: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}