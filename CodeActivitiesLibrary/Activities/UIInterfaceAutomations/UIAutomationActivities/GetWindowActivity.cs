using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using FlaUI.Core.AutomationElements;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Get Window")]
    [Description("Finds a desktop window by name using UI Automation.")]
    public class GetWindowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Window Name")]
        [Description("The name (title) of the window to find.")]
        public InArgument<string> WindowName { get; set; }

        [DisplayName("Name Match Mode")]
        [Description("How to match the window name. Options: Equals, Contains, Starts With.")]
        [DefaultValue(NameMatchModeEnum.Equals)]
        public InArgument<NameMatchModeEnum> MatchMode { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the window (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Automation Element")]
        [Description("The found AutomationElement for the window.")]
        public OutArgument<AutomationElement> WindowElement { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string windowName = WindowName.Get(context);
            int maxWaitTime = MaxWaitTime.Get(context);
            AutomationElement windowElement = null;

            // Create Indetification Object to find window
            var identificationObject = new List<IdentificationObject>
            {
                new IdentificationObject
                {
                    Name = windowName,
                    NameMatchMode = MatchMode.Get(context),
                }
            };

            try
            {
                // Get the automation element for the window
                windowElement = UIAutomationElementHelper.GetElementByPath(identificationObject, maxWaitTime);

                var statusMessage = windowElement != null
                    ? "Window found successfully."
                    : "Window not found within the specified time.";
                WindowElement.Set(context, windowElement);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}