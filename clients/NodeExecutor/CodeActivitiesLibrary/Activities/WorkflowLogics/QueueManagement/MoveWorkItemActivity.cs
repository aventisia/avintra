using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagementActivities
{
    [DisplayName("Move Work Item")]
    [Description("Moves a work item from one queue to another.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg", doNotRenderIf: "production")]
    public class MoveWorkItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("WorkItem ID")]
        [Description("Enter the unique identifier of the work item you want to move.")]
        [DefaultValue("")]
        public InArgument<string> WorkItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Select Queue")]
        [Description("Choose the destination queue where the work item will be moved.")]
        [FieldType(FieldType.QueueSelect)]
        public InArgument<string> QueueId { get; set; }

        [RequiredArgument]
        [DisplayName("Work Item Data")]
        [Description("Provide the data payload for the work item in JSON format. This data will be stored with the work item.")]
        [FieldType(FieldType.JsonEditor)]
        public InArgument<string> WorkItemData { get; set; }

        [DisplayName("Remark")]
        [Description("Enter the remark for the work item.")]
        [DefaultValue("")]
        public InArgument<string> WorkItemRemark { get; set; }

        [DisplayName("MovedWorkItem")]
        [Description("Returns true if work item moved successfully.")]
        public OutArgument<bool> MovedWorkItem { get; set; }

        protected override void Execute(CodeActivityContext context)
        {

        }
    }
}