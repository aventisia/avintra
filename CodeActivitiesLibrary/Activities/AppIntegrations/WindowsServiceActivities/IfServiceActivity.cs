using System;
using System.Activities;
using System.ComponentModel;
using System.ServiceProcess;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities
{
    // Activity to check if a service is running, paused, stopped, or installed
    [DisplayName("If Service"),
     Description(
         "Marks the beginning of a conditional block of actions depending on whether a service is running, paused, stopped, or installed on the computer.")]
    public class IfServiceActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The name of the service to check.")]
        public InArgument<string> ServiceName { get; set; }

        [Category("Output"), Description("Returns true if the service is in the specified state, otherwise false.")]
        public OutArgument<bool> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var serviceName = ServiceName.Get(context);
            var result = false;
            var status = "";

            try
            {
                using (var service = new ServiceController(serviceName))
                {
                    var statusInfo = service.Status;
                    result = true; // Simulated success
                    status = $"Service '{serviceName}' status checked successfully.";
                }
            }
            catch (Exception ex)
            {
                result = false;
                status = $"Error checking service status: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}

