using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Get Text from Text Box")]
    [Description("Reads and returns the text from a text box or editable field in a window using the UI element you provide.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
    public class GetTextBoxTextActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI Element for the text box or editable field you want to read.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Text Box Content")]
        [Description("The text found in the text box or editable field.")]
        public OutArgument<string> TextBoxContent { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            string textboxContent = "";
            string statusMessage = "";

            try
            {
                // Get the automation element for the UI element
                var textboxElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);
                if (textboxElement != null)
                {
                    // Try ValuePattern first (most common for text boxes)
                    var valuePattern = textboxElement.Patterns.Value.PatternOrDefault;
                    if (valuePattern != null)
                    {
                        textboxContent = valuePattern.Value;
                        statusMessage = "Text copied from the text box successfully.";
                    }
                    else
                    {
                        // Try TextPattern for document-style controls (e.g., RichTextBox)
                        var textPattern = textboxElement.Patterns.Text.PatternOrDefault;
                        if (textPattern != null)
                        {
                            textboxContent = textPattern.DocumentRange.GetText(-1)?.TrimEnd('\r', '\n');
                            statusMessage = "Text copied from the text box successfully.";
                        }
                        else
                        {
                            textboxContent = "Error: Not able to copy text from TextBox";
                            statusMessage = "Could not find or read the text box.";
                        }
                    }
                }
                else
                {
                    textboxContent = "Error: Not able to copy text from TextBox";
                    statusMessage = "Could not find or read the text box.";
                }

                TextBoxContent.Set(context, textboxContent);
                IsSuccess.Set(context, !textboxContent.StartsWith("Error:"));
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error while reading text from text box: {ex.Message}");
            }
        }
    }
}