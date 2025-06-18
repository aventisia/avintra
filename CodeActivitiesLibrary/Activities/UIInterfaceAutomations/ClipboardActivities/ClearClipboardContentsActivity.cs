using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.ClipboardActivities
{
    // Activity to clear clipboard contents
    [DisplayName("Clear Clipboard Contents")]
    [Description("Clears all contents from the system clipboard.")]
    public class ClearClipboardContentsActivity : BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                Clipboard.Clear();
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Clipboard cleared successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error clearing clipboard: {ex.Message}");
            }
        }
    }
}