using CodeActivitiesLibrary.Activities.AppIntegrations.WindowsServiceActivities.Helpers;
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
        [Description("If true, activity fails on timeout. Otherwise, continues.")]
        public InArgument<bool> FailWithTimeoutError { get; set; } = new InArgument<bool>(true);

        // Use RenderIfCondition to make Duration dependent on FailWithTimeoutError
        [DisplayName("Duration (seconds)")]
        [Description("The maximum time to wait for the service to reach the desired state.")]
        [RenderIfCondition("FailWithTimeoutError", "True")]
        public InArgument<int> Duration { get; set; } = new InArgument<int>(30); // Default 30 seconds

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var waitForAction = WaitForAction.Get(context);
                var serviceNameEnum = ServiceName.Get(context);
                var serviceName = WindowServiceHelper.GetActualServiceName(serviceNameEnum);

                var failWithTimeoutError = FailWithTimeoutError.Get(context);
                var duration = Duration.Get(context);

                if (string.IsNullOrWhiteSpace(serviceName))
                    throw new ArgumentException("Service name cannot be null or empty.");

                if (!IsServiceInstalled(serviceName))
                    throw new InvalidOperationException($"Service '{serviceName}' is not installed.");

                var serviceController = new ServiceController(serviceName);
                var targetStatus = GetTargetStatus(waitForAction);

                status = $"Waiting for service '{serviceName}' to reach state: {targetStatus}";

                bool success = WaitForServiceState(serviceController, targetStatus, duration);

                if (!success && failWithTimeoutError)
                {
                    status = $"Timeout reached ({duration}s). Service '{serviceName}' did not reach '{targetStatus}'.";
                    throw new System.TimeoutException(status);
                }

                status = $"Service '{serviceName}' has reached the desired state: {targetStatus}";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error waiting for service: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            finally
            {
                StatusMessage.Set(context, status);
            }
        }

        private static bool WaitForServiceState(
            ServiceController controller,
            ServiceControllerStatus targetStatus,
            int durationInSeconds)
        {
            var startTime = DateTime.Now;
            var timeout = TimeSpan.FromSeconds(durationInSeconds);

            while ((DateTime.Now - startTime) < timeout)
            {
                try
                {
                    controller.Refresh();

                    if (controller.Status == targetStatus)
                        return true;

                    Thread.Sleep(500); // Wait 500ms before checking again
                }
                catch
                {
                    // Ignore transient errors and retry
                    Thread.Sleep(250);
                }
            }

            return false;
        }

        private static ServiceControllerStatus GetTargetStatus(WaitForTheServiceToEnum action)
        {
            switch (action)
            {
                case WaitForTheServiceToEnum.Start:
                    return ServiceControllerStatus.Running;

                case WaitForTheServiceToEnum.Stop:
                    return ServiceControllerStatus.Stopped;

                case WaitForTheServiceToEnum.Pause:
                    return ServiceControllerStatus.Paused;

                default:
                    throw new ArgumentOutOfRangeException(
                        nameof(action),
                        action,
                        $"Unsupported action: {action}");
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