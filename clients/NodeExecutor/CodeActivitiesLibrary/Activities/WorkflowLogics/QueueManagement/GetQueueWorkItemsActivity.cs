using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
{
    [DisplayName("Get Work Items")]
    [Description("Retrieves work items from the specified queue using its identifier.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class GetQueueWorkItemsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Select Queue")]
        [Description("Choose the queue from which to retrieve work items.")]
        [FieldType(FieldType.QueueSelect)]
        public InArgument<string> QueueName { get; set; }

        [DisplayName("Result")]
        [Description("Returns the retrieved work items.")]
        public OutArgument<object> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var queueName = QueueName.Get(context);
                var accessToken = AccessToken.Get(context);

                // Validate input arguments
                if (string.IsNullOrEmpty(queueName))
                {
                    throw new ArgumentException("Queue Name cannot be null or empty.");
                }

                // Construct the API endpoint URL to retrieve the queue details
                var queueEndpoint = $"workspace/api/queue/by-name/{queueName}";

                // Execute the API call to retrieve the queue details
                var retrieveQueue = QueueApiExecutor.Execute(queueEndpoint, HttpMethod.Get, accessToken);

                // Check if the retrieved queue is null or does not contain an 'id' field
                string queueId = string.Empty;

                // get id from retrievedWorkItems and check if it is null or not
                if (retrieveQueue != null)
                {
                    queueId = retrieveQueue.Result["id"]?.ToString();
                    if (string.IsNullOrEmpty(queueId))
                    {
                        throw new Exception("Retrieved work item does not contain a valid 'id' field.");
                    }
                }

                // Construct the API endpoint URL to retrieve the work items from the queue
                var queueWorkItemsEndpoint = $"workspace/api/queue/workitem/{queueId}/list";

                // Execute the API call to retrieve the work items from the queue
                var retrievedWorkItems = QueueApiExecutor.Execute(queueWorkItemsEndpoint, HttpMethod.Get, accessToken).Result;

                // Set the output arguments
                Result.Set(context, retrievedWorkItems);
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