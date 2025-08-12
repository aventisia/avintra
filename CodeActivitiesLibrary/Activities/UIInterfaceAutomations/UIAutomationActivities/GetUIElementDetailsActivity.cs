using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Get UI Element Details")]
    [Description("Get information like position, text, or state from a UI element in a window.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
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

        [DisplayName("Bounding Rectangle")]
        [Description("The bounding rectangle of the UI element, if applicable.")]
        [RenderIfCondition(nameof(DetailType), UIElementDetailTypeEnum.BoundingRectangle)]
        public OutArgument<JObject> BoundingRectangle { get; set; }

        [DisplayName("Clickable Point")]
        [Description("The clickable point of the UI element, if applicable.")]
        [RenderIfCondition(nameof(DetailType), UIElementDetailTypeEnum.ClickablePoint)]
        public OutArgument<JObject> ClickablePoint { get; set; }

        [DisplayName("Label Text")]
        [Description("The text of the label or element, if applicable.")]
        [RenderIfCondition(nameof(DetailType), UIElementDetailTypeEnum.LabelText)]
        public OutArgument<string> LabelText { get; set; }

        [DisplayName("Is Enabled")]
        [Description("True if the UI element is enabled, otherwise false.")]
        [RenderIfCondition(nameof(DetailType), UIElementDetailTypeEnum.IsEnabled)]
        public OutArgument<bool> IsEnabled { get; set; }

        [DisplayName("Is Offscreen")]
        [Description("True if the UI element is offscreen, otherwise false.")]
        [RenderIfCondition(nameof(DetailType), UIElementDetailTypeEnum.IsOffscreen)]
        public OutArgument<bool> IsOffscreen { get; set; }

        [DisplayName("Is Password")]
        [Description("True if the UI element is a password field, otherwise false.")]
        [RenderIfCondition(nameof(DetailType), UIElementDetailTypeEnum.IsPassword)]
        public OutArgument<bool> IsPassword { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var detailType = DetailType.Get(context);
            string statusMessage = "";
            bool isSuccess = false;

            // Clear all outputs first
            BoundingRectangle.Set(context, null);
            ClickablePoint.Set(context, null);
            LabelText.Set(context, null);
            IsEnabled.Set(context, false);
            IsOffscreen.Set(context, false);
            IsPassword.Set(context, false);

            try
            {
                var elementInstance = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (elementInstance == null)
                {
                    statusMessage = "UI element not found. Please check the identification path.";
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, statusMessage);
                    return;
                }

                switch (detailType)
                {
                    case UIElementDetailTypeEnum.BoundingRectangle:
                        var rect = elementInstance.Properties.BoundingRectangle.ValueOrDefault;
                        if (rect != null)
                        {
                            var rectObj = new JObject
                            {
                                ["Left"] = rect.Left,
                                ["Top"] = rect.Top,
                                ["Width"] = rect.Width,
                                ["Height"] = rect.Height
                            };
                            BoundingRectangle.Set(context, rectObj);
                            statusMessage = "Bounding rectangle retrieved successfully.";
                            isSuccess = true;
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
                            var pointObj = new JObject
                            {
                                ["X"] = clickablePoint.X,
                                ["Y"] = clickablePoint.Y
                            };
                            ClickablePoint.Set(context, pointObj);
                            statusMessage = "Clickable point retrieved successfully.";
                            isSuccess = true;
                        }
                        else
                        {
                            statusMessage = "Error: Not able to retrieve clickable point.";
                        }
                        break;

                    case UIElementDetailTypeEnum.LabelText:
                        var label = elementInstance.Properties.Name.ValueOrDefault?.Trim();
                        if (!string.IsNullOrEmpty(label))
                        {
                            LabelText.Set(context, label);
                            statusMessage = "Label text retrieved successfully.";
                            isSuccess = true;
                        }
                        else
                        {
                            statusMessage = "Error: Not able to copy text from Label.";
                        }
                        break;

                    case UIElementDetailTypeEnum.IsEnabled:
                        var isEnabled = elementInstance.Properties.IsEnabled.ValueOrDefault;
                        IsEnabled.Set(context, isEnabled);
                        statusMessage = "IsEnabled state retrieved successfully.";
                        isSuccess = true;
                        break;

                    case UIElementDetailTypeEnum.IsOffscreen:
                        var isOffscreen = elementInstance.Properties.IsOffscreen.ValueOrDefault;
                        IsOffscreen.Set(context, isOffscreen);
                        statusMessage = "IsOffscreen state retrieved successfully.";
                        isSuccess = true;
                        break;

                    case UIElementDetailTypeEnum.IsPassword:
                        var isPassword = elementInstance.Properties.IsPassword.ValueOrDefault;
                        IsPassword.Set(context, isPassword);
                        statusMessage = "IsPassword state retrieved successfully.";
                        isSuccess = true;
                        break;

                    default:
                        statusMessage = "Unknown detail type selected.";
                        break;
                }

                IsSuccess.Set(context, isSuccess);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error retrieving UI element details: {ex.Message}");
                IsSuccess.Set(context, false);
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