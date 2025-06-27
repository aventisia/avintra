using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Select Tab")]
    [Description("Selects a tab from a group of tabs in a window.")]
    public class SelectTabActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI Element for the tab item you want to select.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

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
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);

            bool tabSelected = false;
            string statusMessage = "";

            try
            {
                var tabItemToSelect = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (tabItemToSelect != null)
                {
                    var selectionItemPattern = tabItemToSelect.Patterns.SelectionItem.PatternOrDefault;
                    if (selectionItemPattern != null)
                    {
                        selectionItemPattern.Select();
                        tabSelected = true;
                        statusMessage = "Tab selected successfully.";
                    }
                    else
                    {
                        statusMessage = "Tab item does not support selection.";
                    }
                }
                else
                {
                    statusMessage = "Could not find the specified tab item.";
                }

                WasTabSelected.Set(context, tabSelected);
                IsSuccess.Set(context, tabSelected);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error selecting tab: {ex.Message}");
            }
        }
    }
}