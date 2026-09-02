using ExecutorLibrary.Helpers;
using System.Text.Json;

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
                TryExtractFlowVersionId(node.Data?.SelectedAgent, subFlowIds);
            }
            else if (string.Equals(node.Type, "blockNode", StringComparison.OrdinalIgnoreCase))
            {
                TryExtractFlowVersionId(node.Data?.SelectedBlock, subFlowIds);
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

    private static void TryExtractFlowVersionId(JsonElement? reference, HashSet<Guid> ids)
    {
        if (reference is null)
            return;

        string? flowVersionIdStr = null;

        if (reference.Value.ValueKind == JsonValueKind.Object &&
            reference.Value.TryGetProperty("id", out var idProperty))
        {
            flowVersionIdStr = idProperty.GetString();
        }
        else if (reference.Value.ValueKind == JsonValueKind.String)
        {
            flowVersionIdStr = reference.Value.GetString();
        }

        if (!string.IsNullOrWhiteSpace(flowVersionIdStr) &&
            Guid.TryParse(flowVersionIdStr.Trim(), out var flowVersionId))
        {
            ids.Add(flowVersionId);
        }
    }
}
