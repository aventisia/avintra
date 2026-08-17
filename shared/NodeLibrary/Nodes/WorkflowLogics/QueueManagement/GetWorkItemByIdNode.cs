using NodeLibrary.WorkflowLogics.QueueManagement.Helpers;

namespace NodeLibrary.WorkflowLogics.QueueManagement;

[DisplayName("Get Work Item By ID")]
[Description("Retrieves the details of a work item by its unique identifier.")]
[NodeMetadata(icon: "/assets/Queue.svg")]
public class GetWorkItemByIdNode : BaseNode
{
    [DisplayName("Work Item ID")]
    [Description("Specifies the unique identifier of the work item to retrieve.")]
    [DefaultValue("")]
    public required InArgument<string> WorkItemId { get; set; }

    [DisplayName("Work Item")]
    [Description("Returns the complete details of the retrieved work item.")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

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

            var retrievedWorkItem = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                $"workspace/api/queue/workitem/{workItemId}",
                HttpMethod.Get,
                accessToken);

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
