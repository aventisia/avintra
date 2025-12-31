using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FolderActivities
{
    [DisplayName("Retrieve Subfolders from Directory")]
    [Description("Returns a list of subfolder paths within the specified directory.")]
    [ActivityMetaData(nodeImg: "/assets/Folder.svg")]
    public class GetSubfoldersInFolderActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Source Folder Path")]
        [Description("The full path of the directory from which subfolders will be retrieved.")]
        public InArgument<string> FolderPath { get; set; }


        [DisplayName("Include Nested Subfolders")]
        [Description("Determines whether to include all nested subdirectories recursively.")]
        [DefaultValue(false)]
        public InArgument<bool> IncludeSubfolders { get; set; } = false;


        [DisplayName("Subfolder List")]
        [Description("The collection of subfolder paths found in the specified directory.")]
        public OutArgument<IEnumerable<string>> Subfolders { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var folderPath = FolderPath.Get(context);
                var includeSubfolders = IncludeSubfolders.Get(context);

                if (string.IsNullOrWhiteSpace(folderPath))
                    throw new ArgumentException("Folder path must not be null or empty.", nameof(FolderPath));

                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"The specified folder does not exist: {folderPath}");

                var searchOption = includeSubfolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
                var subfolders = Directory.GetDirectories(folderPath, "*", searchOption).ToList();

                Subfolders.Set(context, subfolders);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Subfolders retrieved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving subfolders: {ex.Message}");
            }
        }

    }
}