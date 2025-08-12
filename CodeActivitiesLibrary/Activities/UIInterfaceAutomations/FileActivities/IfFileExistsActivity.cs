using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FileActivities
{
    [DisplayName("If File Exists")]
    [Description("Checks if a file exists or does not exist and marks the beginning of a conditional block.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/File.svg")]
    public class IfFileExistsActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Condition")]
        [Description("Specifies whether to check if the file exists or doesn't exist.")]
        [DefaultValue(FileExistenceEnum.Exists)]
        public InArgument<FileExistenceEnum> Condition { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path of the file to check.")]
        public InArgument<string> FilePath { get; set; }

        [DisplayName("Result")]
        [Description("Indicates whether the file meets the specified condition (exists or doesn't exist).")]
        public OutArgument<FileExistenceEnum?> Result { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var condition = Condition.Get(context);
                var filePath = FilePath.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path cannot be empty.", nameof(FilePath));

                if (filePath.IndexOfAny(Path.GetInvalidPathChars()) != -1)
                    throw new ArgumentException("File path contains invalid characters.", nameof(FilePath));

                // Check file existence
                var fileExists = File.Exists(filePath);

                // Determine result based on condition
                FileExistenceEnum? resultEnum = null;

                switch (condition)
                {
                    case FileExistenceEnum.Exists:
                        resultEnum = fileExists ? FileExistenceEnum.Exists : FileExistenceEnum.DoesntExist;
                        break;

                    case FileExistenceEnum.DoesntExist:
                        resultEnum = !fileExists ? FileExistenceEnum.DoesntExist : FileExistenceEnum.Exists;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(condition));
                }

                // Set result and status
                Result.Set(context, resultEnum);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"File '{filePath}' {(fileExists ? "exists" : "does not exist")}.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                Result.Set(context, null);
                StatusMessage.Set(context, $"Error checking file existence: {ex.Message}");
            }
        }
    }

    // Enum for specifying the condition
    public enum FileExistenceEnum
    {
        [Display(Name = "Exists", Description = "Indicates that the file should exist.")]
        Exists,

        [Display(Name = "Doesn't Exist", Description = "Indicates that the file should not exist.")]
        DoesntExist
    }
}