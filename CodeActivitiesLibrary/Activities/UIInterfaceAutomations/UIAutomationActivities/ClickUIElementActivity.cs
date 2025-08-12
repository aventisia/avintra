using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Click UI Element")]
    [Description("Invokes or clicks a UI element using UI Automation or mouse click.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
    public class ClickUIElementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element which you would like to click.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [DisplayName("Click Type")]
        [Description("Type of click: UIAutomationClick or MouseClick.")]
        [DefaultValue(ClickTypeEnum.UIAutomationClick)]
        public InArgument<ClickTypeEnum> ClickType { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Button Clicked Successfully")]
        [Description("Indicates whether the UI element was clicked successfully.")]
        public OutArgument<bool> IsClicked { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Convert IdentificationObjectPath string to list of IdentificationObject
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var clickType = ClickType.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);
            bool elementClicked = false;
            string statusMessage = "";

            try
            {
                // Get the automation element for the UI element
                var elementInstance = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                for (int i = 0; i <= (maxWaitTime * 5); i++)
                {
                    try
                    {
                        if (elementInstance != null)
                        {
                            if (clickType == ClickTypeEnum.UIAutomationClick)
                            {
                                var invokePattern = elementInstance.Patterns.Invoke.PatternOrDefault;
                                if (invokePattern != null)
                                {
                                    invokePattern.Invoke();
                                    elementClicked = true;
                                    statusMessage = "UI element clicked successfully.";
                                    break;
                                }
                                else
                                    statusMessage = "Invoke pattern not supported on this element.";
                            }
                            else if (clickType == ClickTypeEnum.MouseClick)
                            {
                                // Focus the element to ensure it is ready for interaction
                                elementInstance.Focus();
                                Thread.Sleep(200);
                                // FlaUI: Click() will move the mouse and click the element's clickable point
                                elementInstance.Click();
                                elementClicked = true;
                                Thread.Sleep(500);
                                statusMessage = "UI element clicked using mouse successfully.";
                                break;
                            }
                        }
                    }
                    catch
                    {
                        Thread.Sleep(500);
                    }
                }

                IsClicked.Set(context, elementClicked);
                IsSuccess.Set(context, elementClicked);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}