using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Click on Web Page"), Description("Simulates clicking a UI element (e.g., link, button) on a web page.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class ClickLinkOnWebPageNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The selector used to locate the link or button on the web page.")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Click Type"), Description("Specifies the type of click to perform.")]
    public InArgument<ClickLinClickTypeEnum> ClickType { get; set; } = new InArgument<ClickLinClickTypeEnum>(ClickLinClickTypeEnum.LeftClick);

    [DisplayName("Send Physical Click"), Description("If true, simulates physical mouse movement before clicking.")]
    public InArgument<bool> SendPhysicalClick { get; set; } = new InArgument<bool>(true);

    [DisplayName("Wait for Page Load"), Description("If true, waits for the next page to load after the click.")]
    public InArgument<bool> WaitForPageLoad { get; set; } = new InArgument<bool>(true);

    [DisplayName("Timeout for Page Load"), Description("The maximum time (in seconds) to wait for the page to load.")]
    public InArgument<int> TimeoutForPageLoad { get; set; } = new InArgument<int>(60);

    [DisplayName("Handle Dialog"), Description("Specifies what to do if a dialog appears after the click.")]
    public InArgument<DialogActionEnum> IfDialogAppears { get; set; } = new InArgument<DialogActionEnum>(DialogActionEnum.DoNothing);

    [DisplayName("Dialog Button to Press"), Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
    public InArgument<string> DialogButtonToPress { get; set; } = new InArgument<string>("Ok");

    [DisplayName("Mouse Position Relative to Element"), Description("Specifies where to position the mouse relative to the element before clicking.")]
    public InArgument<ClickLinMousePositionEnum> MousePosition { get; set; } = new InArgument<ClickLinMousePositionEnum>(ClickLinMousePositionEnum.MiddleCenter);

    [DisplayName("Offset X"), Description("Move the mouse this many pixels horizontally from the selected position.")]
    public InArgument<int> OffsetX { get; set; } = new InArgument<int>(0);

    [DisplayName("Offset Y"), Description("Move the mouse this many pixels vertically from the selected position.")]
    public InArgument<int> OffsetY { get; set; } = new InArgument<int>(0);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var uiElement = ValueToFind.Get(context) ?? string.Empty;
            var findType = FindType.Get(context);
            var clickType = ClickType.Get(context);
            var sendPhysicalClick = SendPhysicalClick.Get(context);
            var waitForPageLoad = WaitForPageLoad.Get(context);
            var timeout = TimeoutForPageLoad.Get(context);
            var dialogAction = IfDialogAppears.Get(context);
            var dialogButton = DialogButtonToPress.Get(context) ?? string.Empty;
            var mousePosition = MousePosition.Get(context);
            var offsetX = OffsetX.Get(context);
            var offsetY = OffsetY.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(uiElement))
                throw new ArgumentException("UI Element must be specified.");

            // Locate the element
            var element = BrowserAutomationHelper.FindElement(driver, findType, uiElement);

            if (element == null)
                throw new InvalidOperationException($"No element found using '{findType}': '{uiElement}'");

            // Optional: Move mouse to specific location before clicking
            if (sendPhysicalClick)
            {
                var action = new Actions(driver);
                switch (mousePosition)
                {
                    case ClickLinMousePositionEnum.TopLeft:
                        action.MoveToElement(element, -element.Size.Width / 2 + offsetX, -element.Size.Height / 2 + offsetY);
                        break;
                    case ClickLinMousePositionEnum.MiddleLeft:
                        action.MoveToElement(element, -element.Size.Width / 2 + offsetX, 0 + offsetY);
                        break;
                    case ClickLinMousePositionEnum.BottomLeft:
                        action.MoveToElement(element, -element.Size.Width / 2 + offsetX, element.Size.Height / 2 + offsetY);
                        break;
                    case ClickLinMousePositionEnum.TopCenter:
                        action.MoveToElement(element, 0 + offsetX, -element.Size.Height / 2 + offsetY);
                        break;
                    case ClickLinMousePositionEnum.MiddleCenter:
                        action.MoveToElement(element, offsetX, offsetY);
                        break;
                    case ClickLinMousePositionEnum.BottomCenter:
                        action.MoveToElement(element, 0 + offsetX, element.Size.Height / 2 + offsetY);
                        break;
                    case ClickLinMousePositionEnum.TopRight:
                        action.MoveToElement(element, element.Size.Width / 2 + offsetX, -element.Size.Height / 2 + offsetY);
                        break;
                    case ClickLinMousePositionEnum.MiddleRight:
                        action.MoveToElement(element, element.Size.Width / 2 + offsetX, offsetY);
                        break;
                    case ClickLinMousePositionEnum.BottomRight:
                        action.MoveToElement(element, element.Size.Width / 2 + offsetX, element.Size.Height / 2 + offsetY);
                        break;
                    default:
                        action.MoveToElement(element, offsetX, offsetY);
                        break;
                }
                action.Click().Build().Perform();
            }
            else
            {
                switch (clickType)
                {
                    case ClickLinClickTypeEnum.LeftClick:
                        element.Click();
                        break;
                    case ClickLinClickTypeEnum.DoubleClick:
                        new Actions(driver).DoubleClick(element).Build().Perform();
                        break;
                    case ClickLinClickTypeEnum.RightClick:
                        new Actions(driver).ContextClick(element).Build().Perform();
                        break;
                    case ClickLinClickTypeEnum.LeftButtonDown:
                        new Actions(driver).ClickAndHold(element).Build().Perform();
                        break;
                    case ClickLinClickTypeEnum.LeftButtonUp:
                        new Actions(driver).Release(element).Build().Perform();
                        break;
                    case ClickLinClickTypeEnum.RightButtonDown:
                        new Actions(driver).ContextClick(element).Build().Perform();
                        break;
                    case ClickLinClickTypeEnum.RightButtonUp:
                        new Actions(driver).Release(element).Build().Perform();
                        break;
                    case ClickLinClickTypeEnum.MiddleClick:
                        new Actions(driver).Click(element).Build().Perform();
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(clickType));
                }
            }

            // Optional: Wait for page to load
            if (waitForPageLoad && timeout > 0)
            {
                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeout));
                wait.Until(d =>
                    d != null && "complete".Equals(((IJavaScriptExecutor)d).ExecuteScript("return document.readyState")));
            }

            // Optional: Handle alert popup
            if (dialogAction != DialogActionEnum.DoNothing)
                try
                {
                    var alert = driver.SwitchTo().Alert();
                    if (alert != null)
                    {
                        if (dialogAction == DialogActionEnum.PressAButton)
                            alert.SendKeys(dialogButton);
                        alert.Accept();
                    }
                }
                catch (NoAlertPresentException) { }

            status = $"Successfully clicked '{uiElement}' using '{clickType}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error during click: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum ClickLinClickTypeEnum
{
    [Display(Name = "Left Click", Description = "Standard left mouse click.")]
    LeftClick,

    [Display(Name = "Right Click", Description = "Right mouse click.")]
    RightClick,

    [Display(Name = "Double Click", Description = "Double-click with the left mouse button.")]
    DoubleClick,

    [Display(Name = "Left Button Down", Description = "Mouse left button down only.")]
    LeftButtonDown,

    [Display(Name = "Left Button Up", Description = "Mouse left button up only.")]
    LeftButtonUp,

    [Display(Name = "Right Button Down", Description = "Mouse right button down only.")]
    RightButtonDown,

    [Display(Name = "Right Button Up", Description = "Mouse right button up only.")]
    RightButtonUp,

    [Display(Name = "Middle Click", Description = "Middle mouse button click.")]
    MiddleClick
}

public enum ClickLinMousePositionEnum
{
    [Display(Name = "Top Left", Description = "Positions the mouse at the top-left of the element.")]
    TopLeft,

    [Display(Name = "Middle Left", Description = "Positions the mouse at the middle-left of the element.")]
    MiddleLeft,

    [Display(Name = "Bottom Left", Description = "Positions the mouse at the bottom-left of the element.")]
    BottomLeft,

    [Display(Name = "Top Center", Description = "Positions the mouse at the top-center of the element.")]
    TopCenter,

    [Display(Name = "Middle Center", Description = "Positions the mouse in the center of the element.")]
    MiddleCenter,

    [Display(Name = "Bottom Center", Description = "Positions the mouse at the bottom-center of the element.")]
    BottomCenter,

    [Display(Name = "Top Right", Description = "Positions the mouse at the top-right of the element.")]
    TopRight,

    [Display(Name = "Middle Right", Description = "Positions the mouse at the middle-right of the element.")]
    MiddleRight,

    [Display(Name = "Bottom Right", Description = "Positions the mouse at the bottom-right of the element.")]
    BottomRight
}
