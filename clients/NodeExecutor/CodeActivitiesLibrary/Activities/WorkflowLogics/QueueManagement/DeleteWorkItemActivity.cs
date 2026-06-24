using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using static Microsoft.CodeAnalysis.CSharp.SyntaxTokenParser;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
{
    [DisplayName("Delete Work Item")]
    [Description("Deletes a work item permanently from the queue.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class DeleteWorkItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Work Item Id")]
        [Description("Provide the identifier of the work item to be deleted.")]
        [DefaultValue("")]
        public InArgument<string> WorkItemId { get; set; }

        [DisplayName("Result")]
        [Description("Returns true if the work item was deleted successfully, otherwise false.")]
        public OutArgument<bool> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var workItemId = WorkItemId.Get(context);
                var accessToken = AccessToken.Get(context);

                // Validate work item ID
                if (string.IsNullOrEmpty(workItemId))
                {
                    throw new ArgumentException("Work Item ID cannot be null or empty.");
                }

                // Call the Queue API to delete the work item
                var endpointUrl = $"workspace/api/queue/workitem/{workItemId}";

                // Execute the API call to delete the work item
                var response = QueueApiExecutor.Execute(endpointUrl, HttpMethod.Delete, accessToken).Result;

                // Convert the response to boolean
                bool deleteResult = response.Type == Newtonsoft.Json.Linq.JTokenType.Boolean
                    ? response.ToObject<bool>()
                    : response.ToObject<bool>();

                // Set the output arguments based on the response
                Result.Set(context, deleteResult);
                IsSuccess.Set(context, deleteResult);
                StatusMessage.Set(context, deleteResult ? "Work item deleted successfully." : "Failed to delete work item.");
            }
            catch (Exception ex)
            {
                // Handle exceptions and set output arguments accordingly
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting work item: {ex.Message}");
                throw;
            }
        }
    }
}