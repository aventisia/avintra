using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Select UI Element")]
    [Description("Selects the provided UI element, such as a list item or combo box option, using UI Automation.")]
    public class SelectUIElementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element you would like to select.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Was Selected")]
        [Description("True if the element was selected successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasSelected { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);

            bool elementSelected = false;
            string statusMessage = "";

            try
            {
                var elementInstance = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (elementInstance == null)
                {
                    statusMessage = "UI element not found. Please check the identification path.";
                }
                else
                {
                    var selectionItemPattern = elementInstance.Patterns.SelectionItem.PatternOrDefault;
                    if (selectionItemPattern != null)
                    {
                        selectionItemPattern.Select();
                        elementSelected = true;
                        statusMessage = "Element selected successfully.";
                    }
                    else
                    {
                        statusMessage = "The provided UI element does not support selection.";
                    }

                    // If selected, invoke the element if applicable
                    if (elementSelected)
                    {
                        var invokePattern = elementInstance.Patterns.Invoke.PatternOrDefault;
                        if (invokePattern != null)
                            invokePattern.Invoke();
                        else
                        {
                            // Mouse click if invoke pattern is not available
                            elementInstance.Focus();
                            Thread.Sleep(500);
                            // FlaUI: Click() will move the mouse and click the element's clickable point
                            elementInstance.Click();
                        }
                    }
                }

                WasSelected.Set(context, elementSelected);
                IsSuccess.Set(context, elementSelected);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                WasSelected.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}