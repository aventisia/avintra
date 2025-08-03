using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities
{
    [DisplayName("Run Application")]
    [Description("Executes an application or opens a document by executing the associated application.")]
    public class RunApplicationActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Application path")]
        [Description("The path to the application or document to execute.")]
        public InArgument<string> ApplicationPath { get; set; }


        [DisplayName("Command line arguments")]
        [Description("Optional command-line arguments to pass to the application.")]
        public InArgument<string> CommandLineArguments { get; set; }


        [DisplayName("Working folder")]
        [Description("The working directory for the application.")]
        public InArgument<string> WorkingFolder { get; set; }


        [DisplayName("Window style")]
        [Description("Specifies how the application window should be displayed.")]
        public InArgument<WindowStyleEnum> WindowStyle { get; set; }


        [DisplayName("After application launch")]
        [Description("Specifies the behavior after launching the application.")]
        public InArgument<AfterApplicationLaunchEnum> AfterApplicationLaunch { get; set; }


        [DisplayName("Timeout")]
        [Description("The maximum time (in seconds) to wait for the application to complete.")]
        [DefaultValue(0)]
        [RenderIfCondition(nameof(AfterApplicationLaunch), AfterApplicationLaunchEnum.WaitForApplicationToComplete)]
        public InArgument<int> Timeout { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("AppProcessId")]
        [Description("The process ID of the launched application.")]
        public OutArgument<int> AppProcessId { get; set; }


        [DisplayName("AppExitCode")]
        [Description("The exit code of the application if it completes.")]
        [RenderIfCondition(nameof(AfterApplicationLaunch), AfterApplicationLaunchEnum.WaitForApplicationToComplete)]
        public OutArgument<int> AppExitCode { get; set; }


        [DisplayName("Status Message")]
        [Description("Provides status information about the operation.")]
        public OutArgument<string> StatusMessages { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var applicationPath = ApplicationPath.Get(context);
                var commandLineArguments = CommandLineArguments.Get(context);
                var workingFolder = WorkingFolder.Get(context);
                var windowStyle = WindowStyle.Get(context);
                var afterApplicationLaunch = AfterApplicationLaunch.Get(context);
                var timeout = Timeout.Get(context);

                // Validate input
                if (string.IsNullOrWhiteSpace(applicationPath))
                    throw new ArgumentException("Application path cannot be empty.");

                // Start the application
                var startInfo = new ProcessStartInfo
                {
                    FileName = applicationPath,
                    Arguments = commandLineArguments,
                    WorkingDirectory = workingFolder,
                    WindowStyle = GetWindowStyle(windowStyle),
                    CreateNoWindow = windowStyle == WindowStyleEnum.Hidden
                };

                using (var process = new Process { StartInfo = startInfo })
                {
                    process.Start();
                    AppProcessId.Set(context, process.Id);

                    switch (afterApplicationLaunch)
                    {
                        case AfterApplicationLaunchEnum.ContinueImmediately:
                            // Do nothing, just continue
                            break;

                        case AfterApplicationLaunchEnum.WaitForApplicationToLoad:
                            // Wait for the application to load (simple sleep for demonstration)
                            Thread.Sleep(5000); // Replace with actual loading detection logic
                            break;

                        case AfterApplicationLaunchEnum.WaitForApplicationToComplete:
                            var completed = false;

                            if (timeout > 0)
                            {
                                completed = process.WaitForExit(timeout * 1000); // Returns true if exited
                            }
                            else
                            {
                                process.WaitForExit(); // Waits indefinitely
                                completed = true;
                            }

                            if (completed)
                                AppExitCode.Set(context, process.ExitCode);
                            else
                                throw new TimeoutException(
                                    $"Application '{applicationPath}' did not complete within {timeout} seconds.");
                            break;

                        default:
                            throw new NotSupportedException(
                                $"Unsupported after application launch option: {afterApplicationLaunch}");
                    }
                }

                // Set output arguments

                StatusMessage.Set(context, $"Application '{applicationPath}' launched successfully.");
            }
            catch (Exception ex)
            {

                StatusMessage.Set(context, $"Error launching application: {ex.Message}");
            }
        }

        // Helper method to convert WindowStyleEnum to ProcessWindowStyle
        private static ProcessWindowStyle GetWindowStyle(WindowStyleEnum windowStyle)
        {
            switch (windowStyle)
            {
                case WindowStyleEnum.Normal:
                    return ProcessWindowStyle.Normal;
                case WindowStyleEnum.Minimized:
                    return ProcessWindowStyle.Minimized;
                case WindowStyleEnum.Maximized:
                    return ProcessWindowStyle.Maximized;
                case WindowStyleEnum.Hidden:
                    return ProcessWindowStyle.Hidden;
                default:
                    throw new NotSupportedException($"Unsupported window style: {windowStyle}");
            }
        }
    }

    // Enums
    public enum WindowStyleEnum
    {
        [Display(Name = "Hidden", Description = "The window is hidden (not visible).")]
        Hidden,

        [Display(Name = "Normal", Description = "The window is shown in normal size and position.")]
        Normal,

        [Display(Name = "Minimized", Description = "The window is displayed as a minimized window.")]
        Minimized,

        [Display(Name = "Maximized", Description = "The window is displayed as a maximized window.")]
        Maximized
    }

    public enum AfterApplicationLaunchEnum
    {
        [Display(Name = "Continue Immediately", Description = "Continue workflow execution immediately after launching the application.")]
        ContinueImmediately,

        [Display(Name = "Wait for Application to Load", Description = "Wait until the launched application has fully loaded before continuing.")]
        WaitForApplicationToLoad,

        [Display(Name = "Wait for Application to Complete", Description = "Wait until the launched application has exited before continuing.")]
        WaitForApplicationToComplete
    }
}