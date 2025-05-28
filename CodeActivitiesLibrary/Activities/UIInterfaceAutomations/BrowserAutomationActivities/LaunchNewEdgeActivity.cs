using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    // Activity to launch a new Microsoft Edge instance
    [DisplayName("Launch New Microsoft Edge"),
     Description(
         "Launch a new instance of Microsoft Edge or attach to a running instance of Microsoft Edge for automating websites and web applications.")]
    public class LaunchNewEdgeActivity : CodeActivity
    {
        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "";

            try
            {
                // Simulate launching Edge (actual implementation would use a web automation library like Selenium)
                status = "Simulated Microsoft Edge launched successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error launching Microsoft Edge: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}