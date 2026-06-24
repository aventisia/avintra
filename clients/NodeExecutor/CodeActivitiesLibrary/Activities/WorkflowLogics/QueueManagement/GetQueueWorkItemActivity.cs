using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
{
    [DisplayName("Get Work Item")]
    [Description("Retrieve work item from the specified workitem identifier.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class GetQueueWorkItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("WorkItem ID")]
        [Description("Enter the unique identifier of the work item you want to retrieve.")]
        [DefaultValue("")]
        public InArgument<string> WorkItemId { get; set; }

        [DisplayName("Result")]
        [Description("Returns the retrieved work items.")]
        public OutArgument<object> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var workItemId = WorkItemId.Get(context);
                var accessToken = AccessToken.Get(context);

                // Validate input arguments
                if (string.IsNullOrEmpty(workItemId))
                {
                    throw new ArgumentException("Work Item ID cannot be null or empty.");
                }

                // Construct the API endpoint URL
                var endpointUrl = $"workspace/api/queue/workitem/{workItemId}";

                // Execute the API call synchronously
                var retrievedWorkItem = QueueApiExecutor.Execute(endpointUrl, HttpMethod.Get, accessToken).Result;

                Result.Set(context, retrievedWorkItem);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Work item retrieved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving work item: {ex.Message}");
                throw;
            }
        }
    }
}