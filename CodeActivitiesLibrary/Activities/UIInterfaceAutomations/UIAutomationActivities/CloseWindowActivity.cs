using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

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



        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            string status = "";

            try
            {
                if (windowElement == null)
                {
                    status = "No window was provided to close.";
                }
                else
                {
                    var windowPattern = windowElement.GetCurrentPattern(WindowPattern.Pattern) as WindowPattern;
                    if (windowPattern != null)
                    {
                        windowPattern.Close();
                        status = "The window was closed successfully.";
                    }
                    else
                    {
                        status = "Sorry, this window cannot be closed automatically.";
                    }
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"There was a problem closing the window: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}