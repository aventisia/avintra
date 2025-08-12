using CodeActivitiesLibrary.Activities.AppIntegrations.WindowsServiceActivities.Helpers;
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
    [ActivityMetaData(nodeImg: "/assets/WindowsService.svg")]
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
        // Output Arguments
        // ----------------------

        [DisplayName("Condition Result")]
        [Description("Returns true if the service matches the specified condition.")]
        public OutArgument<bool> ConditionResult { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            bool result = false;

            try
            {
                // Check if running as Administrator
                if (!WindowServiceHelper.IsUserAdministrator())
                    throw new UnauthorizedAccessException("This activity requires elevated privileges (Run as Administrator).");

                var ifService = IfService.Get(context);
                var serviceNameEnum = ServiceName.Get(context);
                var serviceName = WindowServiceHelper.GetActualServiceName(serviceNameEnum);

                if (string.IsNullOrWhiteSpace(serviceName))
                    throw new ArgumentException("Service name cannot be null or empty.");

                // Check if service exists
                var isInstalled = IsServiceInstalled(serviceName);

                if (!isInstalled && ifService != IsRunningEnum.IsNotInstalled)
                {
                    status = $"Service '{serviceName}' is not installed. Cannot evaluate condition.";
                    result = false;
                    ConditionResult.Set(context, result);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, status);
                    return;
                }

                // Only create controller if service is installed
                var serviceController = new ServiceController(serviceName);

                switch (ifService)
                {
                    case IsRunningEnum.IsRunning:
                        result = serviceController.Status == ServiceControllerStatus.Running;
                        status = result ? $"Service '{serviceName}' is running." : $"Service '{serviceName}' is NOT running.";
                        break;

                    case IsRunningEnum.IsStopped:
                        result = serviceController.Status == ServiceControllerStatus.Stopped;
                        status = result ? $"Service '{serviceName}' is stopped." : $"Service '{serviceName}' is NOT stopped.";
                        break;

                    case IsRunningEnum.IsPaused:
                        result = serviceController.Status == ServiceControllerStatus.Paused;
                        status = result ? $"Service '{serviceName}' is paused." : $"Service '{serviceName}' is NOT paused.";
                        break;

                    case IsRunningEnum.IsInstalled:
                        result = isInstalled;
                        status = result ? $"Service '{serviceName}' is installed." : $"Service '{serviceName}' is NOT installed.";
                        break;

                    case IsRunningEnum.IsNotInstalled:
                        result = !isInstalled;
                        status = result ? $"Service '{serviceName}' is NOT installed." : $"Service '{serviceName}' is installed.";
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(ifService), ifService, null);
                }

                ConditionResult.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (UnauthorizedAccessException ex)
            {
                status = ex.Message;
                ConditionResult.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error checking service status: {ex.Message}";
                ConditionResult.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            finally
            {
                StatusMessage.Set(context, status);
            }
        }

        private static bool IsServiceInstalled(string serviceName)
        {
            try
            {
                return ServiceController.GetServices().Any(s => s.ServiceName == serviceName);
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