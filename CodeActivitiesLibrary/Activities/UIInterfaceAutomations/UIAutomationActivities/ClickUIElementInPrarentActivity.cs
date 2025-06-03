using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Click UI Element in Parent")]
    [Description("Finds a UI element by property and clicks or invokes it using UI Automation or mouse click.")]
    public class ClickUIElementInParentActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Parent Element")]
        [Description("The parent UI element under which to search for the target element.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [DisplayName("Property Type")]
        [Description("The property type to search by (e.g., Name, AutomationId, ClassName, ControlType).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [DisplayName("Property Value")]
        [Description("The value of the property to match for the target element.")]
        [DefaultValue("")]
        public InArgument<string> PropertyValue { get; set; }


        [DisplayName("Click Type")]
        [Description("How to click the element: UI Automation Click or Mouse Click.")]
        [DefaultValue(ClickTypeEnum.UIAutomationClick)]
        public InArgument<ClickTypeEnum> ClickType { get; set; }


        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the element and click action (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;


        [DisplayName("Was Clicked")]
        [Description("True if the element was clicked successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasClicked { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
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
                        var condition = UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue);
                        var actionableElement = UIAutomationElementHelper.GetElementWithWait(parentElement, condition, 1);
                        if (actionableElement != null)
                        {
                            if (clickType == ClickTypeEnum.UIAutomationClick)
                            {
                                var invokePattern = actionableElement.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
                                invokePattern?.Invoke();
                                elementClicked = true;
                                status = "UI element invoked successfully.";
                                break;
                            }
                            else if (clickType == ClickTypeEnum.MouseClick)
                            {
                                System.Threading.Thread.Sleep(200);
                                Point clickablePoint = actionableElement.GetClickablePoint();
                                MouseHelper.SendMouseClick(MouseHelper.MouseClickTypeEnum.LeftClick, clickablePoint.X, clickablePoint.Y);
                                elementClicked = true;
                                System.Threading.Thread.Sleep(500);
                                status = "UI element clicked using mouse successfully.";
                                break;
                            }
                            else
                            {
                                System.Threading.Thread.Sleep(500);
                            }
                        }
                    }
                    catch
                    {
                        System.Threading.Thread.Sleep(500);
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

            WasClicked.Set(context, elementClicked);
            StatusMessage.Set(context, status);
        }
    }
}