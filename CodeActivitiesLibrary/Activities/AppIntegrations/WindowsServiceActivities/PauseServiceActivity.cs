using System;
using System.Activities;
using System.ComponentModel;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to pause a running Windows service
    [DisplayName("Pause Service"), Description("Pauses a running Windows service.")]
    public class PauseServiceActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The name of the service to pause.")]
        public InArgument<string> ServiceName { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var serviceName = ServiceName.Get(context);
            var status = "";

            try
            {
                using (ServiceController service = new ServiceController(serviceName))
                {
                    service.Pause();
                    service.WaitForStatus(ServiceControllerStatus.Paused);
                    status = $"Service '{serviceName}' paused successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error pausing service: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}