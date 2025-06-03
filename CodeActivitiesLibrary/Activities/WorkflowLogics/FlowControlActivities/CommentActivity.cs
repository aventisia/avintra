using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Comment"), Description("Adds a comment to the workflow for documentation purposes.")]
    public class CommentActivity : Extensions.BaseNativeActivity
    {
        [Category("Input"), Description("Text input for documentation/comments.")]
        public InArgument<string> CommentText { get; set; }




        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                var text = CommentText.Get(context);
                StatusMessage.Set(context, $"Comment: {text}");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error setting comment: {ex.Message}");
            }
        }
    }
}