using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.ClipboardActivities
{
    [DisplayName("Set Clipboard Text")]
    [Description("Sets the specified text to the system clipboard.")]
    public class SetClipboardTextActivity : CodeActivity
    {
        #region Inputs

        [Category("Input")]
        [Description("The text to set to the clipboard.")]
        public InArgument<string> ClipboardText { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var text = ClipboardText.Get(context);

            try
            {
                // Set the clipboard text
                System.Windows.Forms.Clipboard.SetText(text);
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to set clipboard text: {ex.Message}", ex);
            }
        }
    }
}