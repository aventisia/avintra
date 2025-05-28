using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Get File Path Part"), Description("Retrieves one or more parts of a file path.")]
    public class GetFilePathPartActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The full path of the file.")]
        public InArgument<string> FilePath { get; set; }

        [Category("Input"), Description("Specifies which part of the file path to retrieve.")]
        public InArgument<FilePathPartEnum> Part { get; set; } =
            new InArgument<FilePathPartEnum>(FilePathPartEnum.Directory);

        [Category("Output"), Description("Returns the requested part of the file path.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var part = Part.Get(context);
            var result = "";
            var status = "";

            try
            {
                switch (part)
                {
                    case FilePathPartEnum.Directory:
                        result = Path.GetDirectoryName(filePath);
                        break;
                    case FilePathPartEnum.FileName:
                        result = Path.GetFileNameWithoutExtension(filePath);
                        break;
                    case FilePathPartEnum.Extension:
                        result = Path.GetExtension(filePath);
                        break;
                    case FilePathPartEnum.FullFileName:
                        result = Path.GetFileName(filePath);
                        break;
                    default:
                        throw new ArgumentException("Invalid file path part specified.");
                }

                Result.Set(context, result);
                status = "File path part retrieved successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error getting file path part: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

    public enum FilePathPartEnum
    {
        [Display(Name = "Directory", Description = "Directory of file.")]
        Directory = 0,

        [Display(Name = "FileName", Description = "FileName of file.")]
        FileName = 1,

        [Display(Name = "Directory", Description = "Extension of file.")]
        Extension = 2,

        [Display(Name = "Directory", Description = "FullFileName of file.")]
        FullFileName = 3
    }
}