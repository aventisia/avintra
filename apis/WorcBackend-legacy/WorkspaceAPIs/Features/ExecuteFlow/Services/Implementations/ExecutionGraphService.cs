using ExecutorLibrary.Helpers;

namespace WorkspaceAPIs.Services;

using AspNetToolkit.Services;

public class ExecutionGraphService : IExecutionGraphService
{
    private readonly ILogger<ExecutionGraphService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFlowBuilderService _flowBuilderService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IResourceFlowAccessService _resourceFlowAccessService;

    public ExecutionGraphService(
        ILogger<ExecutionGraphService> logger,
        IUnitOfWork unitOfWork,
        IFlowBuilderService flowBuilderService,
        ICurrentTenantService currentTenantService,
        IResourceFlowAccessService resourceFlowAccessService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _flowBuilderService = flowBuilderService;
        _currentTenantService = currentTenantService;
        _resourceFlowAccessService = resourceFlowAccessService;
    }

    public async Task<ServiceResponse<ExecutionGraphDto>> GetExecutionGraphAsync(Guid jobId)
    {
        var serviceResponse = new ServiceResponse<ExecutionGraphDto>
        {
            Data = null,
            Message = "Failed to fetch execution graph. Please try again.",
        };

        try
        {
            var currentTenantId = _currentTenantService.CurrentTenantId;

            // Ignore the global space filter: the runner authenticates without space
            // context, so a space-scoped job would be invisible. TenantId is checked
            // explicitly above.
            var job = await _unitOfWork.JobRepo
                .GetByConditionAsync(j => j.Id == jobId && j.TenantId == currentTenantId)
                .IgnoreQueryFilters()
                .Include(i => i.FlowVersion)
                    .ThenInclude(fv => fv.Flow)
                .SingleOrDefaultAsync();

            if (job is null)
            {
                serviceResponse.Message = "Job not found.";
                return serviceResponse;
            }

            var flowVersion = job.FlowVersion;
            if (flowVersion is null)
            {
                serviceResponse.Message = "Flow version not found for the job.";
                return serviceResponse;
            }

            var resourceAccess = await _resourceFlowAccessService.ValidateRunResourceAccessAsync(
                job.TenantId,
                flowVersion.IsPublished ? ConfigureEnvironmentType.Prod : ConfigureEnvironmentType.Dev,
                flowVersion.Flow?.SpaceId,
                flowVersion.FlowId,
                flowVersion.ReactFlowObject);
            if (resourceAccess.Data != true)
            {
                var denialMessage = resourceAccess.Message ?? "This flow is not assigned to a restricted resource.";
                if (resourceAccess.StatusCode == 403)
                {
                    await RecordRunDenialAsync(job, denialMessage);
                }
                serviceResponse.Message = denialMessage;
                serviceResponse.StatusCode = resourceAccess.StatusCode;
                return serviceResponse;
            }

            var reactFlowObject = flowVersion.ReactFlowObject ?? "{}";

            var subFlows = await CollectSubFlowGraphsAsync(reactFlowObject);

            var dto = new ExecutionGraphDto
            {
                JobId = job.Id,
                TenantId = job.TenantId,
                SpaceId = job.SpaceId,
                FlowVersionId = flowVersion.Id,
                FlowName = flowVersion.Flow?.Name ?? string.Empty,
                InputArgumentsJson = job.InputArgumentsJson,
                ReactFlowObject = reactFlowObject,
                InputOutputObject = flowVersion.InputOutputObject,
                SubFlows = subFlows,
                // Published agents run against production resources; unpublished/draft flows run
                // against development resources.
                EnvType = flowVersion.IsPublished ? "prod" : "dev",
            };

            serviceResponse.Data = dto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Execution graph fetched successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch execution graph for job {JobId}", jobId);
            return serviceResponse;
        }

        return serviceResponse;
    }

    private async Task RecordRunDenialAsync(Job job, string message)
    {
        try
        {
            // IMPORTANT NOTE: the desktop runner surfaces a rejected graph fetch as a generic
            // HTTP failure, so the denial is recorded here to keep the Failed job's message.
            job.Status = JobStatusEnum.Failed;
            job.EndTime = DateTimeOffset.UtcNow;
            job.Remark = message;
            await _unitOfWork.SaveAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record the resource access denial for job {JobId}.", job.Id);
        }
    }

    private async Task<List<SubFlowGraphDto>> CollectSubFlowGraphsAsync(string reactFlowObject)
    {
        var subFlowIds = new HashSet<Guid>();

        var flow = ReactFlowHelper.Parse(reactFlowObject);
        if (flow is null)
            return [];

        foreach (var node in flow.Nodes)
        {
            var reference = string.Equals(node.Type, "callAgentNode", StringComparison.OrdinalIgnoreCase)
                ? node.Data?.SelectedAgent
                : string.Equals(node.Type, "blockNode", StringComparison.OrdinalIgnoreCase)
                    ? node.Data?.SelectedBlock
                    : null;

            if (ResourceFlowAccessHelpers.TryExtractFlowVersionId(reference, out var flowVersionId))
            {
                subFlowIds.Add(flowVersionId);
            }
        }

        if (subFlowIds.Count == 0)
            return [];

        var subFlowResult = await _flowBuilderService.FetchSubFlowsAsync(subFlowIds);
        var subFlowDtos = subFlowResult?.Data;

        if (subFlowDtos is null)
            return [];

        var result = new List<SubFlowGraphDto>();
        foreach (var sf in subFlowDtos)
        {
            if (!string.IsNullOrWhiteSpace(sf.ReactFlowObject))
            {
                result.Add(new SubFlowGraphDto
                {
                    FlowVersionId = sf.FlowVersionId,
                    ReactFlowObject = sf.ReactFlowObject,
                    InputOutputObject = sf.InputOutputObject,
                });
            }
        }

        return result;
    }
}
