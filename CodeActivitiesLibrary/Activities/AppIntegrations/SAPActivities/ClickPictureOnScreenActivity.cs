using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Click Picture on Screen")]
    [Description("Clicks a picture displayed on an SAP GUI screen.")]
    public class ClickPictureOnScreenActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Window Title")]
        [Description("Title of the SAP GUI window (e.g., 'SAP Logon').")]
        public InArgument<string> WindowTitle { get; set; }

        [RequiredArgument]
        [DisplayName("Image Name")]
        [Description("Name of the image control (e.g., 'IMG_0001').")]
        public InArgument<string> ImageName { get; set; }

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var windowTitle = WindowTitle.Get(context);
                var imageName = ImageName.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(windowTitle))
                    throw new ArgumentException("Window Title is required.");
                if (string.IsNullOrWhiteSpace(imageName))
                    throw new ArgumentException("Image Name is required.");

                // Find the SAP window
                var window = AutomationElement.RootElement.FindFirst(
                    TreeScope.Children,
                    new PropertyCondition(AutomationElement.NameProperty, windowTitle));

                if (window == null)
                    throw new InvalidOperationException($"Window '{windowTitle}' not found.");

                // Find the image control
                var image = window.FindFirst(
                    TreeScope.Descendants,
                    new PropertyCondition(AutomationElement.NameProperty, imageName));

                if (image == null)
                    throw new InvalidOperationException($"Image '{imageName}' not found.");

                // Get center point of the image
                var rect = image.Current.BoundingRectangle;
                int x = (int)(rect.Left + rect.Width / 2);
                int y = (int)(rect.Top + rect.Height / 2);

                // Simulate mouse click using Windows API
                MoveAndClickMouse(x, y);

                StatusMessage.Set(context, $"Clicked image: {imageName}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error clicking picture on screen: {ex.Message}";
                StatusMessage.Set(context, errorMsg);
                IsSuccess.Set(context, false);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

        // P/Invoke for mouse movement and click
        [DllImport("user32.dll")]
        private static extern bool SetCursorPos(int x, int y);

        [DllImport("user32.dll")]
        private static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, IntPtr dwExtraInfo);

        private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const uint MOUSEEVENTF_LEFTUP = 0x0004;

        private void MoveAndClickMouse(int x, int y)
        {
            SetCursorPos(x, y);
            mouse_event(MOUSEEVENTF_LEFTDOWN, x, y, 0, IntPtr.Zero);
            mouse_event(MOUSEEVENTF_LEFTUP, x, y, 0, IntPtr.Zero);
        }
    }
}