using System;
using System.Activities;
using System.ComponentModel;
using Microsoft.Office.Interop.Outlook;
using Exception = System.Exception;

namespace CodeActivitiesLibrary.AppIntegrations.OutlookActivities
{
    [DisplayName("Close Outlook Application")]
    [Description("Closes an Outlook application instance and releases COM resources.")]
    public class CloseOutlookActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Outlook Application")]
        [Description("The Outlook Application object to close.")]
        public InArgument<Application> OutlookApplication { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var outlookApp = OutlookApplication.Get(context);

                if (outlookApp == null)
                    throw new InvalidOperationException("Outlook application is null.");

                // Properly quit Outlook
                outlookApp.Quit();

                // Release COM object to avoid memory leaks
                System.Runtime.InteropServices.Marshal.ReleaseComObject(outlookApp);
            }
            catch (Exception ex)
            {
                status = $"Error closing Outlook: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}