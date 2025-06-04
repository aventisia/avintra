using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to wait for a service to reach a specific state
    [DisplayName("Wait for Service"),
     Description(
         "Suspends the execution of the automation until a service is running, paused, or stopped on the computer.")]
    public class WaitForServiceActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The name of the service to wait for.")]
        public InArgument<string> ServiceName { get; set; }

        [RequiredArgument, Category("Input"), Description("The desired state of the service (e.g., Running, Stopped).")]
        public InArgument<ServiceControllerStatus> DesiredState { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var serviceName = ServiceName.Get(context);
            var desiredState = DesiredState.Get(context);
            var status = "";

            try
            {
                using (var service = new ServiceController(serviceName))
                {
                    // Simulate waiting for the service to reach the desired state
                    status = $"Simulated waiting for service '{serviceName}' to reach state '{desiredState}'.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error waiting for service: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}