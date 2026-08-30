using NodeLibrary.UiAutomationNodes.Enums;
using NodeLibrary.UiAutomationNodes.Helpers;
using FlaUI.Core.AutomationElements;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Get Window"), Description("Finds a desktop window by name using UI Automation.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class GetWindowNode : BaseNode
{
    [DisplayName("Window Name"), Description("The name (title) of the window to find.")]
    public required InArgument<string> WindowName { get; set; }

    [DisplayName("Name Match Mode"), Description("How to match the window name. Options: Equals, Contains, Starts With.")]
    public InArgument<NameMatchModeEnum> MatchMode { get; set; } = new InArgument<NameMatchModeEnum>(NameMatchModeEnum.Equals);

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait for the window (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Automation Element"), Description("The found AutomationElement for the window.")]
    public OutArgument<AutomationElement> WindowElement { get; set; } = new OutArgument<AutomationElement>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            string windowName = WindowName.Get(context);
            int maxWaitTime = MaxWaitTime.Get(context);

            var identificationObject = new List<IdentificationObject>
            {
                new IdentificationObject
                {
                    Name = windowName,
                    NameMatchMode = MatchMode.Get(context),
                }
            };

            var windowElement = UiAutomationElementHelper.GetElementByPath(identificationObject, maxWaitTime);

            status = windowElement != null
                ? "Window found successfully."
                : "Window not found within the specified time.";
            WindowElement.Set(context, windowElement);

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
