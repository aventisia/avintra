using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Focus Window")]
    [Description("Brings the selected window to the front and makes it active.")]
    public class FocusWindowActivity : Extensions.BaseCodeActivity
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
                }
            }
            catch (Exception ex)
            {
                status = $"There was a problem focusing the window: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}