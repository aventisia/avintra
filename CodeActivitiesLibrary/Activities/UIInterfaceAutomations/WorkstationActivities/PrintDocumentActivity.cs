using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Print Document"), Description("Prints a document on the default printer.")]
    public class PrintDocumentActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the document to print.")]
        public InArgument<string> DocumentPath { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var documentPath = DocumentPath.Get(context);
            var status = "";

            try
            {
                using (var process = new Process())
                {
                    process.StartInfo.FileName = "rundll32";
                    process.StartInfo.Arguments = $"printui.dll,PrintUIEntry /p /q /y \"{documentPath}\"";
                    process.Start();
                    process.WaitForExit();

                    StatusMessage.Set(context, "Document printed successfully.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error printing document: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}