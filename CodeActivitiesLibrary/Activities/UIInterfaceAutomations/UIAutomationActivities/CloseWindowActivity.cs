using CodeActivitiesLibrary.Extensions;
using FlaUI.Core.AutomationElements;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Close Window")]
    [Description("Closes the selected application window.")]
    public class CloseWindowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Window")]
        [Description("Select the window you want to close.")]
        public InArgument<AutomationElement> WindowElement { get; set; }

        // Output argument to indicate success or failure
        [DisplayName("Is Window Closed Successfully")]
        [Description("Indicates whether the window was closed successfully.")]
        public OutArgument<bool> IsWindowClosed { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            string statusMessage = "";

            try
            {
                if (windowElement == null)
                {
                    statusMessage = "No window was provided to close.";
                    IsWindowClosed.Set(context, false);
                }
                else
                {
                    var window = windowElement.AsWindow();
                    if (window != null)
                    {
                        window.Close();
                        IsWindowClosed.Set(context, true);
                        statusMessage = "The window was closed successfully.";
                    }
                    else
                    {
                        IsWindowClosed.Set(context, false);
                        statusMessage = "Sorry, this window cannot be closed automatically.";
                    }
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"There was a problem closing the window: {ex.Message}");
            }
        }
    }
}