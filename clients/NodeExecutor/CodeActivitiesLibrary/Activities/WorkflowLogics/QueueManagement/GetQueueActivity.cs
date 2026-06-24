using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
{
    [DisplayName("Get Queue")]
    [Description("Retrieves a queue from the specified queue using its identifier.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class GetQueueActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Select Queue")]
        [Description("Choose the queue to retrieve.")]
        [FieldType(FieldType.QueueSelect)]
        public InArgument<string> QueueName { get; set; }

        [DisplayName("Result")]
        [Description("Returns the retrieved queue.")]
        public OutArgument<object> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve the queue name and access token from the input arguments
                var queueName = QueueName.Get(context);
                var accessToken = AccessToken.Get(context);

                // Validate the input arguments
                if (string.IsNullOrEmpty(queueName))
                {
                    throw new ArgumentException("Queue Name cannot be null or empty.");
                }

                // Construct the API endpoint URL for retrieving the queue by name
                var endpointUrl = $"workspace/api/queue/by-name/{queueName}";

                // Execute the API call to retrieve the queue
                var retrievedQueue = QueueApiExecutor.Execute(endpointUrl, HttpMethod.Get, accessToken).Result;

                // Set the retrieved queue in the output argument
                Result.Set(context, retrievedQueue);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Queue retrieved successfully.");
            }
            catch (Exception ex)
            {
                // Handle any exceptions that occur during the API call or processing
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving queue: {ex.Message}");
                throw;
            }
        }
    }
}