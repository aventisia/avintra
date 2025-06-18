using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Select UI Element")]
    [Description("Selects the provided UI element, such as a list item or combo box option, using UI Automation.")]
    public class SelectUIElementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Element Instance")]
        [Description("The UI element instance to select.")]
        public InArgument<AutomationElement> ElementInstance { get; set; }


        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the selection action (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;


        [DisplayName("Was Selected")]
        [Description("True if the element was selected successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasSelected { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var elementInstance = ElementInstance.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            bool elementSelected = false;
            string status = "";

            try
            {
                for (int i = 0; i <= (maxWaitTime * 5); i++)
                {
                    try
                    {
                        if (elementInstance != null)
                        {
                            var selectionItemPattern = elementInstance.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern;
                            selectionItemPattern?.Select();
                            elementSelected = true;
                            status = "Element selected successfully.";
                            break;
                        }
                    }
                    catch
                    {
                        Thread.Sleep(500);
                    }
                }
                if (!elementSelected)
                {
                    status = "Failed to select the element within the specified time.";
                }
                WasSelected.Set(context, elementSelected);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}