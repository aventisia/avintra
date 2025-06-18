using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Windows;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Get UI Element Details")]
    [Description("Get information like position or text from a UI element in a window.")]
    public class GetUiElementDetailsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("Select the UI element you want to get details from.")]
        public InArgument<AutomationElement> Element { get; set; }

        [RequiredArgument]
        [DisplayName("Detail Type")]
        [Description("Choose what information you want to get from the UI element.")]
        [DefaultValue(UIElementDetailTypeEnum.BoundingRectangle)]
        public InArgument<UIElementDetailTypeEnum> DetailType { get; set; }

        // TODO: Add different output arguments for each detail type if needed

        [DisplayName("Element Details")]
        [Description("Returns the requested details of the UI element (for example, position or text).")]
        public OutArgument<string> ElementDetails { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var element = Element.Get(context);
            var detailType = DetailType.Get(context);
            string details = "";
            string status = "";

            try
            {
                if (element == null)
                {
                    status = "No UI element was provided.";
                }
                else
                {
                    bool found = false;
                    for (int i = 1; i <= 500; i++)
                    {
                        try
                        {
                            switch (detailType)
                            {
                                case UIElementDetailTypeEnum.BoundingRectangle:
                                    Rect rect = element.Current.BoundingRectangle;
                                    details = $"Left: {rect.Left}, Top: {rect.Top}, Width: {rect.Width}, Height: {rect.Height}";
                                    found = true;
                                    status = "Bounding rectangle retrieved successfully.";
                                    break;

                                case UIElementDetailTypeEnum.ClickablePoint:
                                    Point point = element.GetClickablePoint();
                                    details = $"X: {point.X}, Y: {point.Y}";
                                    found = true;
                                    status = "Clickable point retrieved successfully.";
                                    break;

                                case UIElementDetailTypeEnum.LabelText:
                                    details = element.Current.Name;
                                    found = !string.IsNullOrEmpty(details);
                                    status = found ? "Label text retrieved successfully." : "Error: Not able to copy text from Label";
                                    break;

                                case UIElementDetailTypeEnum.TextBoxText:
                                    var textboxPattern = element.GetCurrentPattern(TextPattern.Pattern) as TextPattern;
                                    if (textboxPattern != null)
                                    {
                                        details = textboxPattern.DocumentRange.GetText(-1).TrimEnd('\r');
                                        found = !string.IsNullOrEmpty(details);
                                        status = found ? "Textbox text retrieved successfully." : "Error: Not able to copy text from TextBox";
                                    }
                                    break;

                                default:
                                    status = "Unknown detail type selected.";
                                    break;
                            }
                        }
                        catch
                        {
                            Thread.Sleep(10);
                        }
                        if (found)
                            break;
                    }
                    if (!found && string.IsNullOrEmpty(status))
                    {
                        status = "Could not retrieve the requested detail from the UI element.";
                    }
                    ElementDetails.Set(context, details);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, status);
                }
            }
            catch (Exception ex)
            {
                status = $"Error retrieving UI element details: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
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

        [Display(Name = "TextBox Text", Description = "Get the text from a textbox element.")]
        TextBoxText = 3
    }
}