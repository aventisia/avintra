using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
{
    [DisplayName("Route Work Item")]
    [Description("Routes a work item from one queue to another.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg", doNotRenderIf: "production")]
    public class RouteWorkItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("WorkItem ID")]
        [Description("Enter the unique identifier of the work item to route.")]
        [DefaultValue("")]
        public InArgument<string> WorkItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Select Queue")]
        [Description("Select the destination queue to which the work item will be routed.")]
        [FieldType(FieldType.QueueSelect)]
        public InArgument<string> QueueName { get; set; }

        [DisplayName("Result")]
        [Description("Returns whether the work item was routed successfully.")]
        public OutArgument<bool> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var workItemId = WorkItemId.Get(context);
                var queueName = QueueName.Get(context);
                var accessToken = AccessToken.Get(context);

                // Validate work item ID
                if (string.IsNullOrEmpty(workItemId))
                {
                    throw new ArgumentException("Work Item ID cannot be null or empty.");
                }

                // Validate queue name and access token
                if (string.IsNullOrEmpty(queueName))
                {
                    throw new ArgumentException("Queue Name cannot be null or empty.");
                }

                // Prepare payload for the API request
                var payload = new
                {
                    id = workItemId,
                    queueName = queueName
                };

                // API endpoint for routing the work item.
                var endpointUrl = "workspace/api/queue/workitem/route";

                // Execute the API request.
                var response = QueueApiExecutor.Execute(
                    endpointUrl,
                    HttpMethod.Put,
                    accessToken,
                    payload).Result;

                // Convert the response to a boolean result.
                bool routeResult = response.ToObject<bool>();

                // Set the activity outputs.
                Result.Set(context, routeResult);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Work item routed successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error moving work item: {ex.Message}");
                throw;
            }
        }
    }
}