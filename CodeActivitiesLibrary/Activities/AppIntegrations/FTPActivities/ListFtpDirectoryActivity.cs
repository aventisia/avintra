using CodeActivitiesLibrary.Extensions;
using FluentFTP;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.FtpActivities
{
    [DisplayName("List FTP Directory")]
    [Description("Retrieves subdirectories and files in the current directory of an FTP connection.")]
    public class ListFtpDirectoryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("FTP Connection")]
        [Description("The FTP connection object.")]
        public InArgument<FtpClient> FtpConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Directory Name")]
        [Description("The name of the directory to create.")]
        public InArgument<string> DirectoryName { get; set; }

        [DisplayName("List Type")]
        [Description("Specifies the type of items to list in the FTP directory.")]
        [DefaultValue(ListTypeEnum.FilesAndFolders)]
        public InArgument<ListTypeEnum> ListType { get; set; }

        [DisplayName("Files and Folders Result")]
        [Description("Returns the list subdirectories and files.")]
        public OutArgument<List<string>> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var connection = FtpConnection.Get(context);
                var listType = ListType.Get(context);
                var path = DirectoryName.Get(context);

                var result = ListItems(connection, listType, path);
                // set result;
                Result.Set(context, result.ToList());
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Retrieved List FTP Directory succesfully");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error to retrived list FTP Directory: {ex.Message}");
            }
        }

        private static IEnumerable<string> ListItems(FtpClient client, ListTypeEnum listType, string path)
        {
            var ftpListItems = client.GetListing(path);
            switch (listType)
            {
                case ListTypeEnum.Files:
                    return ftpListItems.Where(item => item.Type == FtpObjectType.File).Select(item => item.Name);
                case ListTypeEnum.Folders:
                    return ftpListItems.Where(item => item.Type == FtpObjectType.Directory).Select(item => item.Name);
                case ListTypeEnum.FilesAndFolders:
                    return ftpListItems.Select(item => item.Name);
                default:
                    throw new ArgumentException("Invalid ListType.");
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