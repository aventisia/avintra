using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{

    // Activity to save a previously launched Word instance
    [DisplayName("Save Word"), Description("Saves a previously launched Word instance.")]
    public class SaveWordActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to save the Word document.")]
        public InArgument<string> SavePath { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var savePath = SavePath.Get(context);
            var status = "";

            try
            {
                // Simulate saving the Word document (actual implementation would use Microsoft.Office.Interop.Word)
                status = $"Simulated saving Word document to: {savePath}";
            }
            catch (Exception ex)
            {
                status = $"Error saving Word document: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}