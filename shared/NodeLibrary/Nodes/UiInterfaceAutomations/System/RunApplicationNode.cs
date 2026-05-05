using System.Diagnostics;

namespace NodeLibrary.SystemNodes;

[DisplayName("Run Application"), Description("Executes an application or opens a document by executing the associated application.")]
[NodeMetadata(icon: "/assets/System.svg")]
public class RunApplicationNode : BaseNode
{
    [DisplayName("Application path"), Description("The path to the application or document to execute.")]
    public required InArgument<string> ApplicationPath { get; set; }

    [DisplayName("Command line arguments"), Description("Optional parameters to control how the application starts (e.g., a file to open or a silent mode flag). Example: \"C:\\report.xlsx\" or \"--input=data.csv --quiet\".")]
    public InArgument<string> CommandLineArguments { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Working Directory"), Description("The folder the application uses as its 'current location' when running. If left empty, it defaults to the application's own folder. Required only if the app needs to access files like config.json or data.csv relative to a specific path.")]
    public InArgument<string> WorkingDirectory { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Window style"), Description("Specifies how the application window should be displayed.")]
    public InArgument<WindowStyleEnum> WindowStyle { get; set; } = new InArgument<WindowStyleEnum>(WindowStyleEnum.Normal);

    [DisplayName("After application launch"), Description("Specifies the behavior after launching the application.")]
    public InArgument<AfterApplicationLaunchEnum> AfterApplicationLaunch { get; set; } = new InArgument<AfterApplicationLaunchEnum>(AfterApplicationLaunchEnum.ContinueImmediately);

    [DisplayName("Timeout"), Description("The maximum time (in seconds) to wait for the application to complete.")]
    [RenderIfCondition(nameof(AfterApplicationLaunch), AfterApplicationLaunchEnum.ContinueImmediately)]
    public InArgument<int> Timeout { get; set; } = new InArgument<int>(0);

    [DisplayName("AppProcessId"), Description("The process ID of the launched application.")]
    public OutArgument<int> AppProcessId { get; set; } = new OutArgument<int>();

    [DisplayName("AppExitCode"), Description("The exit code of the application if it completes.")]
    [RenderIfCondition(nameof(AfterApplicationLaunch), AfterApplicationLaunchEnum.ContinueImmediately)]
    public OutArgument<int> AppExitCode { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Application launched successfully.";

        try
        {
            var applicationPath = ApplicationPath.Get(context);
            var commandLineArguments = CommandLineArguments.Get(context);
            var workingDirectory = WorkingDirectory.Get(context);
            var windowStyle = WindowStyle.Get(context);
            var afterApplicationLaunch = AfterApplicationLaunch.Get(context);

            if (string.IsNullOrWhiteSpace(applicationPath))
                throw new ArgumentException("Application path cannot be empty.");

            if (string.IsNullOrWhiteSpace(workingDirectory) && File.Exists(applicationPath))
                workingDirectory = Path.GetDirectoryName(applicationPath);

            var startInfo = new ProcessStartInfo
            {
                FileName = applicationPath,
                Arguments = commandLineArguments,
                WorkingDirectory = workingDirectory,
                WindowStyle = GetWindowStyle(windowStyle),
                CreateNoWindow = windowStyle == WindowStyleEnum.Hidden,
                UseShellExecute = true
            };

            using var process = new Process { StartInfo = startInfo };
            process.Start();
            AppProcessId.Set(context, process.Id);

            switch (afterApplicationLaunch)
            {
                case AfterApplicationLaunchEnum.ContinueImmediately:
                    break;

                case AfterApplicationLaunchEnum.WaitForApplicationToLoad:
                    if (windowStyle != WindowStyleEnum.Hidden)
                    {
                        process.WaitForInputIdle(10000);
                    }
                    else
                    {
                        Thread.Sleep(500);
                    }
                    break;

                default:
                    throw new NotSupportedException($"Unsupported after application launch option: {afterApplicationLaunch}");
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error launching application: {ex.Message}");
        }
    }

    private static ProcessWindowStyle GetWindowStyle(WindowStyleEnum windowStyle)
    {
        return windowStyle switch
        {
            WindowStyleEnum.Normal => ProcessWindowStyle.Normal,
            WindowStyleEnum.Minimized => ProcessWindowStyle.Minimized,
            WindowStyleEnum.Maximized => ProcessWindowStyle.Maximized,
            WindowStyleEnum.Hidden => ProcessWindowStyle.Hidden,
            _ => throw new NotSupportedException($"Unsupported window style: {windowStyle}")
        };
    }
}

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
