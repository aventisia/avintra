using NodeLibrary.UiAutomationNodes.Enums;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Set Window State"), Description("Change the window to normal, maximized, or minimized state.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class SetWindowStateNode : BaseNode
{
    [DisplayName("Window"), Description("Select the window you want to change.")]
    public required InArgument<AutomationElement> WindowElement { get; set; }

    [DisplayName("Window State"), Description("Choose how you want the window to appear (Normal, Maximized, or Minimized).")]
    public InArgument<WindowStateEnum> DesiredState { get; set; } = new InArgument<WindowStateEnum>(WindowStateEnum.Normal);

    [DisplayName("Is Window State Changed Successfully"), Description("Indicates whether the window state was changed successfully.")]
    public OutArgument<bool> IsWindowStateChanged { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var windowElement = WindowElement.Get(context);
            var desiredState = DesiredState.Get(context);
            bool isChanged = false;

            if (windowElement == null)
            {
                status = "No window was provided to change its state.";
            }
            else
            {
                var windowPattern = windowElement.Patterns.Window.PatternOrDefault;
                if (windowPattern == null)
                {
                    status = "Sorry, this window cannot be changed automatically.";
                }
                else
                {
                    switch (desiredState)
                    {
                        case WindowStateEnum.Maximized:
                            windowPattern.SetWindowVisualState(WindowVisualState.Maximized);
                            status = "Window maximized successfully.";
                            isChanged = true;
                            break;
                        case WindowStateEnum.Minimized:
                            windowPattern.SetWindowVisualState(WindowVisualState.Minimized);
                            status = "Window minimized successfully.";
                            isChanged = true;
                            break;
                        case WindowStateEnum.Normal:
                            windowPattern.SetWindowVisualState(WindowVisualState.Normal);
                            status = "Window restored to normal state.";
                            isChanged = true;
                            break;
                        default:
                            status = "Unknown window state selected.";
                            break;
                    }
                }
            }

            IsWindowStateChanged.Set(context, isChanged);
            IsSuccess.Set(context, isChanged);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsWindowStateChanged.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"There was a problem changing the window state: {ex.Message}");
        }
    }
}
