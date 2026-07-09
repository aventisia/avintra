using System.Text.Json.Nodes;
using NodeLibrary.Enums;
using ExecutorLibrary.Models;
using ExecutorLibrary.Helpers;

namespace WorkspaceAPIs.Services;

public class ExecuteFlowStep1Service : IExecuteFlowStep1Service
{
    private readonly ILogger<ExecuteFlowStep1Service> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly INotificationHelperService _notificationHelperService;
    private readonly IExecuteFlowStep2Service _executeFlowStep2Service;
    private readonly IResourceShareService _resourceShareService;
    private readonly Guid _userId;
    private readonly string _accessToken;

    public ExecuteFlowStep1Service(
        ILogger<ExecuteFlowStep1Service> logger,
        IUnitOfWork unitOfWork,
        ICurrentTenantService currentTenantService,
        INotificationHelperService notificationHelperService,
        IExecuteFlowStep2Service executeFlowStep2Service,
        IHttpContextAccessor httpContextAccessor,
        IResourceShareService resourceShareService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _notificationHelperService = notificationHelperService;
        _executeFlowStep2Service = executeFlowStep2Service;
        _userId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid"), out var userId)
            ? userId
            : Guid.Empty;
        _accessToken = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? string.Empty;
        _resourceShareService = resourceShareService;
    }

    public async Task<ServiceResponse<ExecuteFlowResponseDto>> ExecuteFlowAsync(ExecuteFlowRequestDto requestDto, TriggerTypesEnum triggerType)
    {
        // IMPORTANT NOTE: For end user, a flow version is a simple flow, so end user specific messages should use 
        // the word "flow" instead of "flow version" to avoid confusion. We will use flow version in the backend 
        // logic, comments, documentation and database since it is more accurate, but the messages shown to end user 
        // on frontend should flow instead of flow version.
        var serviceResponse = ServiceResponse<ExecuteFlowResponseDto>.Create(message: "Failed to invoke flow. Please try again.");

        try
        {
            // Get the flow version
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == requestDto.FlowVersionId)
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionHistories)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Validate: Flow version not found
            if (flowVersion == null)
                return serviceResponse.Update(404, "Flow was not found.");

            // Validate: Archived flow version cannot be executed
            if (flowVersion.IsArchived)
                return serviceResponse.Update(400, "Flow is archived and cannot be executed.");

            // Validate: User is not logged in and flow version is not published. Note: Non-published flow can only be executed
            // by logged in users via platform UI, while published flow can be executed by both logged in users via 
            // platform UI and external systems via API.
            if (flowVersion.IsPublished == false && _userId == Guid.Empty)
                return serviceResponse.Update(401, "You must be logged in to execute this flow.");

            // Validate: User don't have access to the parent flow
            if (await HasUserAccessToFlowAsync(flowVersion) == false)
                return serviceResponse.Update(403, "You do not have permission to execute this flow.");

            // Get the parsed ReactFlowObject
            var parsedFlow = ReactFlowHelper.Parse(flowVersion.ReactFlowObject);

            // Validate: Invalid react flow object
            if (parsedFlow == null)
                return serviceResponse.Update(400, "Flow is missing or invalid.");

            // Validations for unpublished flow versions. For published flow versions, we will skip validations since 
            // published flow versions are non-editable and all validations should have been passed at the time of publishing.
            // TODO: Need to add these validations at the time of publishing.
            if (flowVersion.IsPublished == false)
            {
                // Validate: Invalid react flow object, return bad request
                if (parsedFlow == null || parsedFlow.Nodes == null || parsedFlow.Nodes.Count == 0 || parsedFlow.Edges == null || parsedFlow.Edges.Count == 0)
                    return serviceResponse.Update(400, "Flow is missing or invalid.");

                // Validate: Flow contains one or more executable nodes that are desktop-only
                if (FlowValidationHelper.DoesFlowContainsAnyDesktopOnlyNode(parsedFlow))
                    return serviceResponse.Update(400, "Flow contains desktop nodes which cannot be executed via web. Please remove desktop nodes from the flow and try again.");

                // Validate: Reject flow execution if it contains only support/placeholder nodes
                if (FlowValidationHelper.IsEmptyFlow(parsedFlow))
                    return serviceResponse.Update(400, "Flow is empty and cannot be executed.");

                // Validate: Flow graph is invalid (e.g. missing nodes or edges, or edges connecting to non-existing nodes)
                if (FlowValidationHelper.IsValidFlowGraph(parsedFlow) is string flowGraphValidationError)
                    return serviceResponse.Update(400, $"Flow graph is invalid: {flowGraphValidationError}");
            }

