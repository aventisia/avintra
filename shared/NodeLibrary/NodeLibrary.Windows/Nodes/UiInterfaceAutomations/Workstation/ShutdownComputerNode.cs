using System.Diagnostics;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Shutdown Computer"), Description("Shuts down, restarts, sleeps, or hibernates the computer.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class ShutdownComputerNode : BaseNode
{
    [DisplayName("Shutdown Mode"), Description("The shutdown mode (e.g., power off, restart, sleep, hibernate).")]
    public required InArgument<ShutdownModeEnum> Mode { get; set; } = new InArgument<ShutdownModeEnum>(ShutdownModeEnum.PowerOff);

    protected override void Execute(INodeContext context)
    {
        var mode = Mode.Get(context);
        var status = string.Empty;

        try
        {
            switch (mode)
            {
                case ShutdownModeEnum.PowerOff:
                    Environment.Exit(0);
                    break;
                case ShutdownModeEnum.Restart:
                    Process.Start("shutdown", "/r /t0");
                    break;
                case ShutdownModeEnum.Logoff:
                    Process.Start("shutdown", "/l");
                    break;
                case ShutdownModeEnum.Sleep:
                    Process.Start("rundll32.exe", "powrprof.dll,SetSuspendState 0,1,0");
                    break;
                case ShutdownModeEnum.Hibernate:
                    Process.Start("rundll32.exe", "powrprof.dll,SetSuspendState 1,1,0");
                    break;
                default:
                    status = "Invalid shutdown mode specified.";
                    break;
            }

            if (string.IsNullOrEmpty(status))
            {
                status = "Shutdown initiated successfully.";
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error initiating shutdown: {ex.Message}");
        }
    }

    public enum ShutdownModeEnum
    {
        [Display(Name = "Power Off", Description = "Turns off the computer.")]
        PowerOff,

        [Display(Name = "Restart", Description = "Restarts the computer.")]
        Restart = 1,

        [Display(Name = "Logoff", Description = "Logs off the current user.")]
        Logoff = 2,

        [Display(Name = "Sleep", Description = "Puts the computer to sleep.")]
        Sleep = 3,

        [Display(Name = "Hibernate", Description = "Hibernates the computer.")]
        Hibernate = 4
    }
}
