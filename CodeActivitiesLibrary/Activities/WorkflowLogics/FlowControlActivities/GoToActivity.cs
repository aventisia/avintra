using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Go To"), Description("Transfers execution to the specified label.")]
    public class GoToActivity : Extensions.BaseNativeActivity
    {
        [RequiredArgument, Category("Input"), Description("Label to transfer execution to.")]
        public InArgument<string> Label { get; set; }




        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                var label = Label.Get(context);
                StatusMessage.Set(context, $"Execution transferred to label '{label}'.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error transferring to label: {ex.Message}");
            }
        }
    }
}