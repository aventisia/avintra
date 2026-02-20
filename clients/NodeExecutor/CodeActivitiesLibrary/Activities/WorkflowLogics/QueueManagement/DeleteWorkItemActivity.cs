using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagementActivities
{
    [DisplayName("Delete Work Item")]
    [Description("Deletes a work item permanently from the queue.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class DeleteWorkItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("WorkItem ID")]
        [Description("Enter the unique identifier of the work item you want to permanently delete.")]
        [DefaultValue("")]
        public InArgument<string> WorkItemId { get; set; }

        [DisplayName("WorkItemDeleted")]
        [Description("Returns true if work item deleted successfully.")]
        public OutArgument<bool> WorkItemDeleted { get; set; }

        protected override void Execute(CodeActivityContext context)
        {

        }
    }
}