using NodeLibrary.UiAutomationNodes.Helpers;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Get Text from Text Box"), Description("Reads and returns the text from a text box or editable field in a window using the UI element you provide.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class GetTextBoxTextNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI Element for the text box or editable field you want to read.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Text Box Content"), Description("The text found in the text box or editable field.")]
    public OutArgument<string> TextBoxContent { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context) ?? string.Empty);
            var maxWaitTime = MaxWaitTime.Get(context);
            string textboxContent = "";

            var textboxElement = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);
            if (textboxElement != null)
            {
                // Try ValuePattern first (most common for text boxes)
                var valuePattern = textboxElement.Patterns.Value.PatternOrDefault;
                if (valuePattern != null)
                {
                    textboxContent = valuePattern.Value ?? string.Empty;
                    status = "Text copied from the text box successfully.";
                }
                else
                {
                    // Try TextPattern for document-style controls (e.g., RichTextBox)
                    var textPattern = textboxElement.Patterns.Text.PatternOrDefault;
                    if (textPattern != null)
                    {
                        textboxContent = textPattern.DocumentRange.GetText(-1)?.TrimEnd('\r', '\n') ?? string.Empty;
                        status = "Text copied from the text box successfully.";
                    }
                    else
                    {
                        textboxContent = "Error: Not able to copy text from TextBox";
                        status = "Could not find or read the text box.";
                    }
                }
            }
            else
            {
                textboxContent = "Error: Not able to copy text from TextBox";
                status = "Could not find or read the text box.";
            }

            TextBoxContent.Set(context, textboxContent);
            IsSuccess.Set(context, !textboxContent.StartsWith("Error:"));
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error while reading text from text box: {ex.Message}");
        }
    }
}
