using NodeLibrary.UiAutomationNodes.Enums;
using NodeLibrary.UiAutomationNodes.Helpers;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Expand or Collapse UI Element"), Description("Expands or collapses a UI element (such as a tree item or combo box) by searching for it using a property and value.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class ExpandOrCollapseUiElementNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element which you would like to expand or collapse.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Action Type"), Description("Choose whether to expand or collapse the element.")]
    public InArgument<ExpandCollapseActionEnum> ActionType { get; set; } = new InArgument<ExpandCollapseActionEnum>(ExpandCollapseActionEnum.Expand);

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Was Successful"), Description("True if the element was expanded or collapsed successfully, otherwise false.")]
    public OutArgument<bool> WasSuccessful { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var actionType = ActionType.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);
            bool result = false;

            var elementInstance = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (elementInstance != null)
            {
                var expandCollapsePattern = elementInstance.Patterns.ExpandCollapse.PatternOrDefault;
                if (expandCollapsePattern != null)
                {
                    if (actionType == ExpandCollapseActionEnum.Expand)
                    {
                        expandCollapsePattern.Expand();
                        status = "Element expanded successfully.";
                    }
                    else
                    {
                        expandCollapsePattern.Collapse();
                        status = "Element collapsed successfully.";
                    }
                    result = true;
                }
                else
                {
                    status = "Expand/Collapse pattern not supported on the element.";
                }
            }

            if (!result && string.IsNullOrEmpty(status))
            {
                status = "Failed to expand or collapse the element within the specified time.";
            }

            WasSuccessful.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }
}
