using FlaUI.Core.AutomationElements;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Move Window"), Description("Moves a window to the position you choose on the screen.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class MoveWindowNode : BaseNode
{
    [DisplayName("Window"), Description("Select the window you want to move.")]
    public required InArgument<AutomationElement> WindowElement { get; set; }

    [DisplayName("X Position"), Description("Enter the new X position (in pixels) for the window.")]
    public required InArgument<double> XPosition { get; set; }

    [DisplayName("Y Position"), Description("Enter the new Y position (in pixels) for the window.")]
    public required InArgument<double> YPosition { get; set; }

    [DisplayName("Is Window Moved Successfully"), Description("Indicates whether the window was moved successfully.")]
    public OutArgument<bool> IsWindowMoved { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var windowElement = WindowElement.Get(context);
            var xPosition = XPosition.Get(context);
            var yPosition = YPosition.Get(context);

            if (windowElement == null)
            {
                status = "No window was provided to move.";
                IsWindowMoved.Set(context, false);
                IsSuccess.Set(context, false);
            }
            else
            {
                var transformPattern = windowElement.Patterns.Transform.PatternOrDefault;
                if (transformPattern != null && transformPattern.CanMove)
                {
                    transformPattern.Move(xPosition, yPosition);
                    status = "Window moved successfully.";
                    IsWindowMoved.Set(context, true);
                    IsSuccess.Set(context, true);
                }
                else
                {
                    status = "Sorry, this window cannot be moved automatically.";
                    IsWindowMoved.Set(context, false);
                    IsSuccess.Set(context, false);
                }
            }

            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsWindowMoved.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"There was a problem moving the window: {ex.Message}");
        }
    }
}
