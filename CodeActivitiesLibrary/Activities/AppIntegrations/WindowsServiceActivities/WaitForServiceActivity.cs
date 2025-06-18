using CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.ServiceProcess;
using System.Threading;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    [DisplayName("Wait for Service")]
    [Description(
        "Suspends the execution of the automation until a service is running, paused, or stopped on the computer.")]
    public class WaitForServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Wait for Service to")]
        [Description("The action to wait for (Start, Stop, Pause).")]
        public InArgument<WaitForTheServiceToEnum> WaitForAction { get; set; }

        [RequiredArgument]
        [DisplayName("Service Name")]
        [Description("The name of the service to monitor.")]
        public InArgument<ServiceNameEnum> ServiceName { get; set; }

        [DisplayName("Fail with Timeout Error")]
        [Description(
            "If enabled, the activity will fail if the service does not reach the desired state within the specified duration.")]
        public InArgument<bool> FailWithTimeoutError { get; set; }

        // Use RenderIfCondition to make Duration dependent on FailWithTimeoutError
        [DisplayName("Duration (seconds)")]
        [Description("The maximum time to wait for the service to reach the desired state.")]
        [RenderIfCondition("FailWithTimeoutError", "True")]
        public InArgument<int> Duration { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var waitForAction = WaitForAction.Get(context);
                var serviceName = ServiceName.Get(context).ToString();
                var failWithTimeoutError = FailWithTimeoutError.Get(context);
                var duration = Duration.Get(context);

                if (string.IsNullOrWhiteSpace(serviceName))
                    throw new ArgumentException("Service name cannot be null or empty.");

                var serviceController = new ServiceController(serviceName);

                // Validate service existence
                if (!IsServiceInstalled(serviceName))
                    throw new InvalidOperationException($"Service '{serviceName}' is not installed.");

                // Wait for the desired state
                var success = WaitForServiceState(serviceController, waitForAction, duration);

                if (!success && failWithTimeoutError)
                    throw new System.TimeoutException(
                        $"Service '{serviceName}' did not reach the desired state within {duration} seconds.");

                status = $"Service '{serviceName}' reached the desired state";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error waiting for service: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static bool WaitForServiceState(ServiceController serviceController,
            WaitForTheServiceToEnum waitForAction, int duration)
        {
            var startTime = DateTime.Now;
            var targetStatus = GetTargetStatus(waitForAction);

            while ((DateTime.Now - startTime).TotalSeconds < duration)
            {
                try
                {
                    serviceController.Refresh();

                    if (serviceController.Status == targetStatus)
                        return true;

                    Thread.Sleep(500); // Wait 500ms before checking again
                }
                catch
                {
                    // Ignore transient errors and retry
                }
            }

            return false;
        }

        private static ServiceControllerStatus GetTargetStatus(WaitForTheServiceToEnum waitForAction)
        {
            switch (waitForAction)
            {
                case WaitForTheServiceToEnum.Start:
                    return ServiceControllerStatus.Running;
                case WaitForTheServiceToEnum.Stop:
                    return ServiceControllerStatus.Stopped;
                case WaitForTheServiceToEnum.Pause:
                    return ServiceControllerStatus.Paused;
                default:
                    throw new ArgumentException($"Unsupported action: {waitForAction}");
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

    // Define the WaitForTheServiceToEnum with Display attributes
    public enum WaitForTheServiceToEnum
    {
        [Display(Name = "Start", Description = "Wait until the service starts (running).")]
        Start,

        [Display(Name = "Stop", Description = "Wait until the service stops (not running).")]
        Stop,

        [Display(Name = "Pause", Description = "Wait until the service pauses (paused state).")]
        Pause
    }
}