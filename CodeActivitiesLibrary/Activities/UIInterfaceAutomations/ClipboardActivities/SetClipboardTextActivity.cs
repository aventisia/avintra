using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ClipboardActivities
{
    [DisplayName("Set Clipboard Text")]
    [Description("Sets the specified text to the system clipboard.")]
    public class SetClipboardTextActivity : BaseCodeActivity
    {
        [DisplayName("Clipboard Text")]
        [Description("The text to set to the clipboard.")]
        public InArgument<string> ClipboardText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var text = ClipboardText.Get(context);

            try
            {
                // Set the clipboard text
                System.Windows.Forms.Clipboard.SetText(text);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Clipboard text set successfully");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to set clipboard text: {ex.Message}");
            }
        }
    }
}