using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{

    [DisplayName("Get File Path Components")]
    [Description("Extracts various parts (directory, name, extension) from the given file path.")]
    public class GetFilePathPartsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Source File Path")]
        [Description("The full path of the file from which to extract components.")]
        public InArgument<string> FilePath { get; set; }


        [DisplayName("Root Path")]
        [Description("The root path of the source file.")]
        public OutArgument<string> RootPath { get; set; }


        [DisplayName("Directory Path")]
        [Description("The directory of the source file.")]
        public OutArgument<string> Directory { get; set; }


        [DisplayName("File Name")]
        [Description("The name of the source file.")]
        public OutArgument<string> FileName { get; set; }


        [DisplayName("File Name Without Extension")]
        [Description("The file name (without the extension) of the source file.")]
        public OutArgument<string> FileNameNoExtension { get; set; }


        [DisplayName("File Extension")]
        [Description("The extension (for example, .doc) of the source file.")]
        public OutArgument<string> FileExtension { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);

            if (string.IsNullOrWhiteSpace(filePath))
            {
                throw new ArgumentException("FilePath cannot be null or empty.");
            }

            RootPath.Set(context, Path.GetPathRoot(filePath));
            Directory.Set(context, Path.GetDirectoryName(filePath));
            FileName.Set(context, Path.GetFileName(filePath));
            FileNameNoExtension.Set(context, Path.GetFileNameWithoutExtension(filePath));
            FileExtension.Set(context, Path.GetExtension(filePath));
        }
    }
}