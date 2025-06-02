using System;
using System.Activities;
using System.ComponentModel;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to start a stopped Windows service
    [DisplayName("Start Service"), Description("Starts a stopped Windows service.")]
    public class StartServiceActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The name of the service to start.")]
        public InArgument<string> ServiceName { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var serviceName = ServiceName.Get(context);
            var status = "";

            try
            {
                using (var service = new ServiceController(serviceName))
                {
                    service.Start();
                    service.WaitForStatus(ServiceControllerStatus.Running);
                    status = $"Service '{serviceName}' started successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error starting service: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

}