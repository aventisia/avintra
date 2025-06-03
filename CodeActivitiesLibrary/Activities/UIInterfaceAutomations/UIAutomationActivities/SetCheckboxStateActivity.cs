using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Set Checkbox State")]
    [Description("Checks or unchecks a checkbox UI element by searching for it using property and name.")]
    public class SetCheckboxStateActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [DisplayName("Parent Element")]
        [Description("The parent UI element under which to search for the checkbox.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]

        [DisplayName("Property Type")]
        [Description("The property type to search by (e.g., Name, AutomationId, ClassName, ControlType).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]

        [DisplayName("Property Value")]
        [Description("The value of the property to match for the checkbox.")]
        [DefaultValue("")]
        public InArgument<string> PropertyValue { get; set; }

        [RequiredArgument]

        [DisplayName("Checkbox Name")]
        [Description("The name of the checkbox to set.")]
        [DefaultValue("")]
        public InArgument<string> CheckboxName { get; set; }

        [RequiredArgument]

        [DisplayName("Desired State")]
        [Description("Whether to check or uncheck the checkbox.")]
        [DefaultValue(false)]
        public InArgument<bool> Checked { get; set; }


        [DisplayName("Was State Changed")]
        [Description("True if the checkbox state was changed successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasStateChanged { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
            var checkboxName = CheckboxName.Get(context);
            var shouldBeChecked = Checked.Get(context);

            bool stateChanged = false;
            string status = "";

            try
            {
                var condition = UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue);
                AutomationElementCollection elColl = parentElement?.FindAll(TreeScope.Descendants, condition);

                if (elColl != null)
                {
                    for (int i = 0; i < elColl.Count; i++)
                    {
                        var element = elColl[i];
                        if (checkboxName.Equals(element.Current.Name))
                        {
                            var togglePattern = element.GetCurrentPattern(TogglePattern.Pattern) as TogglePattern;
                            if (togglePattern != null)
                            {
                                bool isCurrentlyChecked = togglePattern.Current.ToggleState == ToggleState.On;
                                if (isCurrentlyChecked != shouldBeChecked)
                                {
                                    togglePattern.Toggle();
                                }
                                stateChanged = true;
                                status = "Checkbox state updated successfully.";
                            }
                            else
                            {
                                status = "Toggle pattern not supported on the element.";
                            }
                            break;
                        }
                    }
                }

                if (!stateChanged && string.IsNullOrEmpty(status))
                {
                    status = "Checkbox not found or state not changed.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error setting checkbox state: {ex.Message}";
            }

            WasStateChanged.Set(context, stateChanged);
            StatusMessage.Set(context, status);
        }
    }
}