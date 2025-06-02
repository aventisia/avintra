using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Retrieve Subfolders from Directory")]
    [Description("Returns a list of subfolder paths within the specified directory.")]
    public class GetSubfoldersInFolderActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Source Folder Path")]
        [Description("The full path of the directory from which subfolders will be retrieved.")]
        public InArgument<string> FolderPath { get; set; }

        [Category("Input")]
        [DisplayName("Include Nested Subfolders")]
        [Description("Determines whether to include all nested subdirectories recursively.")]
        [DefaultValue(false)]
        public InArgument<bool> IncludeSubfolders { get; set; } = false;

        [Category("Output")]
        [DisplayName("Subfolder List")]
        [Description("The collection of subfolder paths found in the specified directory.")]
        public OutArgument<IEnumerable<string>> Subfolders { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string folderPath = FolderPath.Get(context);
            bool includeSubfolders = IncludeSubfolders.Get(context);

            if (string.IsNullOrWhiteSpace(folderPath))
                throw new ArgumentException("Folder path must not be null or empty.", nameof(FolderPath));

            if (!Directory.Exists(folderPath))
                throw new DirectoryNotFoundException($"The specified folder does not exist: {folderPath}");

            var searchOption = includeSubfolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
            var subfolders = Directory.GetDirectories(folderPath, "*", searchOption).ToList();

            Subfolders.Set(context, subfolders);
        }
    }
}