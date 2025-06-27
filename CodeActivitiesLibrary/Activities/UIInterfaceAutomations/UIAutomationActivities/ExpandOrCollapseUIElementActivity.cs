using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Expand or Collapse UI Element")]
    [Description("Expands or collapses a UI element (such as a tree item or combo box) by searching for it using a property and value.")]
    public class ExpandOrCollapseUIElementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element identification object which you would like to click.")]
        public InArgument<string> IdentificationObjectPath { get; set; }


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
            // Convert IdentificationObjectPath string to list of IdentificationObject
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var actionType = ActionType.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            bool result = false;
            string statusMessage = "";

            try
            {
                // Get the automation element for the UI element
                var elementInstance = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);
                
                if (elementInstance != null)
                {
                    var expandCollapsePattern = elementInstance.Patterns.ExpandCollapse.PatternOrDefault;
                    if (expandCollapsePattern != null)
                    {
                        if (actionType == ExpandCollapseActionEnum.Expand)
                        {
                            expandCollapsePattern.Expand();
                            statusMessage = "Element expanded successfully.";
                        }
                        else
                        {
                            expandCollapsePattern.Collapse();
                            statusMessage = "Element collapsed successfully.";
                        }
                        result = true;
                    }
                    else
                    {
                        statusMessage = "Expand/Collapse pattern not supported on the element.";
                    }
                }
                

                if (!result && string.IsNullOrEmpty(statusMessage))
                {
                    statusMessage = "Failed to expand or collapse the element within the specified time.";
                }

                WasSuccessful.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
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