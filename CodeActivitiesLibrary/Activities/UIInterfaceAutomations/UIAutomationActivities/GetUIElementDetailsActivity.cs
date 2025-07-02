using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Get UI Element Details")]
    [Description("Get information like position, text, or state from a UI element in a window.")]
    public class GetUiElementDetailsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element from which you want to retrieve details.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [RequiredArgument]
        [DisplayName("Detail Type")]
        [Description("Choose what information you want to get from the UI element.")]
        [DefaultValue(UIElementDetailTypeEnum.BoundingRectangle)]
        public InArgument<UIElementDetailTypeEnum> DetailType { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Element Details")]
        [Description("Returns the requested details of the UI element (for example, position, text, or state).")]
        public OutArgument<string> ElementDetails { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var detailType = DetailType.Get(context);
            string elementDetails = string.Empty;
            string statusMessage = "";

            try
            {
                // Get the UI element instance using the provided identification path
                var elementInstance = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                // If the element is not found, set the status and exit
                if (elementInstance == null)
                {
                    ElementDetails.Set(context, elementDetails);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "UI element not found. Please check the identification path.");
                    return;
                }

                switch (detailType)
                {
                    case UIElementDetailTypeEnum.BoundingRectangle:
                        var rect = elementInstance.Properties.BoundingRectangle.ValueOrDefault;
                        if (rect != null)
                        {
                            elementDetails = $"{{\"Left\": {rect.Left}, \"Top\": {rect.Top}, \"Width\": {rect.Width}, \"Height\": {rect.Height}}}";
                            statusMessage = "Bounding rectangle retrieved successfully.";
                        }
                        else
                        {
                            statusMessage = "Error: Not able to retrieve bounding rectangle.";
                        }
                        break;
                    case UIElementDetailTypeEnum.ClickablePoint:
                        var clickablePoint = elementInstance.Properties.ClickablePoint.ValueOrDefault;
                        if (clickablePoint != null)
                        {
                            elementDetails = $"{{\"X\": {clickablePoint.X}, \"Y\": {clickablePoint.Y}}}";
                            statusMessage = "Clickable point retrieved successfully.";
                        }
                        else
                        {
                            statusMessage = "Error: Not able to retrieve clickable point.";
                        }
                        break;
                    case UIElementDetailTypeEnum.LabelText:
                        elementDetails = elementInstance.Properties.Name.ValueOrDefault?.Trim();
                        statusMessage = !string.IsNullOrEmpty(elementDetails) ? "Label text retrieved successfully." : "Error: Not able to copy text from Label";
                        break;

                    case UIElementDetailTypeEnum.IsEnabled:
                        elementDetails = elementInstance.Properties.IsEnabled.ValueOrDefault.ToString();
                        statusMessage = !string.IsNullOrEmpty(elementDetails) ? "IsEnabled state retrieved successfully." : "Error: Not able to retrieve IsEnabled state.";
                        break;

                    case UIElementDetailTypeEnum.IsOffscreen:
                        elementDetails = elementInstance.Properties.IsOffscreen.ValueOrDefault.ToString();
                        statusMessage = !string.IsNullOrEmpty(elementDetails) ? "IsOffscreen state retrieved successfully." : "Error: Not able to retrieve IsOffscreen state.";
                        break;

                    case UIElementDetailTypeEnum.IsPassword:
                        elementDetails = elementInstance.Properties.IsPassword.ValueOrDefault.ToString();
                        statusMessage = !string.IsNullOrEmpty(elementDetails) ? "IsPassword state retrieved successfully." : "Error: Not able to retrieve IsPassword state.";
                        break;
                    default:
                        statusMessage = "Unknown detail type selected.";
                        break;
                }

                // Check if the elementDetails is empty or null
                if (string.IsNullOrEmpty(elementDetails))
                    statusMessage = "Could not retrieve the requested detail from the UI element.";

                // Set the success status
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                statusMessage = $"Error retrieving UI element details: {ex.Message}";
                IsSuccess.Set(context, false);
            }
            finally
            {
                ElementDetails.Set(context, elementDetails);
                StatusMessage.Set(context, statusMessage);
            }
        }
    }

    public enum UIElementDetailTypeEnum
    {
        [Display(Name = "Bounding Rectangle", Description = "Get the bounding rectangle of the element.")]
        BoundingRectangle = 0,

        [Display(Name = "Clickable Point", Description = "Get the clickable point of the element.")]
        ClickablePoint = 1,

        [Display(Name = "Label Text", Description = "Get the text from a label element.")]
        LabelText = 2,

        [Display(Name = "Is Enabled", Description = "Check if the element is enabled.")]
        IsEnabled = 3,

        [Display(Name = "Is Offscreen", Description = "Check if the element is offscreen (not visible to the user).")]
        IsOffscreen = 4,

        [Display(Name = "Is Password", Description = "Check if the element is a password field.")]
        IsPassword = 5
    }
}