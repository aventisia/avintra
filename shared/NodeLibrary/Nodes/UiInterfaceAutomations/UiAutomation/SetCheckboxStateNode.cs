using NodeLibrary.UiAutomationNodes.Helpers;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Set Checkbox State"), Description("Checks or unchecks a checkbox UI element by searching for it by name within a parent element.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class SetCheckboxStateNode : BaseNode
{
    [DisplayName("UI Element Identification Path"), Description("The parent UI element where the checkboxes are located.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Checkbox Name or Index"), Description("The name or zero-based index of the checkbox to set.")]
    public required InArgument<string> CheckboxNameOrIndex { get; set; }

    [DisplayName("Desired State"), Description("Whether to check (true) or uncheck (false) the checkbox.")]
    public required InArgument<bool> Checked { get; set; }

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Was State Changed"), Description("True if the checkbox state was changed successfully, otherwise false.")]
    public OutArgument<bool> WasStateChanged { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var checkboxNameOrIndex = CheckboxNameOrIndex.Get(context);
            var shouldBeChecked = Checked.Get(context);
            bool stateChanged = false;

            var parentElement = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (parentElement == null)
            {
                status = "Parent UI element not found. Please check the identification path.";
            }
            else
            {
                var checkboxesCollection = parentElement.FindAllDescendants(cf => cf.ByControlType(ControlType.CheckBox));
                AutomationElement targetCheckbox = null;

                // Try index first
                if (int.TryParse(checkboxNameOrIndex, out int idx))
                {
                    if (idx >= 0 && idx < checkboxesCollection.Length)
                    {
                        targetCheckbox = checkboxesCollection[idx];
                    }
                    else
                    {
                        status = $"Checkbox index {idx} is out of range.";
                    }
                }
                else
                {
                    // Fallback to name
                    foreach (var element in checkboxesCollection)
                    {
                        if (checkboxNameOrIndex.Equals(element.Name, StringComparison.OrdinalIgnoreCase))
                        {
                            targetCheckbox = element;
                            break;
                        }
                    }
                    if (targetCheckbox == null)
                    {
                        status = $"Checkbox named '{checkboxNameOrIndex}' not found.";
                    }
                }

                if (targetCheckbox != null)
                {
                    var togglePattern = targetCheckbox.Patterns.Toggle.PatternOrDefault;
                    if (togglePattern != null)
                    {
                        bool isCurrentlyChecked = togglePattern.ToggleState.Value == ToggleState.On;
                        if (isCurrentlyChecked != shouldBeChecked)
                        {
                            togglePattern.Toggle();
                        }
                        stateChanged = true;
                        status = "Checkbox state updated successfully.";
                    }
                    else
                    {
                        status = "Toggle pattern not supported on the element.";
                    }
                }
            }

            if (!stateChanged && string.IsNullOrEmpty(status))
            {
                status = "Checkbox not found or state not changed.";
            }

            WasStateChanged.Set(context, stateChanged);
            IsSuccess.Set(context, stateChanged);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            WasStateChanged.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }
}
