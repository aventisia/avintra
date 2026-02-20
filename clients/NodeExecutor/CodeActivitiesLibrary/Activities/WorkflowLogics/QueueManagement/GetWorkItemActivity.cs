using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagementActivities
{
    [DisplayName("Get Work Item")]
    [Description("Retrieves a work item from the specified queue using its identifier.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class GetWorkItemActivity : BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            
        }
    }
}