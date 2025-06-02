using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Log Off User")]
    [Description("Logs off the current user.")]
    public class LogOffUserActivity : Extensions.BaseCodeActivity
    {
        
        

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