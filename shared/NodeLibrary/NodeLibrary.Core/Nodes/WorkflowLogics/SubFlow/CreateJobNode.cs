using NodeLibrary.QueueManagementNodes.Helpers;

namespace NodeLibrary.SubFlowNodes;

[DisplayName("Create Job")]
[Description("Creates a separate job for another agent, optionally waits for it to finish.")]
[NodeMetadata(icon: "/function.png")]
public class CreateJobNode : BaseNode
{
    [DisplayName("Agent")]
    [Description("The agent version the created job runs.")]
    [NodeFieldType(NodeFieldTypeEnum.FlowSelect)]
    public required InArgument<string> TargetFlowVersionId { get; set; }

    [DisplayName("Priority")]
    [Description("Priority of the created job.")]
    public InArgument<CreateJobPriorityEnum> Priority { get; set; } = new InArgument<CreateJobPriorityEnum>(CreateJobPriorityEnum.Normal);

    [DisplayName("Execute it on Cloud")]
    [Description("Runs the created job on the cloud queue instead of a registered machine.")]
    [DefaultValue(false)]
    [DependsOn(nameof(TargetFlowVersionId))]
    [NodeFieldType(NodeFieldTypeEnum.CloudExecutionSwitch)]
    public InArgument<bool> ExecuteOnCloud { get; set; } = new InArgument<bool>(false);

    [DisplayName("Machine")]
    [Description("Unique name of the registered machine that runs the created job. Required when cloud execution is off.")]
    [RenderIfCondition(nameof(ExecuteOnCloud), false)]
    [DependsOn(nameof(TargetFlowVersionId))]
    [NodeFieldType(NodeFieldTypeEnum.MachineSelect)]
    public InArgument<string> Machine { get; set; } = new InArgument<string>();

    [DisplayName("Job Input Data")]
    [Description("Input payload passed to the created job as JSON. Leave empty to send no input data.")]
    [NodeFieldType(NodeFieldTypeEnum.JsonEditor)]
    public InArgument<string> JobInputData { get; set; } = new InArgument<string>();

    [DisplayName("Existing Job ID")]
    [Description("Optional existing job id of the same flow version to reuse with a higher retry count.")]
    [NodeFieldType(NodeFieldTypeEnum.Text)]
    public InArgument<string> ExistingJobId { get; set; } = new InArgument<string>();

    [DisplayName("Wait For Completion")]
    [Description("Waits for the created job and returns its final status and outputs. Fails this step when the job fails or the timeout elapses.")]
    [DefaultValue(false)]
    public InArgument<bool> WaitForCompletion { get; set; } = new InArgument<bool>(false);

    [DisplayName("Poll Interval (seconds)")]
    [Description("How often to check the created job while waiting.")]
    [RenderIfCondition(nameof(WaitForCompletion), true)]
    [NodeFieldType(NodeFieldTypeEnum.Number)]
    [DefaultValue(5)]
    public InArgument<int> PollIntervalSeconds { get; set; } = new InArgument<int>(5);

    [DisplayName("Timeout (seconds)")]
    [Description("How long to wait for the created job before failing this step.")]
    [RenderIfCondition(nameof(WaitForCompletion), true)]
    [NodeFieldType(NodeFieldTypeEnum.Number)]
    [DefaultValue(300)]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(300);

    [DisplayName("Job ID")]
    [Description("Identifier of the created job.")]
    public OutArgument<Guid> JobId { get; set; } = new OutArgument<Guid>();

    [DisplayName("Status")]
    [Description("Final status of the created job when waiting is enabled.")]
    public OutArgument<string> Status { get; set; } = new OutArgument<string>();

    [DisplayName("Output Data")]
    [Description("Output data of the created job when waiting is enabled.")]
    public OutArgument<string> OutputDataJson { get; set; } = new OutArgument<string>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var targetFlowVersionId = TargetFlowVersionId?.Get(context);
            if (!Guid.TryParse(targetFlowVersionId, out var flowVersionId) || flowVersionId == Guid.Empty)
                throw new ArgumentException("A valid target flow version is required.");

            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var jobContext = JobContext.Get(context);

            var executionLocation = ResolveExecutionLocation(context);
            var jobInputData = ParseJobInputData(context);
            var existingJobId = ParseExistingJobId(context);
            var waitForCompletion = WaitForCompletion.Get(context);
            var pollIntervalSeconds = PollIntervalSeconds.Get(context);
            var timeoutSeconds = TimeoutSeconds.Get(context);
            if (waitForCompletion
                && (pollIntervalSeconds < 1 || timeoutSeconds < 1 || pollIntervalSeconds >= timeoutSeconds))
                throw new ArgumentException("Poll Interval must be at least 1 second and less than the Timeout.");
            var priority = Priority.Get(context).ToString();
            var parentJobId = jobContext?.Id == Guid.Empty ? (Guid?)null : jobContext?.Id;

