using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("If Folder Exists")]
    [Description("Checks whether the specified folder exists or doesn't exist based on the selected condition.")]
    public class IfFolderExistsActivity : BaseCodeActivity
    {

        [RequiredArgument]
        [DisplayName("If Folder")]
        [Description("Select the condition to check for the folder (Exists or Doesn't exist).")]

        public InArgument<FolderCondition> Condition { get; set; } = new InArgument<FolderCondition>(FolderCondition.Exists);


        [RequiredArgument]
        [DisplayName("Folder Path")]
        [Description("The path of the folder to check for existence.")]

        public InArgument<string> FolderPath { get; set; }


        [DisplayName("Result")]
        [Description("Returns true if the folder meets the specified condition, otherwise false.")]

        public OutArgument<bool> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            FolderCondition condition = context.GetValue(Condition);
            string folderPath = context.GetValue(FolderPath);

            // Validate inputs
            if (string.IsNullOrWhiteSpace(folderPath))
            {
                throw new ArgumentException("The 'Folder Path' cannot be null or empty.");
            }

            bool result = false;
            string status = "";

            try
            {
                bool folderExists = Directory.Exists(folderPath);

                switch (condition)
                {
                    case FolderCondition.Exists:
                        result = folderExists;
                        status = folderExists
                            ? "Folder exists."
                            : "Folder does not exist.";
                        break;

                    case FolderCondition.DoesNotExist:
                        result = !folderExists;
                        status = !folderExists
                            ? "Folder does not exist."
                            : "Folder exists.";
                        break;

                    default:
                        throw new InvalidOperationException($"Unsupported condition: {condition}");
                }

                // Set output values
                context.SetValue(Result, result);
                context.SetValue(StatusMessage, status);
            }
            catch (Exception ex)
            {
                status = $"Error checking folder existence: {ex.Message}";
                context.SetValue(Result, false);
                context.SetValue(StatusMessage, status);
            }
        }
    }
    public enum FolderCondition
    {
        [Description("Check if the folder exists.")]
        Exists,

        [Description("Check if the folder does not exist.")]
        DoesNotExist
    }
}