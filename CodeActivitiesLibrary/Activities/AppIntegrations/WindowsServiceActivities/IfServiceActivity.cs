using CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{

    [DisplayName("If Service")]
    [Description("Marks the beginning of a If Service block of actions depending on whether a service is running, paused, stopped, or installed.")]
    public class IfServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("If Service")]
        [Description("The If Service to check for the service.")]
        public InArgument<IsRunningEnum> IfService { get; set; }

        [RequiredArgument]
        [DisplayName("Service Name")]
        [Description("The name of the service to check.")]
        public InArgument<ServiceNameEnum> ServiceName { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var ifService = IfService.Get(context);
                var serviceName = ServiceName.Get(context).ToString();

                if (string.IsNullOrWhiteSpace(serviceName))
                    throw new ArgumentException("Service name cannot be null or empty.");

                var serviceController = new ServiceController(serviceName);

                switch (ifService)
                {
                    case IsRunningEnum.IsRunning:
                        if (serviceController.Status == ServiceControllerStatus.Running)
                            status = $"Service '{serviceName}' is running.";
                        else
                            status = $"Service '{serviceName}' is not running.";
                        break;

                    case IsRunningEnum.IsStopped:
                        if (serviceController.Status == ServiceControllerStatus.Stopped)
                            status = $"Service '{serviceName}' is stopped.";
                        else
                            status = $"Service '{serviceName}' is not stopped.";
                        break;

                    case IsRunningEnum.IsInstalled:
                        if (IsServiceInstalled(serviceName))
                            status = $"Service '{serviceName}' is installed.";
                        else
                            status = $"Service '{serviceName}' is not installed.";
                        break;

                    case IsRunningEnum.IsNotInstalled:
                        if (!IsServiceInstalled(serviceName))
                            status = $"Service '{serviceName}' is not installed.";
                        else
                            status = $"Service '{serviceName}' is installed.";
                        break;

                    case IsRunningEnum.IsPaused:
                        if (serviceController.Status == ServiceControllerStatus.Paused)
                            status = $"Service '{serviceName}' is paused.";
                        else
                            status = $"Service '{serviceName}' is not paused.";
                        break;

                    default:
                        throw new ArgumentException($"Unsupported ifService: {ifService}");
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error checking service status: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static bool IsServiceInstalled(string serviceName)
        {
            try
            {
                var services = ServiceController.GetServices();
                return services.Any(s => s.ServiceName == serviceName);
            }
            catch
            {
                return false;
            }
        }
    }

    // Define the IsRunningEnum with Display attributes
    public enum IsRunningEnum
    {
        [Display(Name = "Is running", Description = "Check if the service is running.")]
        IsRunning,

        [Display(Name = "Is stopped", Description = "Check if the service is stopped.")]
        IsStopped,

        [Display(Name = "Is installed", Description = "Check if the service is installed.")]
        IsInstalled,

        [Display(Name = "Isn't installed", Description = "Check if the service is not installed.")]
        IsNotInstalled,

        [Display(Name = "Is paused", Description = "Check if the service is paused.")]
        IsPaused
    }


}