using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using FlaUI.Core.Definitions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Get Selected Radio Button")]
    [Description("Retrieves the name of the selected radio button in a radio button group or the state of a specific radio button.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
    public class GetSelectedRadioButtonActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element which you would like to read the selected radio buttons from.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Selected Radio Button Name")]
        [Description("Returns the name of the selected radio button, or empty if none is selected.")]
        public OutArgument<string> SelectedRadioButton { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            string selectedRadioButton = null;
            string status = "";

            try
            {
                // Get the automation element for the UI element
                var groupElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (groupElement == null)
                {
                    status = "Could not find the radio button group.";
                }
                else
                {
                    // Find all descendant radio buttons using FlaUI
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
}