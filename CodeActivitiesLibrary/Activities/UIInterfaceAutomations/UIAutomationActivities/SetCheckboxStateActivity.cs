using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Set Checkbox State")]
    [Description("Checks or unchecks a checkbox UI element by searching for it by name within a parent element.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
    public class SetCheckboxStateActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element Identification Path")]
        [Description("The parent UI element where the checkboxes are located.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [RequiredArgument]
        [DisplayName("Checkbox Name or Index")]
        [Description("The name or zero-based index of the checkbox to set.")]
        public InArgument<string> CheckboxNameOrIndex { get; set; }

        [RequiredArgument]
        [DisplayName("Desired State")]
        [Description("Whether to check (true) or uncheck (false) the checkbox.")]
        [DefaultValue(false)]
        public InArgument<bool> Checked { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Was State Changed")]
        [Description("True if the checkbox state was changed successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasStateChanged { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var checkboxNameOrIndex = CheckboxNameOrIndex.Get(context);
            var shouldBeChecked = Checked.Get(context);

            bool stateChanged = false;
            string statusMessage = "";

            try
            {
                // Get the automation element for the parent UI element
                var parentElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (parentElement == null)
                {
                    statusMessage = "Parent UI element not found. Please check the identification path.";
                }
                else
                {
                    // Get the collection of checkboxes within the parent element
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
                            statusMessage = $"Checkbox index {idx} is out of range.";
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
                            statusMessage = $"Checkbox named '{checkboxNameOrIndex}' not found.";
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
                            statusMessage = "Checkbox state updated successfully.";
                        }
                        else
                        {
                            statusMessage = "Toggle pattern not supported on the element.";
                        }
                    }
                }

                if (!stateChanged && string.IsNullOrEmpty(statusMessage))
                {
                    statusMessage = "Checkbox not found or state not changed.";
                }

                WasStateChanged.Set(context, stateChanged);
                IsSuccess.Set(context, stateChanged);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                statusMessage = $"Error setting checkbox state: {ex.Message}";
                WasStateChanged.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, statusMessage);
            }
        }
    }
}