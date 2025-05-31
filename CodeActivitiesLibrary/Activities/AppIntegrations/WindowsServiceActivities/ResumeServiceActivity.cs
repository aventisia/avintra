using System;
using System.Activities;
using System.ComponentModel;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to resume a paused Windows service
    [DisplayName("Resume Service"), Description("Resumes a paused Windows service.")]
    public class ResumeServiceActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The name of the service to resume.")]
        public InArgument<string> ServiceName { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var serviceName = ServiceName.Get(context);
            var status = "";

            try
            {
                using (var service = new ServiceController(serviceName))
                {
                    service.Continue();
                    service.WaitForStatus(ServiceControllerStatus.Running);
                    status = $"Service '{serviceName}' resumed successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error resuming service: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}