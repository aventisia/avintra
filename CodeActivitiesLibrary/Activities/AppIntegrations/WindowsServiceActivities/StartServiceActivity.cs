using CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to start a stopped Windows service
    [DisplayName("Start Service")]
    [Description("Starts a stopped Windows service.")]

    public class StartServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Service to Start")]
        [Description("The name of the service to start.")]
        public InArgument<ServiceNameEnum> ServiceToStart { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var serviceName = ServiceToStart.Get(context).ToString();

                if (string.IsNullOrWhiteSpace(serviceName))
                    throw new ArgumentException("Service name cannot be null or empty.");

                var serviceController = new ServiceController(serviceName);

                // Validate service existence
                if (!IsServiceInstalled(serviceName))
                    throw new InvalidOperationException($"Service '{serviceName}' is not installed.");

                // Check if the service is already running
                if (serviceController.Status == ServiceControllerStatus.Running)
                {
                    status = $"Service '{serviceName}' is already running.";
                    return;
                }

                // Start the service
                if (serviceController.Status != ServiceControllerStatus.Stopped)
                {
                    status = $"Service '{serviceName}' is not stopped and cannot be started.";
                    return;
                }

                serviceController.Start();
                serviceController.WaitForStatus(ServiceControllerStatus.Running, TimeSpan.FromSeconds(30));

                status = $"Service '{serviceName}' has been started successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error starting service: {ex.Message}";
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