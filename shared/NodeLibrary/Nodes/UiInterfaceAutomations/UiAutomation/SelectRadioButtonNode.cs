using NodeLibrary.UiAutomationNodes.Helpers;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Select Radio Button"), Description("Selects a radio button in a group by its name or zero-based index.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class SelectRadioButtonNode : BaseNode
{
    [DisplayName("UI Element"), Description("The radio button group you want to select from.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Radio Button Identifier"), Description("The name or zero-based index of the radio button to select.")]
    public required InArgument<string> RadioButtonIdentifier { get; set; }

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Was Selected"), Description("True if the radio button was selected successfully, otherwise false.")]
    public OutArgument<bool> WasSelected { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var radioButtonIdentifier = RadioButtonIdentifier.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);
            bool radioSelected = false;

            var radioGroupElement = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (radioGroupElement == null)
            {
                status = "Could not find the radio button group within the specified time.";
            }
            else
            {
                AutomationElement radioToSelect = null;
                var radioButtons = radioGroupElement.FindAllDescendants(cf => cf.ByControlType(ControlType.RadioButton));

                // Try to parse as index, otherwise treat as name
                if (int.TryParse(radioButtonIdentifier, out int radioIndex))
                {
                    if (radioIndex >= 0 && radioIndex < radioButtons.Length)
                    {
                        radioToSelect = radioButtons[radioIndex];
                    }
                    else
                    {
                        status = "Radio button index is out of range.";
                    }
                }
                else
                {
                    foreach (var radio in radioButtons)
                    {
                        if (radio.Properties.Name.ValueOrDefault.Equals(radioButtonIdentifier, StringComparison.OrdinalIgnoreCase))
                        {
                            radioToSelect = radio;
                            break;
                        }
                    }
                    if (radioToSelect == null)
                    {
                        status = "Could not find a radio button with the specified name.";
                    }
                }

                if (radioToSelect != null)
                {
                    var selectionItemPattern = radioToSelect.Patterns.SelectionItem.PatternOrDefault;
                    if (selectionItemPattern != null)
                    {
                        selectionItemPattern.Select();
                        radioSelected = true;
                        status = "Radio button selected successfully.";
                    }
                    else
                    {
                        status = "Radio button does not support selection.";
                    }
                }
            }

            WasSelected.Set(context, radioSelected);
            IsSuccess.Set(context, radioSelected);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            WasSelected.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }
}
