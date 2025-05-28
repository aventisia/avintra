using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Lock Workstation"), Description("Locks the workstation's display to protect it from unauthorized use.")]
    public class LockWorkstationActivity : CodeActivity
    {
        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "";

            try
            {
                NativeMethods.LockWorkStation();
                StatusMessage.Set(context, "Workstation locked successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error locking workstation: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private static class NativeMethods
        {
            [DllImport("user32.dll")]
            public static extern bool LockWorkStation();
        }
    }
}