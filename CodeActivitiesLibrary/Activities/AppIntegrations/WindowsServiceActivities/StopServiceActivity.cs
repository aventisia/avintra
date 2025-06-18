using CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{

    [DisplayName("Stop Service")]
    [Description("Stops a running Windows service.")]
    public class StopServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Service to Stop")]
        [Description("The name of the service to stop.")]
        public InArgument<ServiceNameEnum> ServiceToStop { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var serviceName = ServiceToStop.Get(context).ToString();

                if (string.IsNullOrWhiteSpace(serviceName))
                    throw new ArgumentException("Service name cannot be null or empty.");

                var serviceController = new ServiceController(serviceName);

                // Validate service existence
                if (!IsServiceInstalled(serviceName))
                    throw new InvalidOperationException($"Service '{serviceName}' is not installed.");

                // Check if the service is already stopped
                if (serviceController.Status == ServiceControllerStatus.Stopped)
                {
                    status = $"Service '{serviceName}' is already stopped.";
                    return;
                }

                // Stop the service
                if (serviceController.Status != ServiceControllerStatus.Running)
                {
                    status = $"Service '{serviceName}' is not running and cannot be stopped.";
                    return;
                }

                serviceController.Stop();
                serviceController.WaitForStatus(ServiceControllerStatus.Stopped, TimeSpan.FromSeconds(30));

                status = $"Service '{serviceName}' has been stopped successfully.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error stopping service: {ex.Message}";
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
}