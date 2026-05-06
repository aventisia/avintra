using NodeLibrary.UiAutomationNodes.Enums;
using NodeLibrary.UiAutomationNodes.Helpers;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Get UI Element Details"), Description("Get information like position, text, or state from a UI element in a window.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class GetUiElementDetailsNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element from which you want to retrieve details.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Detail Type"), Description("Choose what information you want to get from the UI element.")]
    public required InArgument<UiElementDetailTypeEnum> DetailType { get; set; }

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Bounding Rectangle"), Description("The bounding rectangle of the UI element, if applicable.")]
    [RenderIfCondition(nameof(DetailType), UiElementDetailTypeEnum.BoundingRectangle)]
    public OutArgument<JsonObject> BoundingRectangle { get; set; } = new OutArgument<JsonObject>();

    [DisplayName("Clickable Point"), Description("The clickable point of the UI element, if applicable.")]
    [RenderIfCondition(nameof(DetailType), UiElementDetailTypeEnum.ClickablePoint)]
    public OutArgument<JsonObject> ClickablePoint { get; set; } = new OutArgument<JsonObject>();

    [DisplayName("Label Text"), Description("The text of the label or element, if applicable.")]
    [RenderIfCondition(nameof(DetailType), UiElementDetailTypeEnum.LabelText)]
    public OutArgument<string> LabelText { get; set; } = new OutArgument<string>();

    [DisplayName("Is Enabled"), Description("True if the UI element is enabled, otherwise false.")]
    [RenderIfCondition(nameof(DetailType), UiElementDetailTypeEnum.IsEnabled)]
    public OutArgument<bool> IsEnabled { get; set; } = new OutArgument<bool>();

    [DisplayName("Is Offscreen"), Description("True if the UI element is offscreen, otherwise false.")]
    [RenderIfCondition(nameof(DetailType), UiElementDetailTypeEnum.IsOffscreen)]
    public OutArgument<bool> IsOffscreen { get; set; } = new OutArgument<bool>();

    [DisplayName("Is Password"), Description("True if the UI element is a password field, otherwise false.")]
    [RenderIfCondition(nameof(DetailType), UiElementDetailTypeEnum.IsPassword)]
    public OutArgument<bool> IsPassword { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var detailType = DetailType.Get(context);
            bool isSuccess = false;

            // Clear all outputs first
            BoundingRectangle.Set(context, null);
            ClickablePoint.Set(context, null);
            LabelText.Set(context, null);
            IsEnabled.Set(context, false);
            IsOffscreen.Set(context, false);
            IsPassword.Set(context, false);

            var elementInstance = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (elementInstance == null)
            {
                status = "UI element not found. Please check the identification path.";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
                return;
            }

            switch (detailType)
            {
                case UiElementDetailTypeEnum.BoundingRectangle:
                    var rect = elementInstance.Properties.BoundingRectangle.ValueOrDefault;
                    if (rect != null)
                    {
                        var rectObj = new JsonObject
                        {
                            ["Left"] = rect.Left,
                            ["Top"] = rect.Top,
                            ["Width"] = rect.Width,
                            ["Height"] = rect.Height
                        };
                        BoundingRectangle.Set(context, rectObj);
                        status = "Bounding rectangle retrieved successfully.";
                        isSuccess = true;
                    }
                    else
                    {
                        status = "Error: Not able to retrieve bounding rectangle.";
                    }
                    break;

                case UiElementDetailTypeEnum.ClickablePoint:
                    var clickablePoint = elementInstance.Properties.ClickablePoint.ValueOrDefault;
                    if (clickablePoint != null)
                    {
                        var pointObj = new JsonObject
                        {
                            ["X"] = clickablePoint.X,
                            ["Y"] = clickablePoint.Y
                        };
                        ClickablePoint.Set(context, pointObj);
                        status = "Clickable point retrieved successfully.";
                        isSuccess = true;
                    }
                    else
                    {
                        status = "Error: Not able to retrieve clickable point.";
                    }
                    break;

                case UiElementDetailTypeEnum.LabelText:
                    var label = elementInstance.Properties.Name.ValueOrDefault?.Trim();
                    if (!string.IsNullOrEmpty(label))
                    {
                        LabelText.Set(context, label);
                        status = "Label text retrieved successfully.";
                        isSuccess = true;
                    }
                    else
                    {
                        status = "Error: Not able to copy text from Label.";
                    }
                    break;

                case UiElementDetailTypeEnum.IsEnabled:
                    var isEnabled = elementInstance.Properties.IsEnabled.ValueOrDefault;
                    IsEnabled.Set(context, isEnabled);
                    status = "IsEnabled state retrieved successfully.";
                    isSuccess = true;
                    break;

                case UiElementDetailTypeEnum.IsOffscreen:
                    var isOffscreen = elementInstance.Properties.IsOffscreen.ValueOrDefault;
                    IsOffscreen.Set(context, isOffscreen);
                    status = "IsOffscreen state retrieved successfully.";
                    isSuccess = true;
                    break;

                case UiElementDetailTypeEnum.IsPassword:
                    var isPassword = elementInstance.Properties.IsPassword.ValueOrDefault;
                    IsPassword.Set(context, isPassword);
                    status = "IsPassword state retrieved successfully.";
                    isSuccess = true;
                    break;

                default:
                    status = "Unknown detail type selected.";
                    break;
            }

            IsSuccess.Set(context, isSuccess);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving UI element details: {ex.Message}");
        }
    }
}
