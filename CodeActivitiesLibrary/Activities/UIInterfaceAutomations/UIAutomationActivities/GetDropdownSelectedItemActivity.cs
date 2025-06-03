using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Selected Item from Drop-Down List")]
    [Description("Reads and returns the selected item from a drop-down list in a window using the property you choose.")]
    public class GetDropDownSelectedItemActivity : Extensions.BaseCodeActivity
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


        [DisplayName("Selected Item")]
        [Description("The selected item found in the drop-down list.")]
        public OutArgument<string> SelectedItem { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);

            string dropdownContent = "";
            string status = "";

            try
            {
                AutomationElement dropdownElement = null;
                SelectionPattern selectionPattern = null;

                for (int i = 0; i <= 500; i++)
                {
                    try
                    {
                        dropdownElement = parentElement.FindFirst(
                            TreeScope.Descendants,
                            UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue)
                        );
                        if (dropdownElement != null)
                        {
                            selectionPattern = dropdownElement.GetCurrentPattern(SelectionPattern.Pattern) as SelectionPattern;
                            if (selectionPattern != null)
                            {
                                AutomationElement[] itemsSelected = selectionPattern.Current.GetSelection();
                                foreach (AutomationElement item in itemsSelected)
                                {
                                    dropdownContent = item.Current.Name;
                                }
                                status = "Selected item retrieved successfully.";
                            }
                            else
                            {
                                dropdownContent = "Error: Drop-down list does not support selection pattern.";
                                status = "Drop-down list does not support selection pattern.";
                            }
                            break;
                        }
                    }
                    catch
                    {
                        Thread.Sleep(10);
                    }
                    if (dropdownElement == null)
                    {
                        dropdownContent = "Error: Not able to extract selected item";
                        status = "Could not find the drop-down list.";
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error while reading selected item from drop-down list: {ex.Message}";
            }

            SelectedItem.Set(context, dropdownContent);
            StatusMessage.Set(context, status);
        }
    }
}