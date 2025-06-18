using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.ClipboardActivities
{
    /// <summary>
    ///     Retrieves the text currently stored in the system clipboard.
    /// </summary>
    [DisplayName("Get Clipboard Text")]
    [Description("Retrieves the text currently stored in the system clipboard.")]
    public class GetClipboardTextActivity : BaseCodeActivity
    {
        [DisplayName("Clipboard Text Output")]
        [Description("The text retrieved from the clipboard.")]
        public OutArgument<string> ClipboardTextOutput { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = string.Empty;
            var clipboardText = string.Empty;

            try
            {
                clipboardText = GetClipboardText();

                if (!string.IsNullOrEmpty(clipboardText))
                    status = "Successfully retrieved clipboard text.";
                else
                    status = "Clipboard is empty or contains non-text data.";

                // Set outputs
                ClipboardTextOutput.Set(context, clipboardText);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving clipboard text: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);

            }
        }

        private string GetClipboardText()
        {
            // Simulated clipboard access
            // In real implementation, use Clipboard.GetText() inside appropriate thread context
            return Clipboard.ContainsText()
                ? Clipboard.GetText()
                : string.Empty;
        }

        public enum OutputModeEnum
        {
            [Display(Name = "Enabled", Description = "Enables clipboard text output.")]
            Enabled = 0,

            [Display(Name = "Disabled", Description = "Disables clipboard text output.")]
            Disabled = 1
        }
    }
}