using CodeActivitiesLibrary.Extensions;
using FlaUI.Core.AutomationElements;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Move Window")]
    [Description("Moves a window to the position you choose on the screen.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
    public class MoveWindowActivity : BaseCodeActivity
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

        [DisplayName("Is Window Moved Successfully")]
        [Description("Indicates whether the window was moved successfully.")]
        public OutArgument<bool> IsWindowMoved { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            var xPosition = XPosition.Get(context);
            var yPosition = YPosition.Get(context);
            string statusMessage = "";

            try
            {
                if (windowElement == null)
                {
                    statusMessage = "No window was provided to move.";
                    IsWindowMoved.Set(context, false);
                    IsSuccess.Set(context, false);
                }
                else
                {
                    var transformPattern = windowElement.Patterns.Transform.PatternOrDefault;
                    if (transformPattern != null && transformPattern.CanMove)
                    {
                        transformPattern.Move(xPosition, yPosition);
                        statusMessage = "Window moved successfully.";
                        IsWindowMoved.Set(context, true);
                        IsSuccess.Set(context, true);
                    }
                    else
                    {
                        statusMessage = "Sorry, this window cannot be moved automatically.";
                        IsWindowMoved.Set(context, false);
                        IsSuccess.Set(context, false);
                    }
                }
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsWindowMoved.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"There was a problem moving the window: {ex.Message}");
            }
        }
    }
}