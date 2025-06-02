using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("Run application"),
     Description("Executes an application or opens a document by executing the associated application.")]
    public class RunApplicationActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path of the application or document to run.")]
        public InArgument<string> FilePath { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var status = "";

            try
            {
                Process.Start(filePath);
                StatusMessage.Set(context, "Application/run executed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error running application: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}