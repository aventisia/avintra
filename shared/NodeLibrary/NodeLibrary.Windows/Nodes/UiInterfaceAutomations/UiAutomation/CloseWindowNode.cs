using FlaUI.Core.AutomationElements;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Close Window"), Description("Closes the selected application window.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class CloseWindowNode : BaseNode
{
    [DisplayName("Window"), Description("Select the window you want to close.")]
    public required InArgument<AutomationElement> WindowElement { get; set; }

    [DisplayName("Is Window Closed Successfully"), Description("Indicates whether the window was closed successfully.")]
    public OutArgument<bool> IsWindowClosed { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var windowElement = WindowElement.Get(context);

            if (windowElement == null)
            {
                status = "No window was provided to close.";
                IsWindowClosed.Set(context, false);
            }
            else
            {
                var window = windowElement.AsWindow();
                if (window != null)
                {
                    window.Close();
                    IsWindowClosed.Set(context, true);
                    status = "The window was closed successfully.";
                }
                else
                {
                    IsWindowClosed.Set(context, false);
                    status = "Sorry, this window cannot be closed automatically.";
                }
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"There was a problem closing the window: {ex.Message}");
        }
    }
}
