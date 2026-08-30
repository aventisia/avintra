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

    [DisplayName("Work Item Data")]
    [Description("Provide the data for the work item in JSON format.")]
    [NodeFieldType(NodeFieldTypeEnum.JsonEditor)]
    public required InArgument<string> WorkItemData { get; set; }

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
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var accessToken = callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required");

            if (string.IsNullOrWhiteSpace(queueName))
                throw new ArgumentException("Queue Name cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(workItemData))
                throw new ArgumentException("Work Item Data cannot be null or empty.");

            try
            {
                JsonNode.Parse(workItemData);
            }
            catch (JsonException)
            {
                workItemData = Regex.Replace(workItemData, @"(?<!\\)\\(?![\\""/bfnrtu])", @"\\");
            }

            var fileUrlsArray = fileUrls?.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            var payload = new
            {
                queueName = queueName,
                workItemData = workItemData,
                description = description,
                fileUrls = fileUrlsArray
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
