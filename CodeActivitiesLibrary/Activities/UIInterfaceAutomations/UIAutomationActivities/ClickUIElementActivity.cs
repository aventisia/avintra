using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows;
using System.Windows.Automation;
using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Click UI Element")]
    [Description("Invokes or clicks a UI element using UI Automation or mouse click.")]
    public class ClickUIElementActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Element Instance")]
        [Description("The AutomationElement instance to click.")]
        public InArgument<AutomationElement> ElementInstance { get; set; }

        [Category("Input")]
        [DisplayName("Click Type")]
        [Description("Type of click: UIAutomationClick or MouseClick.")]
        [DefaultValue(ClickTypeEnum.UIAutomationClick)]
        public InArgument<ClickTypeEnum> ClickType { get; set; }

        [Category("Input")]
        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the click action (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        protected override void Execute(CodeActivityContext context)
        {
            var elementInstance = ElementInstance.Get(context);
            var clickType = ClickType.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);
            bool elementClicked = false;
            string status = "";

            try
            {
                for (int i = 0; i <= (maxWaitTime * 5); i++)
                {
                    try
                    {
                        if (elementInstance != null)
                        {
                            if (clickType == ClickTypeEnum.UIAutomationClick)
                            {
                                var invokePattern = elementInstance.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
                                invokePattern.Invoke();
                                elementClicked = true;
                                status = "UI element invoked successfully.";
                                break;
                            }
                            else if (clickType == ClickTypeEnum.MouseClick)
                            {
                                Thread.Sleep(200);
                                Point clickablePoint = elementInstance.GetClickablePoint();
                                MouseHelper.SendMouseClick(MouseHelper.MouseClickTypeEnum.LeftClick, clickablePoint.X, clickablePoint.Y);
                                elementClicked = true;
                                Thread.Sleep(500);
                                status = "UI element clicked using mouse successfully.";
                                break;
                            }
                        }
                    }
                    catch
                    {
                        Thread.Sleep(500);
                    }
                }

                if (!elementClicked)
                {
                    status = "Failed to click the UI element within the specified time.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}