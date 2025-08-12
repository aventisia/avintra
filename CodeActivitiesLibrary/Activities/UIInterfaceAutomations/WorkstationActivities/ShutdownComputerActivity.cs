using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Shutdown Computer")]
    [Description("Shuts down, restarts, sleeps, or hibernates the computer.")]
    [ActivityMetaData(nodeImg: "/assets/Workstation.svg")]
    public class ShutdownComputerActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Shutdown Mode")]
        [Description("The shutdown mode (e.g., power off, restart, sleep, hibernate).")]
        public InArgument<ShutdownModeEnum> Mode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var mode = Mode.Get(context);
            var status = "";
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
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Shutdown initiated successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error initiating shutdown: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
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
}