using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Set Window State")]
    [Description("Change the window to normal, maximized, or minimized state.")]
    public class SetWindowStateActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Window")]
        [Description("Select the window you want to change.")]
        public InArgument<AutomationElement> WindowElement { get; set; }

        [RequiredArgument]
        [DisplayName("Window State")]
        [Description("Choose how you want the window to appear (Normal, Maximized, or Minimized).")]
        [DefaultValue(WindowStateEnum.Normal)]
        public InArgument<WindowStateEnum> DesiredState { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            var desiredState = DesiredState.Get(context);
            string status = "";

            try
            {
                if (windowElement == null)
                {
                    status = "No window was provided to change its state.";
                }
                else
                {
                    var windowPattern = windowElement.GetCurrentPattern(WindowPattern.Pattern) as WindowPattern;
                    if (windowPattern == null)
                    {
                        status = "Sorry, this window cannot be changed automatically.";
                    }
                    else
                    {
                        switch (desiredState)
                        {
                            case WindowStateEnum.Maximized:
                                windowPattern.SetWindowVisualState(WindowVisualState.Maximized);
                                status = "Window maximized successfully.";
                                break;
                            case WindowStateEnum.Minimized:
                                windowPattern.SetWindowVisualState(WindowVisualState.Minimized);
                                status = "Window minimized successfully.";
                                break;
                            case WindowStateEnum.Normal:
                                windowPattern.SetWindowVisualState(WindowVisualState.Normal);
                                status = "Window restored to normal state.";
                                break;
                            default:
                                status = "Unknown window state selected.";
                                break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"There was a problem changing the window state: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}