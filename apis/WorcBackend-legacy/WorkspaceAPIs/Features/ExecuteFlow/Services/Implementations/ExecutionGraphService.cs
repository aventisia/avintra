using ExecutorLibrary.Helpers;

namespace WorkspaceAPIs.Services;

using AspNetToolkit.Services;

public class ExecutionGraphService : IExecutionGraphService
{
    private readonly ILogger<ExecutionGraphService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFlowBuilderService _flowBuilderService;
    private readonly ICurrentTenantService _currentTenantService;

    public ExecutionGraphService(
        ILogger<ExecutionGraphService> logger,
        IUnitOfWork unitOfWork,
        IFlowBuilderService flowBuilderService,
        ICurrentTenantService currentTenantService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _flowBuilderService = flowBuilderService;
        _currentTenantService = currentTenantService;
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

            var job = await _unitOfWork.JobRepo
                .GetByConditionAsync(j => j.Id == jobId && j.TenantId == currentTenantId)
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

            var reactFlowObject = flowVersion.ReactFlowObject ?? "{}";

            var subFlows = await CollectSubFlowGraphsAsync(reactFlowObject);

            var dto = new ExecutionGraphDto
            {
                JobId = job.Id,
                TenantId = job.TenantId,
                FlowVersionId = flowVersion.Id,
                FlowName = flowVersion.Flow?.Name ?? string.Empty,
                InputArgumentsJson = job.InputArgumentsJson,
                ReactFlowObject = reactFlowObject,
                InputOutputObject = flowVersion.InputOutputObject,
                SubFlows = subFlows,
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

    private async Task<List<SubFlowGraphDto>> CollectSubFlowGraphsAsync(string reactFlowObject)
    {
        var subFlowIds = new HashSet<Guid>();

        var flow = ReactFlowHelper.Parse(reactFlowObject);
        if (flow is null)
            return [];

        foreach (var node in flow.Nodes)
        {
            if (string.Equals(node.Type, "callAgentNode", StringComparison.OrdinalIgnoreCase))
            {
                var refStr = node.Data?.SelectedAgent;
                if (!string.IsNullOrWhiteSpace(refStr))
                    TryExtractFlowVersionId(refStr, subFlowIds);
            }
            else if (string.Equals(node.Type, "blockNode", StringComparison.OrdinalIgnoreCase))
            {
                var refStr = node.Data?.SelectedBlock;
                if (!string.IsNullOrWhiteSpace(refStr))
                    TryExtractFlowVersionId(refStr, subFlowIds);
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

    private static void TryExtractFlowVersionId(string reference, HashSet<Guid> ids)
    {
        var segments = reference.Split(',');
        if (segments.Length >= 1 && Guid.TryParse(segments[0].Trim(), out var flowVersionId))
        {
            ids.Add(flowVersionId);
        }
    }
}
