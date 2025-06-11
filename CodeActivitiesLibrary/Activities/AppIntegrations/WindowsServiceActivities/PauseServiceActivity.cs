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
    public class PauseServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Service to Pause")]
        [Description("The name of the service to pause.")]
        public InArgument<ServiceNameEnum> ServiceToPause { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var serviceName = ServiceToPause.Get(context).ToString();

                if (string.IsNullOrWhiteSpace(serviceName))
                    throw new ArgumentException("Service name cannot be null or empty.");

                var serviceController = new ServiceController(serviceName);

                // Validate service existence
                if (!IsServiceInstalled(serviceName))
                    throw new InvalidOperationException($"Service '{serviceName}' is not installed.");

                // Check if the service is already paused
                if (serviceController.Status == ServiceControllerStatus.Paused)
                {
                    status = $"Service '{serviceName}' is already paused.";
                    return;
                }

                // Pause the service
                if (serviceController.Status != ServiceControllerStatus.Running)
                {
                    status = $"Service '{serviceName}' is not running and cannot be paused.";
                    return;
                }

                serviceController.Pause();
                serviceController.WaitForStatus(ServiceControllerStatus.Paused, TimeSpan.FromSeconds(30));

                status = $"Service '{serviceName}' has been paused successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error pausing service: {ex.Message}";
            }

            StatusMessage.Set(context, status);
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
}