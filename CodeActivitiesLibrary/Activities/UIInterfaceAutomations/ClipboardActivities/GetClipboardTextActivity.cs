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
    public class GetClipboardTextActivity : CodeActivity
    {
        #region Enums

        /// <summary>
        ///     Mode for enabling or disabling clipboard text retrieval.
        /// </summary>
        public enum OutputModeEnum
        {
            [Display(Name = "Enabled", Description = "Enables clipboard text output.")]
            Enabled = 0,

            [Display(Name = "Disabled", Description = "Disables clipboard text output.")]
            Disabled = 1
        }

        #endregion

        #region Inputs

        [Category("Configuration")]
        [Description("Determines whether to retrieve and output the clipboard text.")]
        [DefaultValue(typeof(OutputModeEnum), "Enabled")]
        public OutputModeEnum OutputSwitch { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = string.Empty;
            var clipboardText = string.Empty;

            try
            {
                if (OutputSwitch == OutputModeEnum.Enabled)
                {
                    // Simulate getting clipboard text
                    clipboardText = GetClipboardText();

                    if (!string.IsNullOrEmpty(clipboardText))
                        status = "Successfully retrieved clipboard text.";
                    else
                        status = "Clipboard is empty or contains non-text data.";
                }
                else
                {
                    status = "Clipboard text retrieval is disabled.";
                }

                // Set outputs
                ClipboardTextOutput.Set(context, clipboardText);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving clipboard text: {ex.Message}";
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

        #region Outputs

        [Category("Output")]
        [Description("The text retrieved from the clipboard.")]
        public OutArgument<string> ClipboardTextOutput { get; set; }

        [RequiredArgument]
        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion
    }
}