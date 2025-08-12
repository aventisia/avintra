using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Select Radio Button")]
    [Description("Selects a radio button in a group by its name or zero-based index.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
    public class SelectRadioButtonActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The radio button group you want to select from.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [RequiredArgument]
        [DisplayName("Radio Button Identifier")]
        [Description("The name or zero-based index of the radio button to select.")]
        public InArgument<string> RadioButtonIdentifier { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Was Selected")]
        [Description("True if the radio button was selected successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasSelected { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var radioButtonIdentifier = RadioButtonIdentifier.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            bool radioSelected = false;
            string statusMessage = "";

            try
            {
                // Get the automation element for the radio button group
                var radioGroupElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (radioGroupElement == null)
                {
                    statusMessage = "Could not find the radio button group within the specified time.";
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
                            statusMessage = "Radio button index is out of range.";
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
                            statusMessage = "Could not find a radio button with the specified name.";
                        }
                    }

                    if (radioToSelect != null)
                    {
                        var selectionItemPattern = radioToSelect.Patterns.SelectionItem.PatternOrDefault;
                        if (selectionItemPattern != null)
                        {
                            selectionItemPattern.Select();
                            radioSelected = true;
                            statusMessage = "Radio button selected successfully.";
                        }
                        else
                        {
                            statusMessage = "Radio button does not support selection.";
                        }
                    }
                }
                WasSelected.Set(context, radioSelected);
                IsSuccess.Set(context, radioSelected);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                WasSelected.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error selecting radio button: {ex.Message}");
            }
        }
    }
}