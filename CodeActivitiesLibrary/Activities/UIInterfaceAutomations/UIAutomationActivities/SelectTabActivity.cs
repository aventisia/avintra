using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Select Tab")]
    [Description("Selects a tab from a group of tabs in a window by index or name.")]
    public class SelectTabActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Parent Window")]
        [Description("Select the window or parent element where the tab control is located.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [DisplayName("Property Type")]
        [Description("Choose how you want to search for the tab control (by Name, ID, Class Name, or Control Type).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [DisplayName("Property Value")]
        [Description("Enter the value to search for (for example, the tab control's name or ID).")]
        public InArgument<string> PropertyValue { get; set; }

        [RequiredArgument]
        [DisplayName("Tab Identifier")]
        [Description("The index (zero-based) or name of the tab to select.")]
        public InArgument<string> TabIdentifier { get; set; }


        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the tab control and selection (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;


        [DisplayName("Was Tab Selected")]
        [Description("True if the tab was selected successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasTabSelected { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
            var tabIdentifier = TabIdentifier.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            bool tabSelected = false;
            string status = "";

            try
            {
                AutomationElement tabControl = null;
                for (int i = 0; i <= (maxWaitTime * 2); i++)
                {
                    tabControl = parentElement?.FindFirst(
                        TreeScope.Descendants,
                        UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue)
                    );
                    if (tabControl != null)
                        break;
                    Thread.Sleep(500);
                }

                if (tabControl == null)
                {
                    status = "Could not find the tab control within the specified time.";
                }
                else
                {
                    AutomationElement tabItemToSelect = null;
                    bool isIndex = int.TryParse(tabIdentifier, out int tabIndex);

                    if (isIndex)
                    {
                        // Select by index
                        var tabItems = tabControl.FindAll(TreeScope.Children,
                            new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.TabItem));
                        if (tabIndex >= 0 && tabIndex < tabItems.Count)
                        {
                            tabItemToSelect = tabItems[tabIndex];
                        }
                    }
                    else
                    {
                        // Select by name
                        var tabItems = tabControl.FindAll(TreeScope.Children,
                            new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.TabItem));
                        foreach (AutomationElement tabItem in tabItems)
                        {
                            if (tabItem.Current.Name.Equals(tabIdentifier, StringComparison.OrdinalIgnoreCase))
                            {
                                tabItemToSelect = tabItem;
                                break;
                            }
                        }
                    }

                    if (tabItemToSelect != null)
                    {
                        var selectionItemPattern = tabItemToSelect.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
                        if (selectionItemPattern != null)
                        {
                            selectionItemPattern.Select();
                            tabSelected = true;
                            status = "Tab selected successfully.";
                        }
                        else
                        {
                            status = "Tab item does not support selection.";
                        }
                    }
                    else
                    {
                        status = "Could not find the specified tab item.";
                    }
                }
                WasTabSelected.Set(context, tabSelected);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error selecting tab: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}