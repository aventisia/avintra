using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Folder to Copy")]
    [Description("The path of the source folder that you want to copy the folder")]
    public class CopyFolderActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Folder to Copy")]
        [Description("The path of the source folder that you want to duplicate.")]
        public InArgument<string> SourceFolder { get; set; }

        [RequiredArgument]
        [DisplayName("Destination Folder")]
        [Description("The path where the folder should be copied.")]
        public InArgument<string> DestinationFolder { get; set; }

        [RequiredArgument]
        [DisplayName("If Folder Exists")]
        [Description("Specifies what action to take if the destination folder already exists.")]
        [DefaultValue(IfExistsActionEnum.DoNothing)]
        public InArgument<IfExistsActionEnum> IfExistsAction { get; set; }


        [DisplayName("Copied Folder")]
        [Description("The copied folder path as a confirmation output.")]
        public OutArgument<string> CopiedFolder { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var source = SourceFolder.Get(context);
            var destination = DestinationFolder.Get(context);
            var action = IfExistsAction.Get(context);

            if (string.IsNullOrWhiteSpace(source))
                throw new ArgumentException("Source folder path cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(destination))
                throw new ArgumentException("Destination folder path cannot be null or empty.");

            if (!Directory.Exists(source))
                throw new DirectoryNotFoundException($"Source folder does not exist: {source}");

            var folderName = new DirectoryInfo(source).Name;
            var destinationPath = Path.Combine(destination, folderName);

            if (Directory.Exists(destinationPath))
                switch (action)
                {
                    case IfExistsActionEnum.DoNothing:
                        CopiedFolder.Set(context, destinationPath);
                        return;

                    case IfExistsActionEnum.Overwrite:
                        Directory.Delete(destinationPath, true);
                        break;
                }

            CopyAll(new DirectoryInfo(source), new DirectoryInfo(destinationPath));
            CopiedFolder.Set(context, destinationPath);
        }

        private void CopyAll(DirectoryInfo source, DirectoryInfo target)
        {
            Directory.CreateDirectory(target.FullName);

            foreach (var fi in source.GetFiles()) fi.CopyTo(Path.Combine(target.FullName, fi.Name), true);

            foreach (var subDir in source.GetDirectories())
            {
                var nextTargetSubDir = target.CreateSubdirectory(subDir.Name);
                CopyAll(subDir, nextTargetSubDir);
            }
        }
    }
}