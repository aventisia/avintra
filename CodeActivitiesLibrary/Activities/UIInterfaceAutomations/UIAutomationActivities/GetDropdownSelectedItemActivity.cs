using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Get Selected Item from Drop-Down List")]
    [Description("Reads and returns the selected item from a drop-down list in a window using the property you choose.")]
    public class GetDropDownSelectedItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element which you would like to read the selected item from.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Selected Item")]
        [Description("The selected item found in the drop-down list.")]
        public OutArgument<string> SelectedItem { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Convert IdentificationObjectPath string to list of IdentificationObject
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));

            var maxWaitTime = MaxWaitTime.Get(context);
            string dropdownContent = "";
            string statusMessage = "";

            try
            {
                // Get the automation element for the UI element
                var dropdownElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (dropdownElement != null)
                {
                    var selectionPattern = dropdownElement.Patterns.Selection.PatternOrDefault;
                    if (selectionPattern != null)
                    {
                        var itemsSelected = selectionPattern.Selection.Value;
                        if (itemsSelected != null && itemsSelected.Length > 0)
                        {
                            dropdownContent = itemsSelected[0].Name;
                            statusMessage = "Selected item retrieved successfully.";
                        }
                        else
                        {
                            dropdownContent = "Error: No item is selected in the drop-down list.";
                            statusMessage = "No item is selected in the drop-down list.";
                        }
                    }
                    else
                    {
                        dropdownContent = "Error: Drop-down list does not support selection pattern.";
                        statusMessage = "Drop-down list does not support selection pattern.";
                    }
                }
                else
                {
                    dropdownContent = "Error: Not able to extract selected item";
                    statusMessage = "Could not find the drop-down list.";
                }

                SelectedItem.Set(context, dropdownContent);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error while reading selected item from drop-down list: {ex.Message}");
            }
        }
    }
}