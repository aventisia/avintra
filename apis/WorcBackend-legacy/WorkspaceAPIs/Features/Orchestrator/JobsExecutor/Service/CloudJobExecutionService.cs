using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Services;

public class CloudJobExecutionService : ICloudJobExecutionService
{
    private readonly ILogger<CloudJobExecutionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExecuteFlowStep2Service _executeFlowStep2Service;
    private readonly EnvironmentConfig _environmentConfig;

    private const string CloudProdEnvType = "prod";
    private const string CloudDevEnvType = "dev";

    private readonly Guid _userId;
    private readonly string _accessToken;

    public CloudJobExecutionService(
        ILogger<CloudJobExecutionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IExecuteFlowStep2Service executeFlowStep2Service,
        EnvironmentConfig environmentConfig)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _accessToken = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? string.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _executeFlowStep2Service = executeFlowStep2Service;
        _environmentConfig = environmentConfig;
    }

    public async Task ExecuteAsync(Job job)
    {
        var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w => w.Id == job.FlowVersionId)
            .IgnoreQueryFilters()
            .Include(i => i.Flow)
            .AsNoTracking()
            .SingleOrDefaultAsync();

        if (flowVersion == null)
        {
            await FailJobAsync(job, "Cloud execution failed: flow version not found.");
            return;
        }

        var parsedFlow = ReactFlowHelper.Parse(flowVersion.ReactFlowObject);
        if (parsedFlow == null)
        {
            await FailJobAsync(job, "Cloud execution failed: the flow graph is invalid.");
            return;
        }

        var executionUserId = _userId != Guid.Empty ? _userId : job.RefId ?? Guid.Empty;
        var accessToken = await ResolveAccessTokenAsync(job, executionUserId);
        if (string.IsNullOrEmpty(accessToken))
        {
            await FailJobAsync(job, "Cloud execution failed: no execution access token.");
            return;
        }

        if (!await TryClaimJobAsync(job))
        {
            _logger.LogWarning("Cloud execution skipped for job {JobId}: already claimed by another dispatch.", job.Id);
            return;
        }

        var flowExecutionArgs = new FlowExecutionArgs
        {
            TenantId = job.TenantId,
            JobId = job.Id,
            FlowVersionId = job.FlowVersionId,
            FlowName = flowVersion.Flow?.Name ?? string.Empty,
            FlowData = parsedFlow,
            UserId = executionUserId,
            AccessToken = accessToken,
            EnvType = flowVersion.IsPublished ? CloudProdEnvType : CloudDevEnvType
        };

        try
        {
            _executeFlowStep2Service.StartExecution(flowExecutionArgs);
            _logger.LogInformation("Job {JobId} dispatched to the cloud engine.", job.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Job {JobId} failed to start on the cloud engine.", job.Id);
            await FailJobAsync(job, "Cloud execution failed: the engine could not start the job.");
        }
    }

    private async Task<bool> TryClaimJobAsync(Job job)
    {
        var claimedRows = await _unitOfWork.JobRepo
            .GetByConditionAsync(w => w.Id == job.Id && w.Status == JobStatusEnum.Created)
            .IgnoreQueryFilters()
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(j => j.Status, JobStatusEnum.Running)
                .SetProperty(j => j.StartTime, DateTimeOffset.UtcNow));

        return claimedRows == 1;
    }

    private async Task<string> ResolveAccessTokenAsync(Job job, Guid executionUserId)
    {
        if (!string.IsNullOrEmpty(_accessToken))
            return _accessToken;

        if (executionUserId == Guid.Empty)
            return string.Empty;

        var executionUser = await _unitOfWork.WorkspaceUserRepo
            .GetByConditionAsync(user => user.Id == executionUserId && user.TenantId == job.TenantId)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return executionUser == null
            ? string.Empty
            : MachineAuthTokenHelper.CreateMachineJwt(
                _environmentConfig,
                job.TenantId,
                executionUser.Id,
                executionUser.UserName,
                null).Jwt;
    }

    private async Task FailJobAsync(Job job, string remark)
    {
        _logger.LogWarning("Job {JobId} could not start on the cloud engine: {Remark}", job.Id, remark);

        job.Status = JobStatusEnum.Failed;
        job.EndTime = DateTimeOffset.UtcNow;
        job.Remark = remark;
        _unitOfWork.JobRepo.Update(job);
        await _unitOfWork.SaveAsync();
    }
}
