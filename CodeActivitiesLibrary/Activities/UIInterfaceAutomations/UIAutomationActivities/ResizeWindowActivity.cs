using CodeActivitiesLibrary.Extensions;
using FlaUI.Core.AutomationElements;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Resize Window")]
    [Description("Change the size of a window to the width and height you want.")]
    public class ResizeWindowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Window")]
        [Description("Select the window you want to resize.")]
        public InArgument<AutomationElement> WindowElement { get; set; }

        [RequiredArgument]
        [DisplayName("Width")]
        [Description("Enter the new width for the window (in pixels).")]
        public InArgument<double> Width { get; set; }

        [RequiredArgument]
        [DisplayName("Height")]
        [Description("Enter the new height for the window (in pixels).")]
        public InArgument<double> Height { get; set; }

        [DisplayName("Is Window Resized Successfully")]
        [Description("Indicates whether the window was resized successfully.")]
        public OutArgument<bool> IsWindowResized { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            var width = Width.Get(context);
            var height = Height.Get(context);
            string statusMessage = "";

            try
            {
                if (windowElement == null)
                {
                    statusMessage = "No window was provided to resize.";
                    IsWindowResized.Set(context, false);
                    IsSuccess.Set(context, false);
                }
                else
                {
                    var transformPattern = windowElement.Patterns.Transform.PatternOrDefault;
                    if (transformPattern != null && transformPattern.CanResize)
                    {
                        transformPattern.Resize(width, height);
                        statusMessage = "Window resized successfully.";
                        IsWindowResized.Set(context, true);
                        IsSuccess.Set(context, true);
                    }
                    else
                    {
                        statusMessage = "Sorry, this window cannot be resized automatically.";
                        IsWindowResized.Set(context, false);
                        IsSuccess.Set(context, false);
                    }
                }
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsWindowResized.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"There was a problem resizing the window: {ex.Message}");
            }
        }
    }
}