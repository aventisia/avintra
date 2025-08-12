using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Enums;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Set Window State")]
    [Description("Change the window to normal, maximized, or minimized state.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/UIAutomation.svg")]
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

        [DisplayName("Is Window State Changed Successfully")]
        [Description("Indicates whether the window state was changed successfully.")]
        public OutArgument<bool> IsWindowStateChanged { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowElement = WindowElement.Get(context);
            var desiredState = DesiredState.Get(context);
            string statusMessage = "";
            bool isChanged = false;

            try
            {
                if (windowElement == null)
                {
                    statusMessage = "No window was provided to change its state.";
                }
                else
                {
                    var windowPattern = windowElement.Patterns.Window.PatternOrDefault;
                    if (windowPattern == null)
                    {
                        statusMessage = "Sorry, this window cannot be changed automatically.";
                    }
                    else
                    {
                        switch (desiredState)
                        {
                            case WindowStateEnum.Maximized:
                                windowPattern.SetWindowVisualState(WindowVisualState.Maximized);
                                statusMessage = "Window maximized successfully.";
                                isChanged = true;
                                break;
                            case WindowStateEnum.Minimized:
                                windowPattern.SetWindowVisualState(WindowVisualState.Minimized);
                                statusMessage = "Window minimized successfully.";
                                isChanged = true;
                                break;
                            case WindowStateEnum.Normal:
                                windowPattern.SetWindowVisualState(WindowVisualState.Normal);
                                statusMessage = "Window restored to normal state.";
                                isChanged = true;
                                break;
                            default:
                                statusMessage = "Unknown window state selected.";
                                break;
                        }
                    }
                }
                IsWindowStateChanged.Set(context, isChanged);
                IsSuccess.Set(context, isChanged);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsWindowStateChanged.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"There was a problem changing the window state: {ex.Message}");
            }
        }
    }
}