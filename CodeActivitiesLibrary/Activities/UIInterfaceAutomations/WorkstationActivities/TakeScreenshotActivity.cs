using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Take Screenshot"), Description("Takes a screenshot of all screens and saves it to the clipboard.")]
    public class TakeScreenshotActivity : CodeActivity
    {
        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "";

            try
            {
                using (var screenGraphics = Graphics.FromHwnd(IntPtr.Zero))
                {
                    var screenSize = Screen.PrimaryScreen.Bounds.Size;
                    using (var bitmap = new Bitmap(screenSize.Width, screenSize.Height, screenGraphics))
                    {
                        using (var memoryGraphics = Graphics.FromImage(bitmap))
                        {
                            memoryGraphics.CopyFromScreen(Point.Empty, Point.Empty, screenSize);
                        }

                        Clipboard.SetImage(bitmap);
                    }
                }

                StatusMessage.Set(context, "Screenshot taken and saved to clipboard successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error taking screenshot: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}