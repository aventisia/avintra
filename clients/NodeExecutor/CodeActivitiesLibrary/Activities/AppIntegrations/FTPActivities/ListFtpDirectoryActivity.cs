using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("List FTP Directory")]
    [Description("Retrieves subdirectories and files in the current directory of an FTP connection.")]
    [ActivityMetaData(nodeImg:"/assets/FTP.svg")]

    public class ListFtpDirectoryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Directory Name")]
        [Description("The name of the directory to list contents from.")]
        public InArgument<string> DirectoryName { get; set; }

        [DisplayName("List Type")]
        [Description("Specifies the type of items to list in the FTP directory.")]
        [DefaultValue(ListTypeEnum.FilesAndFolders)]
        public InArgument<ListTypeEnum> ListType { get; set; }

        [DisplayName("Files and Folders Result")]
        [Description("Returns the list of subdirectories and files.")]
        public OutArgument<List<string>> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed.";
            List<string> result = new List<string>();
            bool success = false;

            try
            {
                var connection = FtpConnection.Get(context);
                var path = DirectoryName.Get(context);
                var listType = ListType.Get(context);

                // Validate inputs
                if (connection == null || !connection.IsConnected)
                    throw new ArgumentException("FTP connection must be valid and active.");

                if (string.IsNullOrWhiteSpace(path))
                    throw new ArgumentException("Directory path cannot be empty.");

                if (!connection.DirectoryExists(path))
                    throw new DirectoryNotFoundException($"Directory '{path}' does not exist on the server.");

                // Retrieve items
                result = ListItems(connection, listType, path).ToList();

                // Output result
                Result.Set(context, result);
                status = $"Successfully retrieved {result.Count} item(s) from '{path}'.";
                success = true;
            }
            catch (Exception ex)
            {
                status = $"Error retrieving FTP directory listing: {ex.Message}";
                Console.WriteLine($"FTP Listing Error: {ex}");
                result = null;
                success = false;
            }
            finally
            {
                IsSuccess.Set(context, success);
                StatusMessage.Set(context, status);
                Result.Set(context, result);
            }
        }

        private static IEnumerable<string> ListItems(FtpClient client, ListTypeEnum listType, string path)
        {
            var ftpListItems = client.GetListing(path);
            switch (listType)
            {
                case ListTypeEnum.Files:
                    return ftpListItems
                        .Where(item => item.Type == FtpObjectType.File)
                        .Select(item => item.Name);
                case ListTypeEnum.Folders:
                    return ftpListItems
                        .Where(item => item.Type == FtpObjectType.Directory)
                        .Select(item => item.Name);
                case ListTypeEnum.FilesAndFolders:
                    return ftpListItems.Select(item => item.Name);
                default:
                    throw new ArgumentException("Invalid ListType value.", nameof(listType));
            }
        }

        public enum ListTypeEnum
        {
            [Display(Name = "Files and Folders", Description = "List both files and folders.")]
            FilesAndFolders,

            [Display(Name = "Files", Description = "List only files.")]
            Files,

            [Display(Name = "Folders", Description = "List only folders.")]
            Folders
        }
    }
}