using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Threading;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Wait For File"), Description("Suspends running the flow until a file is created or deleted.")]
    public class WaitForFileActivity : NativeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The full path of the file to wait for.")]
        public InArgument<string> FilePath { get; set; }

        [Category("Input")]
        [Description("Specifies whether to wait for file creation or deletion.")]
        public InArgument<WaitForFileModeEnum> Mode { get; set; } =
        new InArgument<WaitForFileModeEnum>(WaitForFileModeEnum.Create);

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(NativeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var mode = Mode.Get(context);
            var status = "";

            try
            {
                while (true)
                {
                    if (mode == WaitForFileModeEnum.Create && File.Exists(filePath))
                    {
                        status = $"File '{filePath}' created.";
                        break;
                    }

                    if (mode == WaitForFileModeEnum.Delete && !File.Exists(filePath))
                    {
                        status = $"File '{filePath}' deleted.";
                        break;
                    }

                    Thread.Sleep(1000); // Wait for 1 second before checking again
                }

                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error waiting for file: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }
    }

    public enum WaitForFileModeEnum
    {
        [Display(Name = "Wait For Creation", Description = "Waits until the file is created.")]
        Create = 0,

        [Display(Name = "Wait For Deletion", Description = "Waits until the file is deleted.")]
        Delete = 1
    }
}