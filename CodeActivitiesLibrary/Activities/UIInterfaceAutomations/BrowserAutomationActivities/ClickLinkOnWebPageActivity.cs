using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Click Link on Web Page")]
    [Description(
        "Simulates clicking a UI element (e.g., a link or button) on a web page. Supports various click types, physical mouse interaction, and dialog handling.")]
    public class ClickLinkOnWebPageActivity : Extensions.BaseCodeActivity
    {
        #region Outputs

        
        

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            string status;

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var uiElement = UiElement.Get(context);
                var clickType = ClickType.Get(context);
                var sendPhysicalClick = SendPhysicalClick.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);
                var mousePos = MousePosition.Get(context);
                var offsetX = OffsetX.Get(context);
                var offsetY = OffsetY.Get(context);

                // Validate required fields conditionally
                if (dialogAction == DialogActionEnum.PressAButton && string.IsNullOrEmpty(dialogButton))
                    throw new ArgumentException(
                        "Dialog Button to Press must be specified when 'Press a Button' is selected.");

                // Simulate clicking the link
                status = $"Clicked '{uiElement}' using '{clickType}'.";

                if (sendPhysicalClick) status += $" Mouse moved to {mousePos} with offset ({offsetX}, {offsetY}).";

                if (waitForPage)
                {
                    status += $" Waited up to {timeout} seconds for the page to load.";

                    if (dialogAction == DialogActionEnum.CloseIt)
                        status += " Closed any pop-up dialog automatically.";
                    else if (dialogAction == DialogActionEnum.PressAButton)
                        status += $" Pressed the '{dialogButton}' button on the dialog.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error during click: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [Browsable(false)]
        [Category("Input")]
        [DisplayName("UI Element")]
        [Description("Select the UI element (link, button, etc.) on the web page to click.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Click Type")]
        [Description("The kind of click to perform.")]
        [DefaultValue(ClickTypeEnum.LeftClick)]
        public InArgument<ClickTypeEnum> ClickType { get; set; }

        [Category("Advanced")]
        [DisplayName("Send Physical Click")]
        [Description("Physically move the mouse cursor over the element prior to clicking.")]
        [DefaultValue(true)]
        public InArgument<bool> SendPhysicalClick { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait for Page to Load")]
        [Description("Specify whether to wait for the new web page to load after the click.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Webpage to Load")]
        [Description("Set the time in seconds for the page to load before the action throws an error.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForWebpageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("If a Pop-Up Dialog Appears")]
        [Description("Specify what to do if a pop-up dialog appears after clicking the link.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfAPopUpDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("Enter the dialog button to press if a pop-up dialog appears.")]
        [DefaultValue("Ok")]
        public InArgument<string> DialogButtonToPress { get; set; }

        [Category("Advanced")]
        [DisplayName("Mouse Position Relative to Element")]
        [Description("Specify where to position the mouse relative to the element before clicking.")]
        public InArgument<MousePositionEnum> MousePosition { get; set; }

        [Category("Advanced")]
        [DisplayName("Offset X")]
        [Description("Move the mouse this many pixels to the right from the selected position.")]
        [DefaultValue(0)]
        public InArgument<int> OffsetX { get; set; }

        [Category("Advanced")]
        [DisplayName("Offset Y")]
        [Description("Move the mouse this many pixels down from the selected position.")]
        [DefaultValue(0)]
        public InArgument<int> OffsetY { get; set; }

        #endregion
    }

    public enum MousePositionEnum
    {
        TopLeft = 0,
        MiddleLeft = 1,
        BottomLeft = 2,
        TopCenter = 3,
        MiddleCenter = 4,
        BottomCenter = 5,
        TopRight = 6,
        MiddleRight = 7,
        BottomRight = 8
    }

    public enum ClickTypeEnum
    {
        [Display(Name = "Left Click", Description = "Standard left mouse click.")]
        LeftClick = 0,

        [Display(Name = "Right Click", Description = "Right mouse click.")]
        RightClick = 1,

        [Display(Name = "Double Click", Description = "Double-click with the left mouse button.")]
        DoubleClick = 2,

        [Display(Name = "Left Button Down", Description = "Mouse left button down only.")]
        LeftButtonDown = 3,

        [Display(Name = "Left Button Up", Description = "Mouse left button up only.")]
        LeftButtonUp = 4,

        [Display(Name = "Right Button Down", Description = "Mouse right button down only.")]
        RightButtonDown = 5,

        [Display(Name = "Right Button Up", Description = "Mouse right button up only.")]
        RightButtonUp = 6,

        [Display(Name = "Middle Click", Description = "Middle mouse button click.")]
        MiddleClick = 7
    }
}