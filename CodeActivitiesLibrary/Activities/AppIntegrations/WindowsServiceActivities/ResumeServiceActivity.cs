using CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to resume a paused Windows service
    [DisplayName("Resume Service")]
    [Description("Resumes a paused Windows service.")]
    public class ResumeServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Service to Resume")]
        [Description("The name of the service to resume.")]
        public InArgument<ServiceNameEnum> ServiceToResume { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var serviceName = ServiceToResume.Get(context).ToString();

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

                // Check if the service is paused
                if (serviceController.Status != ServiceControllerStatus.Paused)
                {
                    status = $"Service '{serviceName}' is not paused and cannot be resumed.";
                    return;
                }

                // Resume the service
                serviceController.Continue();
                serviceController.WaitForStatus(ServiceControllerStatus.Running, TimeSpan.FromSeconds(30));

                status = $"Service '{serviceName}' has been resumed successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error resuming service: {ex.Message}";
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