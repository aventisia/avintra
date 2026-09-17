using NodeLibrary.QueueManagementNodes.Helpers;

namespace NodeLibrary.QueueManagementNodes;

[DisplayName("Update Work Item")]
[Description("Updates the fields or status of an existing work item.")]
[NodeMetadata(icon: "/assets/Queue.svg")]
public class UpdateWorkItemNode : BaseNode
{
    [DisplayName("WorkItem ID")]
    [Description("Enter the unique identifier of the work item you want to update.")]
    [DefaultValue("")]
    public required InArgument<string> WorkItemId { get; set; }

    [DisplayName("Status")]
    [Description("Select the new status to assign to the work item. Custom statuses defined on the work item's queue are validated at runtime.")]
    [DefaultValue("Pending")]
    [NodeFieldType(NodeFieldTypeEnum.QueueStatusSelect)]
    public InArgument<string> Status { get; set; } = new InArgument<string>("Pending");

    [DisplayName("Description")]
    [Description("Optional description for the work item.")]
    [DefaultValue("")]
    public InArgument<string> Description { get; set; } = new InArgument<string>();

    [DisplayName("Should Update Work Item Data")]
    [Description("Indicates whether the work item data should be updated. If true, the Work Item Data field must be provided.")]
    [DefaultValue(false)]
    public InArgument<bool> ShouldUpdateWorkItemData { get; set; } = new InArgument<bool>(false);

    [DisplayName("Work Item Data")]
    [Description("Provide the updated data for the work item in JSON format. This field is required if 'Should Update Work Item Data' is set to true.")]
    [NodeFieldType(NodeFieldTypeEnum.JsonEditor)]
    [RenderIfCondition(nameof(ShouldUpdateWorkItemData), true)]
    public InArgument<JsonNode?> WorkItemData { get; set; } = new InArgument<JsonNode?>();

    [DisplayName("File URLs")]
    [Description("Optional URLs of files associated with the work item, separated by commas.")]
    public InArgument<string> FileUrls { get; set; } = new InArgument<string>();

    [DisplayName("Result")]
    [Description("Returns the result of the update operation.")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var workItemId = WorkItemId.Get(context);
            var status = Status.Get(context);
            var description = Description.Get(context);
            var shouldUpdateData = ShouldUpdateWorkItemData.Get(context);
            var workItemData = shouldUpdateData ? WorkItemData.Get(context) : null;
            var fileUrls = FileUrls.Get(context);
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var accessToken = callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required");

            if (string.IsNullOrWhiteSpace(workItemId))
                throw new ArgumentException("Work Item ID cannot be null or empty.");

            // The backend binds the work item id to a Guid. Resolve the string to a
            // Guid up front so a malformed value fails here with a clear message
            // instead of surfacing as a generic 400 model-binding error.
            if (!Guid.TryParse(workItemId.Trim(), out var workItemGuid))
                throw new ArgumentException($"Work Item ID '{workItemId}' is not a valid GUID. Provide the work item's 'id' value (e.g. from the Result of a Get Work Items / Get Next Work Item node).");

            var fileUrlsArray = fileUrls?.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            var payload = new
            {
                id = workItemGuid,
                status = status,
                workItemData = shouldUpdateData ? JsonSerializer.Serialize(workItemData) : null,
                description = description,
                fileUrls = fileUrlsArray
            };

            var updatedWorkItem = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                "workspace/api/queue/workitem",
                HttpMethod.Put,
                accessToken,
                payload,
                callerContext.EnvType);

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
