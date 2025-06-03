using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Move Window")]
    [Description("Moves a window to the position you choose on the screen.")]
    public class MoveWindowActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [DisplayName("Window")]
        [Description("Select the window you want to move.")]
        public InArgument<AutomationElement> WindowElement { get; set; }

        [RequiredArgument]

        [DisplayName("X Position")]
        [Description("Enter the new X position (in pixels) for the window.")]
        public InArgument<double> XPosition { get; set; }

        [RequiredArgument]

        [DisplayName("Y Position")]
        [Description("Enter the new Y position (in pixels) for the window.")]
        public InArgument<double> YPosition { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            var xPosition = XPosition.Get(context);
            var yPosition = YPosition.Get(context);
            string status = "";

            try
            {
                if (windowElement == null)
                {
                    status = "No window was provided to move.";
                }
                else
                {
                    var transformPattern = windowElement.GetCurrentPattern(TransformPattern.Pattern) as TransformPattern;
                    if (transformPattern != null && transformPattern.Current.CanMove)
                    {
                        transformPattern.Move(xPosition, yPosition);
                        status = "Window moved successfully.";
                    }
                    else
                    {
                        status = "Sorry, this window cannot be moved automatically.";
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"There was a problem moving the window: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}