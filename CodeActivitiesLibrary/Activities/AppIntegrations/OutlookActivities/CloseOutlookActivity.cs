using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Outlook;
using System;
using System.Activities;
using System.ComponentModel;
using Exception = System.Exception;

namespace CodeActivitiesLibrary.AppIntegrations.OutlookActivities
{
    [DisplayName("Close Outlook Application")]
    [Description("Closes an Outlook application instance and releases COM resources.")]
    public class CloseOutlookActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Outlook Application")]
        [Description("The Outlook Application object to close.")]
        public InArgument<Application> OutlookApplication { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var outlookApp = OutlookApplication.Get(context);

                if (outlookApp == null)
                    throw new InvalidOperationException("Outlook application is null.");

                // Properly quit Outlook
                outlookApp.Quit();

                // Release COM object to avoid memory leaks
                System.Runtime.InteropServices.Marshal.ReleaseComObject(outlookApp);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Outlook closed successfully.");
            }
            catch (Exception ex)
            {

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error closing Outlook: {ex.Message}");
            }
        }
    }
}