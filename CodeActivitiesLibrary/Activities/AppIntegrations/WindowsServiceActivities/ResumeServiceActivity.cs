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
    // Activity to resume a paused Windows service
    [DisplayName("Resume Service")]
    [Description("Resumes a paused Windows service.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/WindowsService.svg")]
    public class ResumeServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Service to Resume")]
        [Description("Select a service from the list to resume.")]
        [DefaultValue(null)]
        public InArgument<ServiceNameEnum> ServiceToResume { get; set; }

        [DisplayName("Custom Service Name")]
        [Description("Optional: Enter a custom service name if not available in the Service To Resume list.")]
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

                var customName = CustomServiceName.Get(context);
                if (!string.IsNullOrWhiteSpace(customName))
                {
                    serviceName = customName.Trim();
                }
                else
                {
                    var enumValue = ServiceToResume.Get(context);
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

                // Ensure service supports pause/resume
                if (!serviceController.CanPauseAndContinue)
                    throw new InvalidOperationException($"Service '{serviceName}' does not support pause/resume.");

                // Check current state
                if (serviceController.Status == ServiceControllerStatus.Running)
                {
                    status = $"Service '{serviceName}' is already running.";
                    success = true;
                    return;
                }

                if (serviceController.Status != ServiceControllerStatus.Paused)
                {
                    status = $"Service '{serviceName}' is not paused. Current status: {serviceController.Status}. Cannot resume.";
                    throw new InvalidOperationException(status);
                }

                // Resume the service
                serviceController.Continue();
                WaitForServiceState(serviceController, ServiceControllerStatus.Running, 60);

                status = $"Service '{serviceName}' has been resumed successfully.";
                success = true;
            }
            catch (Exception ex)
            {
                status = $"Error resuming service: {ex.Message}";
                success = false;
            }
            finally
            {
                StatusMessage.Set(context, status);
                IsSuccess.Set(context, success);
            }
        }

        private static void WaitForServiceState(
            ServiceController controller,
            ServiceControllerStatus targetStatus,
            int timeoutSeconds)
        {
            var startTime = DateTime.Now;
            var timeout = TimeSpan.FromSeconds(timeoutSeconds);

            while ((DateTime.Now - startTime) < timeout)
            {
                controller.Refresh();

                if (controller.Status == targetStatus)
                    return;

                System.Threading.Thread.Sleep(500);
            }

            throw new System.TimeoutException(
                $"Timeout reached ({timeoutSeconds}s). Service '{controller.ServiceName}' did not reach '{targetStatus}'.");
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