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
    [DisplayName("Select Option from Drop-Down or List")]
    [Description("Selects an option from a drop-down or list UI element by specifying the option's visible name or its zero-based index.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
    public class SetDropDownListValueActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Drop-Down or List UI Element")]
        [Description("The UI element representing the drop-down or list from which you want to select an option.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [RequiredArgument]
        [DisplayName("Option to Select (Name or Index)")]
        [Description("Specify the option to select by its visible name or by its zero-based index (e.g., 0 for the first item).")]
        public InArgument<string> OptionToSelect { get; set; }

        [DisplayName("Maximum Wait Time (seconds)")]
        [Description("The maximum number of seconds to wait for the drop-down or list element to appear.")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Was Option Selected?")]
        [Description("Outputs true if the option was selected successfully, otherwise false.")]
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
                            continue;
                        }

                        // Find all list items (options)
                        var listItems = dropdownElement.FindAllDescendants(cf =>
                                                                            cf.ByControlType(ControlType.ListItem)
                                                                            .Or(cf.ByControlType(ControlType.DataItem))
                                                                            .Or(cf.ByControlType(ControlType.TreeItem))
                                                                            .Or(cf.ByControlType(ControlType.MenuItem))
                                                                        );
                        AutomationElement itemToSelect = null;

                        // Try to parse as index
                        if (int.TryParse(optionToSelect, out int optionIndex))
                        {
                            if (optionIndex >= 0 && optionIndex < listItems.Length)
                            {
                                itemToSelect = listItems[optionIndex];
                            }
                            else
                            {
                                statusMessage = $"Index {optionIndex} is out of range for the drop-down options.";
                            }
                        }
                        else
                        {
                            // Select by name (case-insensitive)
                            foreach (var item in listItems)
                            {
                                if (item.Name.Equals(optionToSelect, StringComparison.OrdinalIgnoreCase))
                                {
                                    itemToSelect = item;
                                    break;
                                }
                            }
                            if (itemToSelect == null)
                            {
                                statusMessage = $"Could not find an option named '{optionToSelect}' in the drop-down list.";
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