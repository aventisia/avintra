using FlaUI.Core.AutomationElements;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Resize Window"), Description("Change the size of a window to the width and height you want.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class ResizeWindowNode : BaseNode
{
    [DisplayName("Window"), Description("Select the window you want to resize.")]
    public required InArgument<AutomationElement> WindowElement { get; set; }

    [DisplayName("Width"), Description("Enter the new width for the window (in pixels).")]
    public required InArgument<double> Width { get; set; }

    [DisplayName("Height"), Description("Enter the new height for the window (in pixels).")]
    public required InArgument<double> Height { get; set; }

    [DisplayName("Is Window Resized Successfully"), Description("Indicates whether the window was resized successfully.")]
    public OutArgument<bool> IsWindowResized { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var windowElement = WindowElement.Get(context);
            var width = Width.Get(context);
            var height = Height.Get(context);

            if (windowElement == null)
            {
                status = "No window was provided to resize.";
                IsWindowResized.Set(context, false);
                IsSuccess.Set(context, false);
            }
            else
            {
                var transformPattern = windowElement.Patterns.Transform.PatternOrDefault;
                if (transformPattern != null && transformPattern.CanResize)
                {
                    transformPattern.Resize(width, height);
                    status = "Window resized successfully.";
                    IsWindowResized.Set(context, true);
                    IsSuccess.Set(context, true);
                }
                else
                {
                    status = "Sorry, this window cannot be resized automatically.";
                    IsWindowResized.Set(context, false);
                    IsSuccess.Set(context, false);
                }
            }

            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsWindowResized.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"There was a problem resizing the window: {ex.Message}");
        }
    }
}
