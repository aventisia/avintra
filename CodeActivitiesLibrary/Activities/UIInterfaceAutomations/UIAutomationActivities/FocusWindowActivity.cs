using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Focus Window")]
    [Description("Brings the selected window to the front and makes it active.")]
    public class FocusWindowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Window")]
        [Description("Select the window you want to focus.")]
        public InArgument<AutomationElement> WindowElement { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            string status = "";

            try
            {
                if (windowElement == null)
                {
                    status = "No window was provided to focus.";
                }
                else
                {
                    var windowPattern = windowElement.GetCurrentPattern(WindowPattern.Pattern) as WindowPattern;
                    if (windowPattern != null)
                    {
                        windowPattern.SetWindowVisualState(WindowVisualState.Normal);
                        windowPattern.WaitForInputIdle(1000);
                    }
                    windowElement.SetFocus();
                    status = "Window focused successfully.";
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, status);
                }
            }
            catch (Exception ex)
            {
                status = $"There was a problem focusing the window: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}