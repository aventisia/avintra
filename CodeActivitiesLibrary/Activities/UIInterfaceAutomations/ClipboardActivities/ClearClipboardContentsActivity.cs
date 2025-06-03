using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.ClipboardActivities
{

    // Activity to clear clipboard contents
    [DisplayName("Clear Clipboard Contents")]
    [Description("Clears all contents from the system clipboard.")]
    public class ClearClipboardContentsActivity : Extensions.BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            var status = "";

            try
            {
                Clipboard.Clear();
                status = "Clipboard cleared successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error clearing clipboard: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}