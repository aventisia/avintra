using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Select Radio Button")]
    [Description("Selects a radio button in a window or parent element by property and value, using the radio button's name or index.")]
    public class SelectRadioButtonActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Parent Element")]
        [Description("The window or parent element where the radio button group is located.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [DisplayName("Property Type")]
        [Description("How to search for the radio button group (by Name, AutomationId, ClassName, or ControlType).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [DisplayName("Property Value")]
        [Description("The value to search for (for example, the group or container's name or ID).")]
        public InArgument<string> PropertyValue { get; set; }

        [RequiredArgument]
        [DisplayName("Radio Button Identifier")]
        [Description("The name or zero-based index of the radio button to select.")]
        public InArgument<string> RadioButtonIdentifier { get; set; }


        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the radio button group and selection (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;


        [DisplayName("Was Selected")]
        [Description("True if the radio button was selected successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasSelected { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
            var radioButtonIdentifier = RadioButtonIdentifier.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            bool radioSelected = false;
            string status = "";

            try
            {
                // Find the container/group for radio buttons
                var groupCondition = UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue);
                AutomationElement groupElement = UIAutomationElementHelper.GetElementWithWait(parentElement, groupCondition, maxWaitTime);

                if (groupElement == null)
                {
                    status = "Could not find the radio button group within the specified time.";
                }
                else
                {
                    AutomationElement radioToSelect = null;
                    var radioButtons = groupElement.FindAll(TreeScope.Descendants, new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.RadioButton));

                    // Try to parse as index, otherwise treat as name
                    if (int.TryParse(radioButtonIdentifier, out int radioIndex))
                    {
                        if (radioIndex >= 0 && radioIndex < radioButtons.Count)
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
                        foreach (AutomationElement radio in radioButtons)
                        {
                            if (radio.Current.Name.Equals(radioButtonIdentifier, StringComparison.OrdinalIgnoreCase))
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
                        var selectionItemPattern = radioToSelect.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
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
            }
            catch (Exception ex)
            {
                status = $"Error selecting radio button: {ex.Message}";
            }

            WasSelected.Set(context, radioSelected);
            StatusMessage.Set(context, status);
        }
    }
}