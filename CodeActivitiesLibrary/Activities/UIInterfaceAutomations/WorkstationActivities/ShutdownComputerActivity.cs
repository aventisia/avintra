using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Shutdown Computer")]
    [Description("Shuts down the computer.")]
    public class ShutdownComputerActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The shutdown mode (e.g., power off, restart).")]
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
                        Environment.Exit(0); // Simulate power off
                        break;
                    case ShutdownModeEnum.Restart:
                        Process.Start("shutdown", "/r /t 0");
                        break;
                    case ShutdownModeEnum.Logoff:
                        Process.Start("shutdown", "/l");
                        break;
                    default:
                        status = "Invalid shutdown mode specified.";
                        break;
                }

                StatusMessage.Set(context, "Shutdown initiated successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error initiating shutdown: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

    public enum ShutdownModeEnum
    {
        [Display(Name = "Power Off", Description = "Turns off the computer.")]
        PowerOff = 0,

        [Display(Name = "Restart", Description = "Restarts the computer.")]
        Restart = 1,

        [Display(Name = "Logoff", Description = "Logs off the current user.")]
        Logoff = 2
    }
}