using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    // Activity to get mouse position
    [DisplayName("Get Mouse Position"),
     Description("Retrieves the current position of the mouse cursor on the screen in pixel coordinates.")]
    public class GetMousePositionActivity : CodeActivity
    {
        [Category("Output"), Description("Returns the current mouse position as a Point object.")]
        public OutArgument<Point> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            Point result = new Point();
            var status = "";

            try
            {
                // Retrieve the current mouse position
                result = Control.MousePosition;
                status = "Mouse position retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = Point.Empty;
                status = $"Error retrieving mouse position: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}