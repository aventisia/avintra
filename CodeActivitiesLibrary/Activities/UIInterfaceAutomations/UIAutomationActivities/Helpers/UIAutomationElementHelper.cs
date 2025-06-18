using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Enums;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers
{
    /// <summary>
    /// Helper methods for finding UI Automation elements.
    /// </summary>
    public static class UIAutomationElementHelper
    {
        /// <summary>
        /// Waits for a UI Automation element matching the given condition to appear under the parent element, up to the specified number of seconds.
        /// </summary>
        /// <param name="parentElement">The parent AutomationElement to search within.</param>
        /// <param name="condition">The condition to match.</param>
        /// <param name="maxWaitTime">Maximum wait time in seconds.</param>
        /// <returns>The found AutomationElement, or null if not found.</returns>
        public static AutomationElement GetElementWithWait(AutomationElement parentElement, Condition condition, int maxWaitTime)
        {
            AutomationElement element = null;
            try
            {
                for (int i = 0; i <= (maxWaitTime * 2); i++)
                {
                    try
                    {
                        element = parentElement.FindFirst(TreeScope.Descendants, condition);
                    }
                    catch
                    {
                        Thread.Sleep(500);
                    }
                    if (element == null)
                        Thread.Sleep(500);
                    else
                        return element;
                }
            }
            catch
            {
                // Optionally log or handle exception
            }
            return element;
        }

        /// <summary>
        /// Creates a property condition based on the property type and value.
        /// </summary>
        /// <param name="propertyType">The property type enum.</param>
        /// <param name="propertyValue">The property value to match.</param>
        /// <returns>A PropertyCondition for the specified property type and value.</returns>
        public static Condition CreatePropertyCondition(PropertyTypeEnum propertyType, string propertyValue)
        {
            switch (propertyType)
            {
                case PropertyTypeEnum.AutomationId:
                    return new PropertyCondition(AutomationElement.AutomationIdProperty, propertyValue);
                case PropertyTypeEnum.ClassName:
                    return new PropertyCondition(AutomationElement.ClassNameProperty, propertyValue);
                case PropertyTypeEnum.ControlType:
                    return new PropertyCondition(AutomationElement.LocalizedControlTypeProperty, propertyValue);
                case PropertyTypeEnum.Name:
                default:
                    return new PropertyCondition(AutomationElement.NameProperty, propertyValue);
            }
        }
    }
}