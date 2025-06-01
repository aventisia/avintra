using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Windows;
using System.Windows.Automation;
using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Click Element from Collection")]
    [Description("Finds an element in a collection by property and name, then clicks or invokes it using UI Automation or mouse click.")]
    public class ClickUIElementFromCollectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Parent Element")]
        [Description("The parent UI element under which to search for the collection.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Property Type")]
        [Description("The property type to search by (e.g., Name, AutomationId, ClassName, ControlType).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Property Value")]
        [Description("The value of the property to match for the collection.")]
        [DefaultValue("")]
        public InArgument<string> PropertyValue { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Element Name")]
        [Description("The name of the element to match within the collection.")]
        [DefaultValue("")]
        public InArgument<string> ElementName { get; set; }

        [Category("Input")]
        [DisplayName("Name Match Type")]
        [Description("How to match the element name: Equals or Contains.")]
        [DefaultValue(NameMatchTypeEnum.Equals)]
        public InArgument<NameMatchTypeEnum> NameMatchType { get; set; }

        [Category("Input")]
        [DisplayName("Click Type")]
        [Description("How to click the element: UI Automation Click or Mouse Click.")]
        [DefaultValue(ClickTypeEnum.UIAutomationClick)]
        public InArgument<ClickTypeEnum> ClickType { get; set; }

        [Category("Input")]
        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the element and click action (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [Category("Output")]
        [DisplayName("Was Clicked")]
        [Description("True if the element was clicked successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasClicked { get; set; }

        // No attributes as per instruction
        

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
            var elementName = ElementName.Get(context);
            var nameMatchType = NameMatchType.Get(context);
            var clickType = ClickType.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            bool elementClicked = false;
            string status = "";

            try
            {
                for (int j = 0; j <= (maxWaitTime * 5); j++)
                {
                    try
                    {
                        var condition = UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue);
                        AutomationElementCollection elementCollection = parentElement?.FindAll(TreeScope.Descendants, condition);

                        if (elementCollection != null)
                        {
                            for (int i = 0; i < elementCollection.Count; i++)
                            {
                                try
                                {
                                    bool match = false;
                                    string currentName = elementCollection[i].Current.Name ?? string.Empty;
                                    if (nameMatchType == NameMatchTypeEnum.Equals)
                                        match = currentName.Equals(elementName, StringComparison.OrdinalIgnoreCase);
                                    else if (nameMatchType == NameMatchTypeEnum.Contains)
                                        match = currentName.IndexOf(elementName, StringComparison.OrdinalIgnoreCase) >= 0;

                                    if (match)
                                    {
                                        if (clickType == ClickTypeEnum.UIAutomationClick)
                                        {
                                            var invokePattern = elementCollection[i].GetCurrentPattern(InvokePattern.Pattern) as InvokePattern;
                                            invokePattern?.Invoke();
                                            elementClicked = true;
                                            status = "Element invoked successfully.";
                                            break;
                                        }
                                        else if (clickType == ClickTypeEnum.MouseClick)
                                        {
                                            Thread.Sleep(200);
                                            Point clickablePoint = elementCollection[i].GetClickablePoint();
                                            MouseHelper.SendMouseClick(MouseHelper.MouseClickTypeEnum.LeftClick, clickablePoint.X, clickablePoint.Y);
                                            elementClicked = true;
                                            Thread.Sleep(500);
                                            status = "Element clicked using mouse successfully.";
                                            break;
                                        }
                                    }
                                }
                                catch
                                {
                                    continue;
                                }
                            }
                            if (elementClicked)
                                break;
                        }
                        else
                        {
                            Thread.Sleep(500);
                        }
                    }
                    catch
                    {
                        Thread.Sleep(500);
                    }
                }
                if (!elementClicked)
                {
                    status = "Failed to click the element within the specified time.";
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

    public enum NameMatchTypeEnum
    {
        [Display(Name = "Equals", Description = "Match element name exactly.")]
        Equals = 0,

        [Display(Name = "Contains", Description = "Match element name if it contains the specified value.")]
        Contains = 1
    }
}