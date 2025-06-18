using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("If File Exists")]
    [Description("Checks if a file exists and marks the beginning of a conditional block of actions.")]
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

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var condition = Condition.Get(context);
                var filePath = FilePath.Get(context);

                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path cannot be empty.");

                var result = File.Exists(filePath);

                switch (condition)
                {
                    case FileExistenceEnum.Exists:
                        if (result)
                            StatusMessage.Set(context, $"File '{filePath}' exists.");
                        else
                            StatusMessage.Set(context, $"File '{filePath}' does not exist.");
                        break;

                    case FileExistenceEnum.DoesntExist:
                        if (!result)
                            StatusMessage.Set(context, $"File '{filePath}' does not exist.");
                        else
                            StatusMessage.Set(context, $"File '{filePath}' exists.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(condition));
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error checking file existence: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
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