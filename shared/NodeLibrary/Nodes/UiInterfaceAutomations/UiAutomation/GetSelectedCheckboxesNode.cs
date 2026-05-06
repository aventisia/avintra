using NodeLibrary.UiAutomationNodes.Helpers;
using FlaUI.Core.Definitions;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Get Selected Checkboxes"), Description("Retrieves the names of the selected checkboxes in a checkbox group or the state of a specific checkbox.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class GetSelectedCheckboxesNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element which you would like to read the selected checkboxes from.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Selected Checkboxes"), Description("Returns the list of selected checkbox names.")]
    public OutArgument<List<string>> SelectedCheckboxes { get; set; } = new OutArgument<List<string>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var selectedCheckboxes = new List<string>();

            var groupElement = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (groupElement == null)
            {
                status = "Could not find the checkbox group.";
                IsSuccess.Set(context, false);
            }
            else
            {
                var checkboxes = groupElement.FindAllDescendants(cf => cf.ByControlType(ControlType.CheckBox));
                foreach (var checkbox in checkboxes)
                {
                    var togglePattern = checkbox.Patterns.Toggle.PatternOrDefault;
                    if (togglePattern != null && togglePattern.ToggleState.Value == ToggleState.On)
                    {
                        selectedCheckboxes.Add(checkbox.Name);
                    }
                }
                status = "Selected checkboxes retrieved successfully.";
                IsSuccess.Set(context, true);
            }

            SelectedCheckboxes.Set(context, selectedCheckboxes);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving selected checkboxes: {ex.Message}");
        }
    }
}
