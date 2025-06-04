using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Set Focus on UI Element")]
    [Description("Brings the specified UI element into focus, allowing further interaction.")]
    public class SetFocusOnElementActivity : BaseCodeActivity
    {

        [DisplayName("UI Element")]
        [Description("The UI element to bring into focus.")]
        [RequiredArgument]
        public InArgument<AutomationElement> Element { get; set; }


        [DisplayName("Result")]
        [Description("Shows whether the focus was set successfully or not")]
        [DefaultValue("")]
        public OutArgument<bool> Result { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var element = Element.Get(context);
            var result = true;
            string statusMsg = "Focus set successfully.";

            try
            {
                element.SetFocus();
            }
            catch (Exception ex)
            {
                result = false;
                statusMsg = $"Could not set focus: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, statusMsg);
        }
    }
}