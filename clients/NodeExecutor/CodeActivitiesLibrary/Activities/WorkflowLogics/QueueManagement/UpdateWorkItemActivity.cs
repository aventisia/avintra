using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
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

        [DisplayName("Description")]
        [Description("Optional description for the work item.")]
        [DefaultValue("")]
        public InArgument<string> Description { get; set; }

        [DisplayName("Should Update Work Item Data")]
        [Description("Indicates whether the work item data should be updated. If true, the Work Item Data field must be provided.")]
        [DefaultValue(false)]
        public InArgument<bool> ShouldUpdateWorkItemData { get; set; }

        [DisplayName("Work Item Data")]
        [Description("Provide the updated data for the work item in JSON format. This field is required if 'Should Update Work Item Data' is set to true.")]
        [FieldType(FieldType.JsonEditor)]
        [RenderIfCondition(nameof(ShouldUpdateWorkItemData), true)]
        public InArgument<string> WorkItemData { get; set; }

        [DisplayName("File URL")]
        [Description("Optional URL of a file associated with the work item.")]
        public InArgument<string> FileUrl { get; set; }

        [DisplayName("Result")]
        [Description("Returns the result of the update operation.")]
        public OutArgument<object> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var workItemId = WorkItemId.Get(context);
                var status = Status.Get(context);
                var description = Description.Get(context);
                var shouldUpdateData = ShouldUpdateWorkItemData.Get(context);
                var workItemData = shouldUpdateData ? WorkItemData.Get(context) : null;
                var fileUrl = FileUrl.Get(context) ?? null;
                var accessToken = AccessToken.Get(context);

                // Validate inputs
                if (string.IsNullOrEmpty(workItemId))
                {
                    throw new ArgumentException("Work Item ID cannot be null or empty.");
                }

                if (shouldUpdateData && string.IsNullOrEmpty(workItemData))
                {
                    throw new ArgumentException("Work Item Data cannot be null or empty when 'Should Update Work Item Data' is true.");
                }

                // Validate the JSON format of workItemData if it is provided
                try
                {
                    // Pre-check: Try parsing. If it fails due to bad escaping, fix it.
                    if (workItemData != null)
                    {
                        // Attempt to parse the JSON to check for validity
                        JsonNode.Parse(workItemData);
                    }
                }
                catch (System.Text.Json.JsonException)
                {
                    // Fix the backslashes in the JSON string
                    workItemData = Regex.Replace(workItemData, @"(?<!\\)\\(?![\\""/bfnrtu])", @"\\");
                }

                var payload = new
                {
                    id = workItemId,
                    status = status.ToString(),
                    workItemData = shouldUpdateData ? Newtonsoft.Json.JsonConvert.SerializeObject(workItemData) : null,
                    description = description,
                    fileUrl = fileUrl
                };

                // Call the Queue API to update the work item
                var endpointUrl = $"workspace/api/queue/workitem";

                // Use the QueueApiExecutor to send the PUT request to update the work item
                var updatedWorkItem = QueueApiExecutor.Execute(endpointUrl, HttpMethod.Put, accessToken, payload).Result;

                // Set the output argument with the updated work item
                Result.Set(context, updatedWorkItem);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Work item updated successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating work item: {ex.Message}");
                throw;
            }
        }
    }

    /// <summary>
    /// Enumeration of work item status values.
    /// </summary>
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