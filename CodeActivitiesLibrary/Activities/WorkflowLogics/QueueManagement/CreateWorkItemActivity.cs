using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagementActivities
{
    [DisplayName("Create Work Item")]
    [Description("Creates a new work item in the specified queue.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class CreateWorkItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Select Queue")]
        [Description("Choose the queue where the new work item will be created.")]
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
        public InArgument<string> Remark { get; set; }
        
        [DisplayName("CreatedWorkItem")]
        [Description("Returns the newly created work item.")]
        public OutArgument<object> CreatedWorkItem { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            
        }
    }
}