using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    // Activity to move the mouse
    [DisplayName("Move Mouse"), Description("Moves the mouse to a specific position.")]
    public class MoveMouseActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The X-coordinate of the target position.")]
        public InArgument<int> X { get; set; }

        [RequiredArgument, Category("Input"), Description("The Y-coordinate of the target position.")]
        public InArgument<int> Y { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var x = X.Get(context);
            var y = Y.Get(context);
            var status = "";

            try
            {
                // Move the mouse cursor to the specified position
                Cursor.Position = new Point(x, y);
                status = "Mouse moved successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error moving mouse: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}
