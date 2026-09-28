using NodeLibrary.QueueManagementNodes.Helpers;

namespace NodeLibrary.QueueManagementNodes;

[DisplayName("Route Work Item")]
[Description("Routes a work item from one queue to another.")]
[NodeMetadata(icon: "/assets/Queue.svg")]
public class RouteWorkItemNode : BaseNode
{
    [DisplayName("WorkItem ID")]
    [Description("Enter the unique identifier of the work item to route.")]
    [DefaultValue("")]
    public required InArgument<string> WorkItemId { get; set; }

    [DisplayName("Select Queue")]
    [Description("Select the destination queue to which the work item will be routed.")]
    [NodeFieldType(NodeFieldTypeEnum.QueueSelect)]
    public required InArgument<string> QueueName { get; set; }

    [DisplayName("Result")]
    [Description("Returns whether the work item was routed successfully.")]
    public OutArgument<bool> Result { get; set; } = new OutArgument<bool>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var workItemId = WorkItemId.Get(context);
            var queueName = QueueName.Get(context);
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var accessToken = callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required");

            if (string.IsNullOrWhiteSpace(workItemId))
                throw new ArgumentException("Work Item ID cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(queueName))
                throw new ArgumentException("Queue Name cannot be null or empty.");

            var payload = new
            {
                id = workItemId,
                queueName = queueName
            };

            var response = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                "workspace/api/queue/workitem/route",
                HttpMethod.Put,
                accessToken,
                payload,
                callerContext.EnvType);

            var routeResult = response.ValueKind == JsonValueKind.True ||
                (response.ValueKind == JsonValueKind.String && bool.TryParse(response.GetString(), out var parsed) && parsed);

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
