using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Threading;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Wait for File")]
    [Description("Suspends running the flow until a file is created or deleted.")]
    public class WaitForFileActivity : Extensions.BaseNativeActivity
    {
       
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Wait for file to be")]
        [Description("Specifies whether to wait for the file to be Created or Deleted.")]
        public InArgument<WaitForFileAction> Action { get; set; }

       
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("File path")]
        [Description("The path to the file to monitor.")]
        public InArgument<string> FilePath { get; set; }

        [Category("Input")]
        [DisplayName("Fail with timeout error")]
        [Description("Indicates whether to fail with a timeout error if the file is not created/deleted within the specified time.")]
        public bool FailWithTimeoutError { get; set; }

        

        protected override void Execute(NativeActivityContext context)
        {
            // Get the input arguments
            var action = Action.Get(context);
            var filePath = FilePath.Get(context);

            // Validate inputs
            if (string.IsNullOrWhiteSpace(filePath))
            {
                throw new ArgumentException("File path cannot be empty.");
            }

            try
            {
                string status = string.Empty;

                // Use pattern matching for cleaner switch-case logic
                switch (action)
                {
                    case WaitForFileAction.Created:
                        status = WaitForFileCreation(context, filePath);
                        break;

                    case WaitForFileAction.Deleted:
                        status = WaitForFileDeletion(context, filePath);
                        break;

                    default:
                        throw new ArgumentException("Invalid action specified.");
                }

                // Set the status message
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                // Handle any exceptions
                StatusMessage.Set(context, $"Error waiting for file: {ex.Message}");
            }
        }

        private string WaitForFileCreation(NativeActivityContext context, string filePath)
        {
            int retryCount = 0;
            const int maxRetries = 10; // Maximum number of retries
            const int delayMilliseconds = 500; // Delay between checks (500ms)

            while (retryCount < maxRetries)
            {
                if (File.Exists(filePath))
                {
                    return $"File '{filePath}' was successfully created.";
                }

                Thread.Sleep(delayMilliseconds); // Wait before checking again
                retryCount++;
            }

            if (FailWithTimeoutError)
            {
                throw new TimeoutException($"File '{filePath}' was not created within the specified time.");
            }

            return $"File '{filePath}' was not created within the specified time.";
        }

        private string WaitForFileDeletion(NativeActivityContext context, string filePath)
        {
            int retryCount = 0;
            const int maxRetries = 10; // Maximum number of retries
            const int delayMilliseconds = 500; 
            while (retryCount < maxRetries)
            {
                if (!File.Exists(filePath))
                {
                    return $"File '{filePath}' was successfully deleted.";
                }

                Thread.Sleep(delayMilliseconds); // Wait before checking again
                retryCount++;
            }

            if (FailWithTimeoutError)
            {
                throw new TimeoutException($"File '{filePath}' was not deleted within the specified time.");
            }

            return $"File '{filePath}' was not deleted within the specified time.";
        }
    }
    public enum WaitForFileAction
    {
        [Display(Name = "Created")]
        [Description("Waits for the file to be created at the specified path.")]
        Created,

        [Display(Name = "Deleted")]
        [Description("Waits for the file to be deleted from the specified path.")]
        Deleted
    }
}