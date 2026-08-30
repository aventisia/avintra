using NodeLibrary.UiAutomationNodes.Enums;
using NodeLibrary.UiAutomationNodes.Helpers;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Click UI Element"), Description("Invokes or clicks a UI element using UI Automation or mouse click.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class ClickUiElementNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element which you would like to click.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Click Type"), Description("Type of click: UIAutomationClick or MouseClick.")]
    public InArgument<ClickTypeEnum> ClickType { get; set; } = new InArgument<ClickTypeEnum>(ClickTypeEnum.UIAutomationClick);

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Button Clicked Successfully"), Description("Indicates whether the UI element was clicked successfully.")]
    public OutArgument<bool> IsClicked { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var clickType = ClickType.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);
            bool elementClicked = false;

            var elementInstance = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            for (int i = 0; i <= (maxWaitTime * 5); i++)
            {
                try
                {
                    if (elementInstance != null)
                    {
                        if (clickType == ClickTypeEnum.UIAutomationClick)
                        {
                            var invokePattern = elementInstance.Patterns.Invoke.PatternOrDefault;
                            if (invokePattern != null)
                            {
                                invokePattern.Invoke();
                                elementClicked = true;
                                status = "UI element clicked successfully.";
                                break;
                            }
                            else
                                status = "Invoke pattern not supported on this element.";
                        }
                        else if (clickType == ClickTypeEnum.MouseClick)
                        {
                            elementInstance.Focus();
                            Thread.Sleep(200);
                            elementInstance.Click();
                            elementClicked = true;
                            Thread.Sleep(500);
                            status = "UI element clicked using mouse successfully.";
                            break;
                        }
                    }
                }
                catch
                {
                    Thread.Sleep(500);
                }
            }

            IsClicked.Set(context, elementClicked);
            IsSuccess.Set(context, elementClicked);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }
}
