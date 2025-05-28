using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Label"), Description("Marks a destination point for 'Go To' statements.")]
    public class LabelActivity : NativeActivity
    {
        [RequiredArgument, Category("Input"), Description("Name of the label.")]
        public InArgument<string> LabelName { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                var name = LabelName.Get(context);
                StatusMessage.Set(context, $"Reached label '{name}'.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error reaching label: {ex.Message}");
            }
        }
    }
}