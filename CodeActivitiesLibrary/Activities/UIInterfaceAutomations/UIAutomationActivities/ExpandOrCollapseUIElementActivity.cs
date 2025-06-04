using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Expand or Collapse UI Element")]
    [Description("Expands or collapses a UI element (such as a tree item or combo box) by searching for it using a property and value.")]
    public class ExpandOrCollapseUIElementActivity : BaseCodeActivity
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


        [DisplayName("Action Type")]
        [Description("Choose whether to expand or collapse the element.")]
        [DefaultValue(ExpandCollapseActionEnum.Expand)]
        public InArgument<ExpandCollapseActionEnum> ActionType { get; set; }


        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the element and action (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;


        [DisplayName("Was Successful")]
        [Description("True if the element was expanded or collapsed successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> WasSuccessful { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
            var actionType = ActionType.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            bool result = false;
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
                            var expandCollapsePattern = actionableElement.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern;
                            if (expandCollapsePattern != null)
                            {
                                if (actionType == ExpandCollapseActionEnum.Expand)
                                {
                                    expandCollapsePattern.Expand();
                                    status = "Element expanded successfully.";
                                }
                                else
                                {
                                    expandCollapsePattern.Collapse();
                                    status = "Element collapsed successfully.";
                                }
                                result = true;
                            }
                            else
                            {
                                status = "Expand/Collapse pattern not supported on the element.";
                            }
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
                if (!result && string.IsNullOrEmpty(status))
                {
                    status = "Failed to expand or collapse the element within the specified time.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error: {ex.Message}";
            }

            WasSuccessful.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }

    public enum ExpandCollapseActionEnum
    {
        [Display(Name = "Expand", Description = "Expand the UI element.")]
        Expand = 0,

        [Display(Name = "Collapse", Description = "Collapse the UI element.")]
        Collapse = 1
    }
}