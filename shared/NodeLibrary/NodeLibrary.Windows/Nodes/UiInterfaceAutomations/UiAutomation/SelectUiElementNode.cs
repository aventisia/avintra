using NodeLibrary.UiAutomationNodes.Helpers;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Select UI Element"), Description("Selects the provided UI element, such as a list item, tab item or combo box option, using UI Automation.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class SelectUiElementNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element you would like to select.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Was Selected"), Description("True if the element was selected successfully, otherwise false.")]
    public OutArgument<bool> WasSelected { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            bool elementSelected = false;

            var elementInstance = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (elementInstance == null)
            {
                status = "UI element not found. Please check the identification path.";
            }
            else
            {
                var selectionItemPattern = elementInstance.Patterns.SelectionItem.PatternOrDefault;
                if (selectionItemPattern != null)
                {
                    selectionItemPattern.Select();
                    elementSelected = true;
                    status = "Element selected successfully.";
                }
                else
                {
                    status = "The provided UI element does not support selection.";
                }

                // If selected, invoke the element if applicable
                if (elementSelected)
                {
                    var invokePattern = elementInstance.Patterns.Invoke.PatternOrDefault;
                    if (invokePattern != null)
                        invokePattern.Invoke();
                    else
                    {
                        elementInstance.Focus();
                        Thread.Sleep(500);
                        elementInstance.Click();
                    }
                }
            }

            WasSelected.Set(context, elementSelected);
            IsSuccess.Set(context, elementSelected);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            WasSelected.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }
}
