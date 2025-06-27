using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using FlaUI.Core.Definitions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Get Selected Checkboxes")]
    [Description("Retrieves the names of the selected checkboxes in a checkbox group or the state of a specific checkbox.")]
    public class GetSelectedCheckboxesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element which you would like to read the selected checkboxes from.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Selected Checkboxes")]
        [Description("Returns the list of selected checkbox names.")]
        public OutArgument<List<string>> SelectedCheckboxes { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Convert IdentificationObjectPath string to list of IdentificationObject
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));

            var maxWaitTime = MaxWaitTime.Get(context);
            List<string> selectedCheckboxes = new List<string>();
            string statusMessage = "";

            try
            {
                // Get the automation element for the UI element
                var groupElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (groupElement == null)
                {
                    statusMessage = "Could not find the checkbox group.";
                    IsSuccess.Set(context, false);
                }
                else
                {
                    // Find all descendant checkboxes using FlaUI
                    var checkboxes = groupElement.FindAllDescendants(cf => cf.ByControlType(ControlType.CheckBox));
                    foreach (var checkbox in checkboxes)
                    {
                        var togglePattern = checkbox.Patterns.Toggle.PatternOrDefault;
                        if (togglePattern != null && togglePattern.ToggleState.Value == ToggleState.On)
                        {
                            selectedCheckboxes.Add(checkbox.Name);
                        }
                    }
                    statusMessage = "Selected checkboxes retrieved successfully.";
                    IsSuccess.Set(context, true);
                }
                SelectedCheckboxes.Set(context, selectedCheckboxes);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving selected checkboxes: {ex.Message}");
            }
        }
    }
}