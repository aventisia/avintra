using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Selected Radio Button")]
    [Description("Retrieves the name of the selected radio button in a radio button group or the state of a specific radio button.")]
    public class GetSelectedRadioButtonActivity : BaseCodeActivity
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


        [DisplayName("Selected Radio Button Name")]
        [Description("Returns the name of the selected radio button, or empty if none is selected.")]
        public OutArgument<string> SelectedRadioButton { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);

            string selectedRadioButton = null;
            string status = "";

            try
            {
                var groupCondition = UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue);
                AutomationElement groupElement = UIAutomationElementHelper.GetElementWithWait(parentElement, groupCondition, 5);

                if (groupElement == null)
                {
                    status = "Could not find the radio button group.";
                }
                else
                {
                    var radioButtons = groupElement.FindAll(TreeScope.Descendants, new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.RadioButton));
                    foreach (AutomationElement radio in radioButtons)
                    {
                        var selectionItemPattern = radio.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
                        if (selectionItemPattern != null && selectionItemPattern.Current.IsSelected)
                        {
                            selectedRadioButton = radio.Current.Name;
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
                status = $"Error retrieving selected radio button: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}