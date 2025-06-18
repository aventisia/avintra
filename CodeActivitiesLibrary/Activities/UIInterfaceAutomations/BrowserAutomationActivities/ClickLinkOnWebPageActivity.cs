using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Click Link on Web Page")]
    [Description("Simulates clicking a UI element (e.g., link, button) on a web page.")]
    public class ClickLinkOnWebPageActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }


        [RequiredArgument]
        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        [DefaultValue(ElementSelectorTypeEnum.XPath)]
        public InArgument<ElementSelectorTypeEnum> FindType { get; set; } =
            new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

        [RequiredArgument]
        [DisplayName("Value To Find")]
        [Description("The selector used to locate the link or button on the web page.")]
        public InArgument<string> ValueToFind { get; set; }

        [DisplayName("Click Type")]
        [Description("Specifies the type of click to perform.")]
        [DefaultValue(ClickLinClickTypeEnum.LeftClick)]
        public InArgument<ClickLinClickTypeEnum> ClickType { get; set; }


        [DisplayName("Send Physical Click")]
        [Description("If true, simulates physical mouse movement before clicking.")]
        [DefaultValue(true)]
        public InArgument<bool> SendPhysicalClick { get; set; }


        [DisplayName("Wait for Page Load")]
        [Description("If true, waits for the next page to load after the click.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageLoad { get; set; }


        [DisplayName("Timeout for Page Load")]
        [Description("The maximum time (in seconds) to wait for the page to load.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForPageLoad { get; set; }


        [DisplayName("Handle Dialog")]
        [Description("Specifies what to do if a dialog appears after the click.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfDialogAppears { get; set; }


        [DisplayName("Dialog Button to Press")]
        [Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
        [DefaultValue("Ok")]
        public InArgument<string> DialogButtonToPress { get; set; }


        [DisplayName("Mouse Position Relative to Element")]
        [Description("Specifies where to position the mouse relative to the element before clicking.")]
        [DefaultValue(ClickLinMousePositionEnum.MiddleCenter)]
        public InArgument<ClickLinMousePositionEnum> MousePosition { get; set; }


        [DisplayName("Offset X")]
        [Description("Move the mouse this many pixels horizontally from the selected position.")]
        [DefaultValue(0)]
        public InArgument<int> OffsetX { get; set; }


        [DisplayName("Offset Y")]
        [Description("Move the mouse this many pixels vertically from the selected position.")]
        [DefaultValue(0)]
        public InArgument<int> OffsetY { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var uiElement = ValueToFind.Get(context);
                var findType = FindType.Get(context);
                var clickType = ClickType.Get(context);
                var sendPhysicalClick = SendPhysicalClick.Get(context);
                var waitForPageLoad = WaitForPageLoad.Get(context);
                var timeout = TimeoutForPageLoad.Get(context);
                var dialogAction = IfDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);
                var mousePosition = MousePosition.Get(context);
                var offsetX = OffsetX.Get(context);
                var offsetY = OffsetY.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(uiElement))
                    throw new ArgumentException("UI Element must be specified.");

                // Locate the element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, uiElement);
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
                            action.MoveToElement(element, -element.Size.Width / 2 + offsetX,
                                -element.Size.Height / 2 + offsetY);
                            break;
                        case ClickLinMousePositionEnum.MiddleLeft:
                            action.MoveToElement(element, -element.Size.Width / 2 + offsetX, 0 + offsetY);
                            break;
                        case ClickLinMousePositionEnum.BottomLeft:
                            action.MoveToElement(element, -element.Size.Width / 2 + offsetX,
                                element.Size.Height / 2 + offsetY);
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
                            action.MoveToElement(element, element.Size.Width / 2 + offsetX,
                                -element.Size.Height / 2 + offsetY);
                            break;
                        case ClickLinMousePositionEnum.MiddleRight:
                            action.MoveToElement(element, element.Size.Width / 2 + offsetX, offsetY);
                            break;
                        case ClickLinMousePositionEnum.BottomRight:
                            action.MoveToElement(element, element.Size.Width / 2 + offsetX,
                                element.Size.Height / 2 + offsetY);
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
                        ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));
                }

                // Optional: Handle alert popup
                if (dialogAction != DialogActionEnum.DoNothing)
                    try
                    {
                        var alert = driver.SwitchTo().Alert();
                        if (dialogAction == DialogActionEnum.PressAButton)
                            alert.SendKeys(dialogButton); // Simulate pressing a button
                        alert.Accept(); // Close dialog
                    }
                    catch (NoAlertPresentException)
                    {
                        // No dialog found — proceed normally
                    }

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
}