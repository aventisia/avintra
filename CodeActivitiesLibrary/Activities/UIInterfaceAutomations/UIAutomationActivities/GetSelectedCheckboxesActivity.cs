using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Selected Checkboxes")]
    [Description("Retrieves the names of the selected checkboxes in a checkbox group or the state of a specific checkbox.")]
    public class GetSelectedCheckboxesActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Parent Element")]
        [Description("The parent UI element or window where the checkbox group is located.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [DisplayName("Property Type")]
        [Description("How to search for the checkbox group (by Name, AutomationId, ClassName, or ControlType).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [DisplayName("Property Value")]
        [Description("The value to search for (for example, the group or container's name or ID).")]
        public InArgument<string> PropertyValue { get; set; }


        [DisplayName("Selected Checkboxes")]
        [Description("Returns the list of selected checkbox names.")]
        public OutArgument<List<string>> SelectedCheckboxes { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);

            List<string> selectedCheckboxes = new List<string>();
            string status = "";

            try
            {
                var groupCondition = UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue);
                AutomationElement groupElement = UIAutomationElementHelper.GetElementWithWait(parentElement, groupCondition, 5);

                if (groupElement == null)
                {
                    status = "Could not find the checkbox group.";
                }
                else
                {
                    var checkboxes = groupElement.FindAll(TreeScope.Descendants, new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.CheckBox));
                    foreach (AutomationElement checkbox in checkboxes)
                    {
                        var togglePattern = checkbox.GetCurrentPattern(TogglePattern.Pattern) as TogglePattern;
                        if (togglePattern != null && togglePattern.Current.ToggleState == ToggleState.On)
                        {
                            selectedCheckboxes.Add(checkbox.Current.Name);
                        }
                    }
                    status = "Selected checkboxes retrieved successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error retrieving selected checkboxes: {ex.Message}";
            }

            SelectedCheckboxes.Set(context, selectedCheckboxes);
            StatusMessage.Set(context, status);
        }
    }
}