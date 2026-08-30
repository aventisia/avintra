using NodeLibrary.UiAutomationNodes.Helpers;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Set Focus on UI Element"), Description("Brings the specified UI element into focus, allowing further interaction.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class SetFocusOnElementNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element to bring into focus.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Is Focus Set Successfully"), Description("True if the focus was set successfully, otherwise false.")]
    public OutArgument<bool> IsFocused { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            bool focusSet = false;

            var elementInstance = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (elementInstance == null)
            {
                status = "UI element not found. Please check the identification path.";
            }
            else
            {
                elementInstance.Focus();
                focusSet = true;
                status = "Focus set successfully.";
            }

            IsFocused.Set(context, focusSet);
            IsSuccess.Set(context, focusSet);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsFocused.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Could not set focus: {ex.Message}");
        }
    }
}
