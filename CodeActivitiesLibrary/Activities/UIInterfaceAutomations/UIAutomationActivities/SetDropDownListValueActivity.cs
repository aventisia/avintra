using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Set Drop-Down List Value in Window")]
    [Description("Selects an option in a drop-down list in a window form using the property you choose.")]
    public class SetDropDownListValueActivity : Extensions.BaseCodeActivity
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

        [RequiredArgument]
        [DisplayName("Option to Select")]
        [Description("The value or text of the option to select in the drop-down list.")]
        public InArgument<string> OptionToSelect { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
            var optionToSelect = OptionToSelect.Get(context);

            string status = "";
            bool itemSelected = false;

            try
            {
                AutomationElement dropdownElement = null;
                SelectionPattern selectionPattern = null;
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
                            selectionPattern = dropdownElement.GetCurrentPattern(SelectionPattern.Pattern) as SelectionPattern;
                            if (selectionPattern != null)
                            {
                                AutomationElement[] itemsSelected = selectionPattern.Current.GetSelection();
                                if (itemsSelected.Length == 0)
                                {
                                    expandCollapsePattern = dropdownElement.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
                                    if (expandCollapsePattern != null)
                                    {
                                        expandCollapsePattern.Expand();
                                        expandCollapsePattern.Collapse();
                                    }
                                    AutomationElement listItem = dropdownElement.FindFirst(
                                        TreeScope.Subtree,
                                        UIAutomationElementHelper.CreatePropertyCondition(PropertyTypeEnum.Name, optionToSelect)
                                    );
                                    if (listItem != null)
                                    {
                                        var ptrnSI = listItem.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
                                        if (ptrnSI != null)
                                        {
                                            ptrnSI.Select();
                                            itemSelected = true;
                                            status = "Option selected successfully.";
                                            break;
                                        }
                                    }
                                }
                                else
                                {
                                    bool alreadySelected = false;
                                    foreach (AutomationElement item in itemsSelected)
                                    {
                                        if (item.Current.Name.Equals(optionToSelect, StringComparison.OrdinalIgnoreCase))
                                        {
                                            alreadySelected = true;
                                            status = "Option is already selected.";
                                            itemSelected = true;
                                            break;
                                        }
                                    }
                                    if (!alreadySelected)
                                    {
                                        expandCollapsePattern = dropdownElement.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
                                        if (expandCollapsePattern != null)
                                        {
                                            expandCollapsePattern.Expand();
                                            expandCollapsePattern.Collapse();
                                        }
                                        AutomationElement listItem = dropdownElement.FindFirst(
                                            TreeScope.Subtree,
                                            UIAutomationElementHelper.CreatePropertyCondition(PropertyTypeEnum.Name, optionToSelect)
                                        );
                                        if (listItem != null)
                                        {
                                            var ptrnSI = listItem.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
                                            if (ptrnSI != null)
                                            {
                                                ptrnSI.Select();
                                                itemSelected = true;
                                                status = "Option selected successfully.";
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    catch
                    {
                        Thread.Sleep(400);
                    }
                    if (itemSelected)
                        break;
                }

                if (!itemSelected && string.IsNullOrEmpty(status))
                {
                    status = "Could not select the option in the drop-down list.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error setting drop-down list value: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}