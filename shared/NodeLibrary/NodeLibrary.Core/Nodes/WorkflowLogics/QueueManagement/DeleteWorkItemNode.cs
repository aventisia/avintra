using NodeLibrary.QueueManagementNodes.Helpers;

namespace NodeLibrary.QueueManagementNodes;

[DisplayName("Delete Work Item")]
[Description("Deletes a work item permanently from the queue.")]
[NodeMetadata(icon: "/assets/Queue.svg")]
public class DeleteWorkItemNode : BaseNode
{
    [DisplayName("Work Item Id")]
    [Description("Provide the identifier of the work item to be deleted.")]
    [DefaultValue("")]
    public required InArgument<string> WorkItemId { get; set; }

    [DisplayName("Result")]
    [Description("Returns true if the work item was deleted successfully, otherwise false.")]
    public OutArgument<bool> Result { get; set; } = new OutArgument<bool>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var workItemId = WorkItemId.Get(context);
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var accessToken = callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required");

            if (string.IsNullOrWhiteSpace(workItemId))
                throw new ArgumentException("Work Item ID cannot be null or empty.");

            var response = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                $"workspace/api/queue/workitem/{workItemId}",
                HttpMethod.Delete,
                accessToken,
                envType: callerContext.EnvType);

            var deleteResult = response.ValueKind == JsonValueKind.True ||
                (response.ValueKind == JsonValueKind.String && bool.TryParse(response.GetString(), out var parsed) && parsed);

            Result.Set(context, deleteResult);
            IsSuccess.Set(context, deleteResult);
            StatusMessage.Set(context, deleteResult ? "Work item deleted successfully." : "Failed to delete work item.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting work item: {ex.Message}");
            throw;
        }
    }
}
