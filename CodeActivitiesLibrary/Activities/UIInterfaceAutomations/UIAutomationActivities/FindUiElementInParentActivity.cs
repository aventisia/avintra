using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Find UI element in parent element")]
    [Description("Finds a specific UI element inside a window or parent element, such as a button or text box, using the property you choose.")]
    public class FindUiElementInParentActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Parent Window")]
        [Description("Select the window or parent element where you want to search for the UI element.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Property Type")]
        [Description("Choose how you want to search for the element (by Name, ID, Class Name, or Control Type).")]
        [DefaultValue(PropertyTypeEnum.AutomationId)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Property Value")]
        [Description("Enter the value to search for (for example, the button name or ID).")]
        public InArgument<string> PropertyValue { get; set; }

        [Category("Input")]
        [DisplayName("Max Wait Time (seconds)")]
        [Description("How many seconds to wait while searching for the element.")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [Category("Output")]
        [DisplayName("Found UI Element")]
        [Description("The UI element that was found. You can use this in other activities.")]
        public OutArgument<AutomationElement> FoundElement { get; set; }

        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            AutomationElement foundElement = null;
            string status = "";

            try
            {
                if (parentElement == null)
                {
                    status = "No parent window or element was provided.";
                }
                else
                {
                    Condition condition = null;
                    switch (propertyType)
                    {
                        case PropertyTypeEnum.ClassName:
                            condition = new PropertyCondition(AutomationElement.ClassNameProperty, propertyValue);
                            break;
                        case PropertyTypeEnum.AutomationId:
                            condition = new PropertyCondition(AutomationElement.AutomationIdProperty, propertyValue);
                            break;
                        case PropertyTypeEnum.Name:
                            condition = new PropertyCondition(AutomationElement.NameProperty, propertyValue);
                            break;
                        case PropertyTypeEnum.ControlType:
                            condition = new PropertyCondition(AutomationElement.LocalizedControlTypeProperty, propertyValue);
                            break;
                        default:
                            condition = new PropertyCondition(AutomationElement.NameProperty, propertyValue);
                            break;
                    }

                    foundElement = GetElementWithWait(parentElement, condition, maxWaitTime);

                    if (foundElement != null)
                    {
                        status = "UI element found successfully.";
                    }
                    else
                    {
                        status = "Could not find the UI element within the specified time.";
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error while searching for the UI element: {ex.Message}";
            }

            FoundElement.Set(context, foundElement);
            StatusMessage.Set(context, status);
        }

        /// <summary>
        /// Waits for the element to appear up to maxWaitTime seconds.
        /// </summary>
        private AutomationElement GetElementWithWait(AutomationElement parent, Condition condition, int maxWaitTime)
        {
            AutomationElement element = null;
            int retries = maxWaitTime * 2;
            for (int i = 0; i < retries; i++)
            {
                element = parent.FindFirst(TreeScope.Descendants, condition);
                if (element != null)
                    break;
                Thread.Sleep(500);
            }
            return element;
        }
    }
}