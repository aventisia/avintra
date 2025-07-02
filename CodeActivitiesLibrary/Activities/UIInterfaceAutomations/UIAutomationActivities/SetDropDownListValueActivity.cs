using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Set Drop-Down List Value in Window")]
    [Description("Selects an option in a drop-down list in a window form using the property you choose.")]
    public class SetDropDownListValueActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The drop-down list element you would like to set the value for.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [RequiredArgument]
        [DisplayName("Option to Select")]
        [Description("The value or text of the option to select in the drop-down list.")]
        public InArgument<string> OptionToSelect { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Is Option Selected Successfully")]
        [Description("True if the option was selected successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> IsOptionSelected { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Convert IdentificationObjectPath string to list of IdentificationObject
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var optionToSelect = OptionToSelect.Get(context);

            string statusMessage = "";
            bool itemSelected = false;

            try
            {
                // Get the automation element for the drop-down list
                var dropdownElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (dropdownElement == null)
                {
                    statusMessage = "Could not find the drop-down list within the specified time.";
                    IsOptionSelected.Set(context, false);
                    StatusMessage.Set(context, statusMessage);
                    return;
                }

                for (int i = 1; i <= 5; i++)
                {
                    try
                    {
                        // Try to expand the drop-down if possible
                        var expandCollapsePattern = dropdownElement.Patterns.ExpandCollapse.PatternOrDefault;
                        if (expandCollapsePattern != null && expandCollapsePattern.ExpandCollapseState.Value != ExpandCollapseState.Expanded)
                        {
                            expandCollapsePattern.Expand();
                            Thread.Sleep(200);
                        }

                        // Find all list items (options)
                        var listItems = dropdownElement.FindAllDescendants(cf => cf.ByControlType(ControlType.ListItem));
                        AutomationElement itemToSelect = null;
                        foreach (var item in listItems)
                        {
                            if (item.Name.Equals(optionToSelect, StringComparison.OrdinalIgnoreCase))
                            {
                                itemToSelect = item;
                                break;
                            }
                        }

                        if (itemToSelect != null)
                        {
                            var selectionItemPattern = itemToSelect.Patterns.SelectionItem.PatternOrDefault;
                            if (selectionItemPattern != null)
                            {
                                selectionItemPattern.Select();
                                itemSelected = true;
                                statusMessage = "Option selected successfully.";
                            }
                            else
                            {
                                statusMessage = "The option does not support selection.";
                            }
                        }
                        else
                        {
                            statusMessage = "Could not find the specified option in the drop-down list.";
                        }

                        // Optionally collapse the drop-down after selection
                        if (expandCollapsePattern != null && expandCollapsePattern.ExpandCollapseState.Value == ExpandCollapseState.Expanded)
                        {
                            expandCollapsePattern.Collapse();
                        }
                    }
                    catch
                    {
                        Thread.Sleep(400);
                    }
                    if (itemSelected)
                        break;
                }

                if (!itemSelected && string.IsNullOrEmpty(statusMessage))
                {
                    statusMessage = "Could not select the option in the drop-down list.";
                }

                IsOptionSelected.Set(context, itemSelected);
                IsSuccess.Set(context, itemSelected);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsOptionSelected.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error setting drop-down list value: {ex.Message}");
            }
        }
    }
}