            var payload = new
            {
                triggerType = "Flow",
                flowVersionId,
                refId = parentJobId,
                priority,
                executionLocation,
                jobInputData,
                existingJobId
            };

            var createdJob = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                "workspace/api/execution/job",
                HttpMethod.Post,
                callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required"),
                payload,
                callerContext.EnvType,
                callerContext.SpaceId);

            var childJobId = createdJob.GetProperty("id").GetGuid();
            JobId.Set(context, childJobId);

            if (!waitForCompletion)
            {
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Job {childJobId} created.");
                return;
            }

            var deadline = DateTimeOffset.UtcNow.AddSeconds(timeoutSeconds);
            var (isCompleted, status) = await PollChildJobAsync(context, callerContext, baseUrl, childJobId, parentJobId, deadline, pollIntervalSeconds);

            if (!isCompleted)
                throw new InvalidOperationException($"Created job {childJobId} finished with status {status}.");

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Job {childJobId} completed with status {status}.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error creating job: {ex.Message}");
            throw;
        }
    }

    private string ResolveExecutionLocation(INodeContext context)
    {
        if (ExecuteOnCloud.Get(context))
            return "Cloud";

        var machineName = Machine.Get(context)?.Trim();
        if (string.IsNullOrEmpty(machineName))
            throw new ArgumentException("Machine is required when cloud execution is off.");

        return machineName;
    }

    private JsonNode? ParseJobInputData(INodeContext context)
    {
        var jobInputData = JobInputData.Get(context);
        if (string.IsNullOrWhiteSpace(jobInputData))
            return null;

        try
        {
            return JsonNode.Parse(jobInputData);
        }
        catch (JsonException)
        {
            throw new ArgumentException("Job Input Data must be valid JSON.");
        }
    }

    private Guid? ParseExistingJobId(INodeContext context)
    {
        var existingJobId = ExistingJobId.Get(context)?.Trim();
        if (string.IsNullOrEmpty(existingJobId))
            return null;

        if (!Guid.TryParse(existingJobId, out var parsedExistingJobId) || parsedExistingJobId == Guid.Empty)
            throw new ArgumentException("Existing Job ID must be a valid UUID.");

        return parsedExistingJobId;
    }

    private async Task<(bool IsCompleted, string Status)> PollChildJobAsync(INodeContext context, CallerContext callerContext, string baseUrl, Guid childJobId, Guid? parentJobId, DateTimeOffset deadline, int pollIntervalSeconds)
    {
        var interval = TimeSpan.FromSeconds(pollIntervalSeconds);
        var pollUrl = parentJobId.HasValue
            ? $"workspace/api/execution/job/{childJobId}?parentJobId={parentJobId.Value}"
            : $"workspace/api/execution/job/{childJobId}";

        while (DateTimeOffset.UtcNow < deadline)
        {
            var remaining = deadline - DateTimeOffset.UtcNow;
            await Task.Delay(interval < remaining ? interval : remaining);

            // IMPORTANT NOTE: the token is read through CallerContext on every poll so a refreshed machine JWT is picked up.
            var childJob = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                pollUrl,
                HttpMethod.Get,
                callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required"),
                null,
                callerContext.EnvType,
                callerContext.SpaceId);

            var status = childJob.TryGetProperty("status", out var statusElement)
                ? statusElement.GetString() ?? string.Empty
                : string.Empty;

            if (IsFailedStatus(status))
                return (false, status);

            if (IsCompletedStatus(status))
            {
                var outputDataJson = childJob.TryGetProperty("outputDataJson", out var outputElement)
                    ? outputElement.GetString()
                    : null;

                Status.Set(context, status);
                OutputDataJson.Set(context, outputDataJson);
                return (true, status);
            }
        }

        throw new TimeoutException($"Created job {childJobId} did not finish within the timeout.");
    }

    private static bool IsCompletedStatus(string status)
        => string.Equals(status, "Completed", StringComparison.OrdinalIgnoreCase);

    private static bool IsFailedStatus(string status)
        => string.Equals(status, "Failed", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "Aborted", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "Canceled", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "Killed", StringComparison.OrdinalIgnoreCase);

    public enum CreateJobPriorityEnum
    {
        [Display(Name = "Low", Description = "Low priority job.")]
        Low,

        [Display(Name = "Normal", Description = "Normal priority job.")]
        Normal,

        [Display(Name = "High", Description = "High priority job.")]
        High,

        [Display(Name = "Critical", Description = "Critical priority job.")]
        Critical
    }
}