            // Insert a new job for the flow execution
            var newJob = new Job
            {
                TenantId = _currentTenantService.CurrentTenantId,
                FlowVersionId = flowVersion.Id,
                TriggerType = triggerType,
                Priority = JobPriorityEnum.Normal,
                Status = JobStatusEnum.Created,
                StartTime = null,
                EndTime = null,
                RetryCount = 0,
                IsPublished = flowVersion.IsPublished,
                InputArgumentsJson = requestDto.InputArgumentsJson?.ToJsonString(),
                OutputDataJson = null,
                NodeExecutionLogs = null,
                FlowVersionHistoryId = flowVersion.FlowVersionHistories
                    .OrderByDescending(o => o.CreatedOn)
                    .Select(s => (Guid?)s.Id)
                    .FirstOrDefault()
            };
            await _unitOfWork.JobRepo.InsertAsync(newJob);

            // Error: Failed to save the new job to database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new job for flow execution. FlowVersionId: {FlowVersionId}", requestDto.FlowVersionId);
                return serviceResponse;
            }

            // Create FlowExecutionArgs
            var flowExecutionArgs = new FlowExecutionArgs
            {
                TenantId = _currentTenantService.CurrentTenantId,
                JobId = newJob.Id,
                FlowVersionId = flowVersion.Id,
                FlowName = flowVersion.Flow?.Name ?? string.Empty,
                FlowData = parsedFlow,
                UserId = _userId,
                AccessToken = _accessToken,
            };

            // Start flow execution asynchronously or synchronously based on WaitForCompletion flag
            if (requestDto.WaitForCompletion)
            {
                // Synchronous: await flow completion and return the output inline (used for chat-triggered flows)
                var flowResult = await _executeFlowStep2Service.StartExecutionAndWaitAsync(flowExecutionArgs);

                // Re-fetch the job to get the updated OutputDataJson
                var updatedJob = await _unitOfWork.JobRepo.GetByConditionAsync(w => w.Id == newJob.Id).AsNoTracking().SingleOrDefaultAsync();

                var executeFlowResponse = new ExecuteFlowResponseDto
                {
                    JobId = newJob.Id,
                    FlowVersionId = newJob.FlowVersionId,
                    JobStatus = updatedJob?.Status ?? JobStatusEnum.Failed,
                    OutputDataJson = !string.IsNullOrWhiteSpace(updatedJob?.OutputDataJson)
                        ? JsonValue.Create(updatedJob.OutputDataJson)
                        : null,
                };

                if (!flowResult.IsSuccess)
                {
                    return serviceResponse.Update(200, flowResult.ErrorMessage ?? "Flow execution failed.", executeFlowResponse);
                }

                return serviceResponse.Update(200, "Flow execution completed successfully.", executeFlowResponse);
            }
            else
            {
                // Asynchronous: start execution in background and return immediately
                _executeFlowStep2Service.StartExecution(flowExecutionArgs);

                // TODO: Create a notificaiton for the user that the flow execution has been started

                var executeFlowResponse = new ExecuteFlowResponseDto
                {
                    JobId = newJob.Id,
                    FlowVersionId = newJob.FlowVersionId,
                    JobStatus = newJob.Status,
                    OutputDataJson = null,
                };
                return serviceResponse.Update(200, "Flow execution initiated successfully.", executeFlowResponse);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing flow for version Id: {FlowVersionId}", requestDto.FlowVersionId);
        }

        return serviceResponse;
    }

    // Helper: Determines whether the current user has access to a specific flow version
    private async Task<bool> HasUserAccessToFlowAsync(FlowVersion flowVersion)
    {
        // STEP 1: Draft / Unpublished versions
        // These versions do not maintain their own access rules and inherit permissions entirely from the parent Flow.
        if (!flowVersion.IsPublished)
        {
            var flow = await _unitOfWork.FlowRepo
                .GetByConditionAsync(w => w.Id == flowVersion.FlowId)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // If the parent flow cannot be found, access is denied
            if (flow == null)
                return false;

            // Global override: tenant-wide access at Flow level
            if (flow.IsTenantWideAccess)
                return true;

            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                flow.Id,
                ResourceTypeEnum.Flow,
                flow.CreatedByUserId,
                flow.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // Draft versions require at least view-level access on the parent Flow
            return canView;
        }

        // --------------------------------------------------------------------
        // STEP 2: Published versions
        // These versions have explicit access control independent of the Flow.
        // --------------------------------------------------------------------

        // Global override: tenant-wide access at version level
        if (flowVersion.IsTenantWideAccess)
            return true;

        // Final check: explicit user assignment on the published version
        return await _unitOfWork.FlowVersionUserRepo
            .DoesDependentEntitiesExistAsync(x =>
                x.FlowVersionId == flowVersion.Id &&
                x.UserId == _userId
            );
    }
}
