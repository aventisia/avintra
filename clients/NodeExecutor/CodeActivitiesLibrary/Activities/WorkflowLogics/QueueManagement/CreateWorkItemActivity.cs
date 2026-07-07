using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using System;
using System.Activities;
using System.Collections;
using System.ComponentModel;
using System.Net.Http;
using Newtonsoft.Json;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
{
    [DisplayName("Create Work Item")]
    [Description("Creates a new work item in the specified queue.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class CreateWorkItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Select Queue")]
        [Description("Choose the queue in which to create the work item.")]
        [FieldType(FieldType.QueueSelect)]
        public InArgument<string> QueueName { get; set; }

        [DisplayName("Description")]
        [Description("Optional description for the work item.")]
        [DefaultValue("")]
        public InArgument<string> Description { get; set; }

        [RequiredArgument]
        [DisplayName("Work Item Data")]
        [Description("Provide the data for the work item in JSON format.")]
        [FieldType(FieldType.JsonEditor)]
        public InArgument<string> WorkItemData { get; set; }

        [DisplayName("File URL")]
        [Description("Optional URL of a file associated with the work item.")]
        public InArgument<string> FileUrl { get; set; }

        [DisplayName("Result")]
        [Description("Returns the created work item.")]
        public OutArgument<object> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var queueName = QueueName.Get(context);
                var workItemData = WorkItemData.Get(context);
                var description = Description.Get(context);
                var fileUrl = FileUrl.Get(context) ?? null;
                var accessToken = AccessToken.Get(context);

                // Validate that queueName is not null or empty
                if (string.IsNullOrEmpty(queueName))
                {
                    throw new ArgumentException("Queue Name cannot be null or empty.");
                }

                // Validate that workItemData is a valid JSON string
                if (string.IsNullOrEmpty(workItemData))
                {
                    throw new ArgumentException("Work Item Data cannot be null or empty.");
                }

                // Prepare the payload for the API request
                var payload = new
                {
                    queueName = queueName,
                    workItemData = Newtonsoft.Json.JsonConvert.SerializeObject(workItemData),
                    description = description,
                    fileUrl = fileUrl
                };

                // Execute the API request to create the work item
                var endpointUrl = "workspace/api/queue/workitem";

                // Execute the API request to create the work item
                var createdWorkItem = QueueApiExecutor.Execute(endpointUrl, HttpMethod.Post, accessToken, payload).Result;

                // Set the output arguments
                Result.Set(context, createdWorkItem);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Work item created successfully.");
            }
            catch (Exception ex)
            {
                // Handle exceptions and set the output arguments accordingly
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating work item: {ex.Message}");
                throw;
            }
        }
    }
}