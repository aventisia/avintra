using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Log Off User")]
    [Description("Logs off the current user.")]
    public class LogOffUserActivity : CodeActivity
    {
        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "";

            try
            {
                Process.Start("shutdown", "/l");
                StatusMessage.Set(context, "Logoff initiated successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error initiating logoff: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}