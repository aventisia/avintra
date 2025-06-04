using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to stop a running Windows service
    [DisplayName("Stop Service"), Description("Stops a running Windows service.")]
    public class StopServiceActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The name of the service to stop.")]
        public InArgument<string> ServiceName { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var serviceName = ServiceName.Get(context);
            var status = "";

            try
            {
                using (var service = new ServiceController(serviceName))
                {
                    service.Stop();
                    service.WaitForStatus(ServiceControllerStatus.Stopped);
                    status = $"Service '{serviceName}' stopped successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error stopping service: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}