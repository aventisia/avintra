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
    public required InArgument<JsonNode> WorkItemData { get; set; }

    [DisplayName("Is Retry")]
    [Description("Specifies whether to re-attempt an existing work item. When enabled, creates a subsequent attempt linked to the source item with an incremented attempt count, calculated delay, and execution lineage.")]
    [DefaultValue(false)]
    public InArgument<bool> IsRetry { get; set; } = new InArgument<bool>(false);

    [DisplayName("Source Work Item ID")]
    [Description("The unique identifier (GUID) of the original work item to retry. Required to maintain execution lineage and history.")]
    [RenderIfCondition(nameof(IsRetry), true)]
    [NodeFieldType(NodeFieldTypeEnum.Text)]
    public InArgument<Guid?> SourceWorkItemId { get; set; } = new InArgument<Guid?>();

    [DisplayName("Retry Time Unit")]
    [Description("The unit of time (Minutes, Hours, or Days) used to delay processing for this retry attempt.")]
    [RenderIfCondition(nameof(IsRetry), true)]
    public InArgument<RetryTimeUnitEnum> RetryTimeUnit { get; set; } = new InArgument<RetryTimeUnitEnum>(RetryTimeUnitEnum.Minutes);

    [DisplayName("Retry Time Value")]
    [Description("The delay duration in selected time units before this retry attempt becomes available for processing. Must be 1 or greater.")]
    [RenderIfCondition(nameof(IsRetry), true)]
    [NodeFieldType(NodeFieldTypeEnum.Number)]
    [DefaultValue(1)]
    public InArgument<double> RetryTimeValue { get; set; } = new InArgument<double>(1);

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
            var sourceWorkItemId = SourceWorkItemId.Get(context);
            var retryTimeUnit = RetryTimeUnit.Get(context);
            var retryTimeValue = RetryTimeValue.Get(context);
            var isRetry = IsRetry.Get(context);
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var accessToken = callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required");

            if (string.IsNullOrWhiteSpace(queueName))
                throw new ArgumentException("Queue Name cannot be null or empty.");

            var fileUrlsArray = fileUrls?.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            // Calculate the retry time by adding the configured duration (Time Unit + Value)
            // to the current date and time, in the DateTimeOffset format required by the API.
            DateTimeOffset? retryTime = null;

            if (isRetry)
            {
                if (!sourceWorkItemId.HasValue)
                    throw new ArgumentException("Source Work Item ID is required when 'Is Retry' is true.");

                if (retryTimeValue < 1)
                    throw new ArgumentException("Retry Time Value must be at least 1.");

                retryTime = retryTimeUnit switch
                {
                    RetryTimeUnitEnum.Minutes => DateTimeOffset.UtcNow.AddMinutes(retryTimeValue),
                    RetryTimeUnitEnum.Hours => DateTimeOffset.UtcNow.AddHours(retryTimeValue),
                    RetryTimeUnitEnum.Days => DateTimeOffset.UtcNow.AddDays(retryTimeValue),
                    _ => throw new ArgumentException($"Unsupported Retry Time Unit '{retryTimeUnit}'.")
                };
            }

            var payload = new
            {
                queueName = queueName,
                sourceWorkItemId = sourceWorkItemId,
                workItemData = JsonSerializer.Serialize(workItemData),
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

    public enum RetryTimeUnitEnum
    {
        [Display(Name = "Minutes", Description = "Schedules the retry delay in minutes from the current time.")]
        Minutes,

        [Display(Name = "Hours", Description = "Schedules the retry delay in hours from the current time.")]
        Hours,

        [Display(Name = "Days", Description = "Schedules the retry delay in days from the current time.")]
        Days
    }
}
