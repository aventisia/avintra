using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Expand Drop-Down List")]
    [Description("Expands a drop-down list so you can see all available options.")]
    public class ExpandDropDownListActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Parent Window")]
        [Description("Select the window or parent element where the drop-down list is located.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [DisplayName("Property Type")]
        [Description("Choose how you want to search for the drop-down list (by Name, ID, Class Name, or Control Type).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [DisplayName("Property Value")]
        [Description("Enter the value to search for (for example, the drop-down list's name or ID).")]
        public InArgument<string> PropertyValue { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);

            bool expanded = false;
            string status = "";

            try
            {
                AutomationElement dropdownElement = null;
                ExpandCollapsePattern expandCollapsePattern = null;

                for (int i = 1; i <= 5; i++)
                {
                    try
                    {
                        dropdownElement = parentElement.FindFirst(
                            TreeScope.Descendants,
                            UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue)
                        );
                        if (dropdownElement != null)
                        {
                            expandCollapsePattern = dropdownElement.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
                            if (expandCollapsePattern != null)
                            {
                                expandCollapsePattern.Expand();
                                expanded = true;
                                status = "Drop-down list expanded successfully.";
                                break;
                            }
                            else
                            {
                                status = "Drop-down list does not support expand/collapse.";
                            }
                        }
                    }
                    catch
                    {
                        Thread.Sleep(400);
                    }
                    if (expanded)
                        break;
                }

                if (!expanded && string.IsNullOrEmpty(status))
                {
                    status = "Could not expand the drop-down list.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error expanding drop-down list: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}