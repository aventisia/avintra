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
    [ActivityMetaData(nodeImg: "/assets/System.svg")]
    public class RunApplicationActivity : BaseCodeActivity
    {
       
        [RequiredArgument]
        [DisplayName("Application path")]
        [Description("The path to the application or document to execute.")]
        public InArgument<string> ApplicationPath { get; set; }

        [DisplayName("Command line arguments")]
        [Description("Optional parameters to control how the application starts (e.g., a file to open or a silent mode flag). Example: \"C:\\report.xlsx\" or \"--input=data.csv --quiet\".")]
        public InArgument<string> CommandLineArguments { get; set; }

        [DisplayName("Working Directory")]
        [Description("The folder the application uses as its 'current location' when running. If left empty, it defaults to the application's own folder. Required only if the app needs to access files like config.json or data.csv relative to a specific path.")]
        public InArgument<string> WorkingDirectory { get; set; }

        [DisplayName("Window style")]
        [Description("Specifies how the application window should be displayed.")]
        public InArgument<WindowStyleEnum> WindowStyle { get; set; }

        [DisplayName("After application launch")]
        [Description("Specifies the behavior after launching the application.")]
        public InArgument<AfterApplicationLaunchEnum> AfterApplicationLaunch { get; set; }

        [DisplayName("Timeout")]
        [Description("The maximum time (in seconds) to wait for the application to complete.")]
        [DefaultValue(0)]
        [RenderIfCondition(nameof(AfterApplicationLaunch), AfterApplicationLaunchEnum.ContinueImmediately)]
        public InArgument<int> Timeout { get; set; }

        [DisplayName("AppProcessId")]
        [Description("The process ID of the launched application.")]
        public OutArgument<int> AppProcessId { get; set; }

        [DisplayName("AppExitCode")]
        [Description("The exit code of the application if it completes.")]
        [RenderIfCondition(nameof(AfterApplicationLaunch), AfterApplicationLaunchEnum.ContinueImmediately)]
        public OutArgument<int> AppExitCode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var applicationPath = ApplicationPath.Get(context);
                var commandLineArguments = CommandLineArguments.Get(context);
                var workingDirectory = WorkingDirectory.Get(context);
                var windowStyle = WindowStyle.Get(context);
                var afterApplicationLaunch = AfterApplicationLaunch.Get(context);
                var timeout = Timeout.Get(context);
                
                // Validate input
                if (string.IsNullOrWhiteSpace(applicationPath))
                    throw new ArgumentException("Application path cannot be empty.");

                if (string.IsNullOrWhiteSpace(workingDirectory))
                {
                    // Only set if applicationPath is a valid file path 
                    if (System.IO.File.Exists(applicationPath))
                    {
                        workingDirectory = System.IO.Path.GetDirectoryName(applicationPath);
                    }
                }
                // Start the application
                var startInfo = new ProcessStartInfo
                {
                    FileName = applicationPath,
                    Arguments = commandLineArguments,
                    WorkingDirectory = workingDirectory,
                    WindowStyle = GetWindowStyle(windowStyle),
                    CreateNoWindow = windowStyle == WindowStyleEnum.Hidden,
                    UseShellExecute = true
                };

                var process = new Process { StartInfo = startInfo };
                process.Start();
                AppProcessId.Set(context, process.Id);

               
                switch (afterApplicationLaunch)
                {
                    case AfterApplicationLaunchEnum.ContinueImmediately:
                        // Do nothing — let workflow continue
                        break;

                    case AfterApplicationLaunchEnum.WaitForApplicationToLoad:
                        // For visible GUI apps, wait for app to be ready to accept input
                        if (windowStyle != WindowStyleEnum.Hidden)
                        {
                            // Times out after 10 seconds to avoid hanging
                            process.WaitForInputIdle(10000);
                        }
                        else
                        {
                            Thread.Sleep(500);
                        }
                        break;

                    default:
                        throw new NotSupportedException(
                            $"Unsupported after application launch option: {afterApplicationLaunch}");
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Application launched successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
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
        WaitForApplicationToLoad
    }
}