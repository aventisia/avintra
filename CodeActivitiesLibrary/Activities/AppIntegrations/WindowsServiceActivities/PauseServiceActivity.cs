using CodeActivitiesLibrary.Activities.AppIntegrations.WindowsServiceActivities.Helpers;
using CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to pause a running Windows service
    [DisplayName("Pause Service")]
    [Description("Pauses a running Windows service.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/WindowsService.svg")]
    public class PauseServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Service to Pause")]
        [Description("The name of the service to pause.")]
        public InArgument<ServiceNameEnum> ServiceToPause { get; set; }

        [DisplayName("Custom Service Name")]
        [Description("Optional: Enter a custom service name if not available in the Service To Pause list.")]
        public InArgument<string> CustomServiceName { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            bool success = false;

            try
            {
                string serviceName;

                // Use custom service name if provided
                var customName = CustomServiceName.Get(context);
                if (!string.IsNullOrWhiteSpace(customName))
                {
                    serviceName = customName.Trim();
                }
                else
                {
                    var enumValue = ServiceToPause.Get(context);
                    serviceName = WindowServiceHelper.GetActualServiceName(enumValue);
                }

                if (string.IsNullOrWhiteSpace(serviceName))
                    throw new ArgumentException("Service name cannot be null or empty.");

                if (!IsServiceInstalled(serviceName))
                    throw new InvalidOperationException($"Service '{serviceName}' is not installed.");

                var serviceController = new ServiceController(serviceName);

                // Check admin rights
                if (!WindowServiceHelper.IsUserAdministrator())
                    throw new UnauthorizedAccessException("This activity requires elevated privileges (Run as Administrator).");

                // Ensure service supports pause
                if (!serviceController.CanPauseAndContinue)
                    throw new InvalidOperationException($"Service '{serviceName}' does not support pause/resume.");

                // Check current state
                if (serviceController.Status == ServiceControllerStatus.Paused)
                {
                    status = $"Service '{serviceName}' is already paused.";
                    success = true;
                    return;
                }

                if (serviceController.Status != ServiceControllerStatus.Running)
                {
                    status = $"Service '{serviceName}' is not running. Current status: {serviceController.Status}. Cannot pause.";
                    throw new InvalidOperationException(status);
                }

                // Pause the service
                serviceController.Pause();
                serviceController.WaitForStatus(ServiceControllerStatus.Paused, TimeSpan.FromSeconds(60));

                status = $"Service '{serviceName}' has been paused successfully.";
                success = true;
            }
            catch (Exception ex)
            {
                status = $"Error pausing service: {ex.Message}";
                success = false;
            }
            finally
            {
                StatusMessage.Set(context, status);
                IsSuccess.Set(context, success);
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
}