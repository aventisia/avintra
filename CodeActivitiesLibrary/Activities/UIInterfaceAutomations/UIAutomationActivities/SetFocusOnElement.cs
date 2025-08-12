using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Set Focus on UI Element")]
    [Description("Brings the specified UI element into focus, allowing further interaction.")]
    [ActivityMetaData(nodeImg: "/assets/UIAutomation.svg")]
    public class SetFocusOnElementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element to bring into focus.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Is Focus Set Successfully")]
        [Description("True if the focus was set successfully, otherwise false.")]
        [DefaultValue(false)]
        public OutArgument<bool> IsFocued { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);

            bool focusSet = false;
            string statusMessage = "";

            try
            {
                var elementInstance = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (elementInstance == null)
                {
                    statusMessage = "UI element not found. Please check the identification path.";
                }
                else
                {
                    elementInstance.Focus();
                    focusSet = true;
                    statusMessage = "Focus set successfully.";
                }

                IsFocued.Set(context, focusSet);
                IsSuccess.Set(context, focusSet);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsFocued.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Could not set focus: {ex.Message}");
            }
        }
    }
}