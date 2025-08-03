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
    // Activity to start a stopped Windows service
    [DisplayName("Start Service")]
    [Description("Starts a stopped Windows service.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/WindowsService.svg")]
    public class StartServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Service to Start")]
        [Description("The name of the service to start.")]
        public InArgument<ServiceNameEnum> ServiceToStart { get; set; }

        [DisplayName("Custom Service Name")]
        [Description("Optional: Enter a custom service name if not available in the Service To Start list.")]
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
                    var enumValue = ServiceToStart.Get(context);
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

                if (serviceController.Status == ServiceControllerStatus.Running)
                {
                    status = $"Service '{serviceName}' is already running.";
                    success = true;
                    return;
                }

                if (serviceController.Status != ServiceControllerStatus.Stopped)
                {
                    status = $"Service '{serviceName}' is not stopped. Current status: {serviceController.Status}. Cannot start.";
                    throw new InvalidOperationException(status);
                }

                // Start the service
                serviceController.Start();
                serviceController.WaitForStatus(ServiceControllerStatus.Running, TimeSpan.FromSeconds(60));

                status = $"Service '{serviceName}' has been started successfully.";
                success = true;
            }
            catch (Exception ex)
            {
                status = $"Error starting service: {ex.Message}";
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