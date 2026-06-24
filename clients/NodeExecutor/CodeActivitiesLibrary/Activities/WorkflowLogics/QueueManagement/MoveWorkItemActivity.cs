using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
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
        [Description("Choose the queue to which the work item will be moved.")]
        [FieldType(FieldType.QueueSelect)]
        public InArgument<string> QueueName { get; set; }

        [DisplayName("Remark")]
        [Description("Optional remark for the work item.")]
        [DefaultValue("")]
        public InArgument<string> Remark { get; set; }

        [DisplayName("Result")]
        [Description("Returns the result of the move operation.")]
        public OutArgument<bool> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var workItemId = WorkItemId.Get(context);
                var queueName = QueueName.Get(context);
                var remark = Remark.Get(context);
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

                // Call the Queue API to move the work item
                var endpointUrl = $"workspace/api/queue/workitem/move";

                // Execute the API request and get the moved work item
                var response = QueueApiExecutor.Execute(endpointUrl, HttpMethod.Put, accessToken, payload).Result;

                // Convert the response to boolean
                bool moveResult = response.Type == Newtonsoft.Json.Linq.JTokenType.Boolean
                    ? response.ToObject<bool>()
                    : response.ToObject<bool>();

                Result.Set(context, moveResult);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Work item moved successfully.");
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