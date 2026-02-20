using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagementActivities
{
    [DisplayName("Update Work Item")]
    [Description("Updates the fields or status of an existing work item.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class UpdateWorkItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("WorkItem ID")]
        [Description("Enter the unique identifier of the work item you want to update.")]
        [DefaultValue("")]
        public InArgument<string> WorkItemId { get; set; }

        [DisplayName("Status")]
        [Description("Select the new status to assign to the work item.")]
        [DefaultValue(WorkItemStatusEnum.Pending)]
        public InArgument<WorkItemStatusEnum> Status { get; set; }

        [DisplayName("Remark")]
        [Description("Enter the remark for the work item.")]
        [DefaultValue("")]
        public InArgument<string> Remark { get; set; }

        [DisplayName("Update WorkItem Data")]
        [Description("Enable this option if you also want to update the data payload of the work item.")]
        [DefaultValue(false)]
        public InArgument<bool> ShouldUpdateWorkItemData { get; set; }

        [RequiredArgument]
        [DisplayName("Work Item Data")]
        [Description("Provide the updated work item data in JSON format. This will replace the existing data stored with the work item.")]
        [FieldType(FieldType.JsonEditor)]
        [RenderIfCondition(nameof(ShouldUpdateWorkItemData), true)]
        public InArgument<string> WorkItemData { get; set; }

        [DisplayName("UpdatedWorkItem")]
        [Description("Returns the updated work item.")]
        public OutArgument<object> UpdatedWorkItem { get; set; }

        protected override void Execute(CodeActivityContext context)
        {

        }
    }

    public enum WorkItemStatusEnum
    {
        [Display(Name = "Pending", Description = "Work item is pending and not yet started.")]
        Pending,

        [Display(Name = "In Progress", Description = "Work item is currently being processed.")]
        InProgress,

        [Display(Name = "Completed", Description = "Work item has been completed successfully.")]
        Completed,

        [Display(Name = "Failed", Description = "Work item processing has failed.")]
        Failed
    }
}