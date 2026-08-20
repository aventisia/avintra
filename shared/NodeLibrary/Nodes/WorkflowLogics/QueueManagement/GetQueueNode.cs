using NodeLibrary.QueueManagementNodes.Helpers;

namespace NodeLibrary.QueueManagementNodes;

[DisplayName("Get Queue")]
[Description("Retrieves the details of the specified queue by name, including its configuration, input and output schemas, processing statistics (pending, in progress, completed, failed, and total items), access settings, retry policies, and metadata such as creation and last modification information.")]
[NodeMetadata(icon: "/assets/Queue.svg")]
public class GetQueueNode : BaseNode
{
    [DisplayName("Queue Name")]
    [Description("Specifies the name of the queue to retrieve.")]
    [NodeFieldType(NodeFieldTypeEnum.QueueSelect)]
    public required InArgument<string> QueueName { get; set; }

    [DisplayName("Queue Details")]
    [Description("Returns the complete queue information, including its configuration, schema, statistics, and metadata.")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var queueName = QueueName.Get(context);
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var accessToken = callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required");

            if (string.IsNullOrWhiteSpace(queueName))
                throw new ArgumentException("Queue Name cannot be null or empty.");

            var retrievedQueue = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                $"workspace/api/queue/by-name/{queueName}",
                HttpMethod.Get,
                accessToken,
                envType: callerContext.EnvType);

            Result.Set(context, retrievedQueue);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Queue retrieved successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving queue: {ex.Message}");
            throw;
        }
    }
}
