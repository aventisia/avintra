using NodeLibrary.UiAutomationNodes.Helpers;
using FlaUI.Core.Definitions;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Get Selected Radio Button"), Description("Retrieves the name of the selected radio button in a radio button group or the state of a specific radio button.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class GetSelectedRadioButtonNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element which you would like to read the selected radio buttons from.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Selected Radio Button Name"), Description("Returns the name of the selected radio button, or empty if none is selected.")]
    public OutArgument<string> SelectedRadioButton { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            string selectedRadioButton = null;

            var groupElement = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (groupElement == null)
            {
                status = "Could not find the radio button group.";
            }
            else
            {
                var radioButtons = groupElement.FindAllDescendants(cf => cf.ByControlType(ControlType.RadioButton));
                foreach (var radio in radioButtons)
                {
                    var selectionItemPattern = radio.Patterns.SelectionItem.PatternOrDefault;
                    if (selectionItemPattern != null && selectionItemPattern.IsSelected.Value)
                    {
                        selectedRadioButton = radio.Name;
                        status = "Selected radio button retrieved successfully.";
                        break;
                    }
                }
                if (selectedRadioButton == null)
                {
                    status = "No radio button is selected in the group.";
                }
            }

            SelectedRadioButton.Set(context, selectedRadioButton);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving selected radio button: {ex.Message}");
        }
    }
}
