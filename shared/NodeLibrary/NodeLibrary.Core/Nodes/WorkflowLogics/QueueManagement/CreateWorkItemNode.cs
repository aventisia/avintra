using NodeLibrary.QueueManagementNodes.Helpers;

namespace NodeLibrary.QueueManagementNodes;

[DisplayName("Create Work Item")]
[Description("Creates a new work item in the specified queue.")]
[NodeMetadata(icon: "/assets/Queue.svg")]
public class CreateWorkItemNode : BaseNode
{
    [DisplayName("Select Queue")]
    [Description("Choose the queue in which to create the work item.")]
    [NodeFieldType(NodeFieldTypeEnum.QueueSelect)]
    public required InArgument<string> QueueName { get; set; }

    [DisplayName("Description")]
    [Description("Optional description for the work item.")]
    [DefaultValue("")]
    public InArgument<string> Description { get; set; } = new InArgument<string>();

    [DisplayName("Source Work Item ID")]
    [Description("Optional source work item identifier for the work item. Leave empty to generate a new work item id; provide an existing source work item id (SourceWorkItemId) to schedule a retry (a new attempt is created for it).")]
    [NodeFieldType(NodeFieldTypeEnum.Text)]
    public InArgument<Guid?> SourceWorkItemId { get; set; } = new InArgument<Guid?>();

    [DisplayName("Work Item Data")]
    [Description("Provide the data for the work item in JSON format.")]
    [NodeFieldType(NodeFieldTypeEnum.JsonEditor)]
    public required InArgument<string> WorkItemData { get; set; }

    [DisplayName("Retry Time")]
    [Description("Optional future date and time after which this work item becomes eligible for processing. Leave empty for immediate processing. Text value in ISO 8601 format (e.g. 2026-09-12T14:30:00Z).")]
    [NodeFieldType(NodeFieldTypeEnum.DateTime)]
    public InArgument<DateTimeOffset?> RetryTime { get; set; } = new InArgument<DateTimeOffset?>();

    [DisplayName("File URLs")]
    [Description("Optional URLs of files associated with the work item, separated by commas.")]
    public InArgument<string> FileUrls { get; set; } = new InArgument<string>();

    [DisplayName("Result")]
    [Description("Returns the created work item.")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var queueName = QueueName.Get(context);
            var workItemData = WorkItemData.Get(context);
            var description = Description.Get(context);
            var fileUrls = FileUrls.Get(context);
            var retryTime = RetryTime.Get(context);
            var sourceWorkItemId = SourceWorkItemId.Get(context);
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var accessToken = callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required");

            if (string.IsNullOrWhiteSpace(queueName))
                throw new ArgumentException("Queue Name cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(workItemData))
                throw new ArgumentException("Work Item Data cannot be null or empty.");

            // RetryTime must be a future date and time.
            if (retryTime.HasValue && retryTime.Value.ToUniversalTime() <= DateTimeOffset.UtcNow)
                throw new ArgumentException("Retry Time must be a future date and time.");

            try
            {
                JsonNode.Parse(workItemData);
            }
            catch (JsonException)
            {
                workItemData = Regex.Replace(workItemData, @"(?<!\\)\\(?![\\""/bfnrtu])", @"\\");
            }

            var fileUrlsArray = fileUrls?.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            // Optional source work item id: when provided it acts as the SourceWorkItemId on the
            // backend, which creates the attempt (a new work item or the next retry for that id).
            // When left empty the backend generates a fresh id (SourceWorkItemId = new transaction Id).
            var sourceWorkItemIdParsed = sourceWorkItemId;

            var payload = new
            {
                queueName = queueName,
                sourceWorkItemId = sourceWorkItemIdParsed,
                workItemData = workItemData,
                description = description,
                fileUrls = fileUrlsArray,
                retryTime = retryTime
            };

            var createdWorkItem = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                "workspace/api/queue/workitem",
                HttpMethod.Post,
                accessToken,
                payload,
                callerContext.EnvType);

            Result.Set(context, createdWorkItem);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Work item created successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error creating work item: {ex.Message}");
            throw;
        }
    }
}
