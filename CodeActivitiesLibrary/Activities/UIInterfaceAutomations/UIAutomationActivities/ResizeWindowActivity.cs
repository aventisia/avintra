using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

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



        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            var width = Width.Get(context);
            var height = Height.Get(context);
            string status = "";

            try
            {
                if (windowElement == null)
                {
                    status = "No window was provided to resize.";
                }
                else
                {
                    var transformPattern = windowElement.GetCurrentPattern(TransformPattern.Pattern) as TransformPattern;
                    if (transformPattern != null && transformPattern.Current.CanResize)
                    {
                        transformPattern.Resize(width, height);
                        status = "Window resized successfully.";
                    }
                    else
                    {
                        status = "Sorry, this window cannot be resized automatically.";
                    }
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"There was a problem resizing the window: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}