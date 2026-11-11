using ExecutorLibrary.Helpers;
using WorkspaceAPIs.Features.VoiceSessions.DTOs;

namespace WorkspaceAPIs.Features.VoiceSessions.Service;

/// <summary>Resolution mode for a VoiceAgent settings request.</summary>
public enum VoiceAgentSettingsMode
{
    /// <summary>Resolve the current draft for a test session.</summary>
    Test,

    /// <summary>Resolve the published agent for a live session.</summary>
    Live,
}

/// <summary>Outcome of resolving a VoiceAgent settings request.</summary>
public enum VoiceAgentSettingsResolutionStatus
{
    /// <summary>Settings were resolved.</summary>
    Success,

    /// <summary>The flow version does not exist or is not a VoiceAgent.</summary>
    NotFound,

    /// <summary>The caller cannot access the parent flow.</summary>
    Forbidden,

    /// <summary>The requested draft or published version is unavailable.</summary>
    Unavailable,

    /// <summary>The persisted graph cannot be used as a VoiceAgent.</summary>
    Invalid,
}

/// <summary>Typed result returned by the VoiceAgent settings resolver.</summary>
public sealed class VoiceAgentSettingsResolution
{
    /// <summary>The resolution status.</summary>
    public VoiceAgentSettingsResolutionStatus Status { get; init; }

    /// <summary>A safe user-facing explanation for the status.</summary>
    public string Message { get; init; } = string.Empty;

    /// <summary>The settings when resolution succeeds.</summary>
    public VoiceAgentSettingsDto? Settings { get; init; }

    /// <summary>Creates a successful resolution.</summary>
    public static VoiceAgentSettingsResolution Succeeded(VoiceAgentSettingsDto settings) => new()
    {
        Status = VoiceAgentSettingsResolutionStatus.Success,
        Message = "Voice agent settings resolved.",
        Settings = settings,
    };

    /// <summary>Creates a failed resolution.</summary>
    public static VoiceAgentSettingsResolution Failed(
        VoiceAgentSettingsResolutionStatus status,
        string message) => new()
        {
            Status = status,
            Message = message,
        };

    /// <summary>Maps the resolution status to the HTTP status returned to the caller.</summary>
    public int ToHttpStatusCode() => Status switch
    {
        VoiceAgentSettingsResolutionStatus.Success => 200,
        VoiceAgentSettingsResolutionStatus.NotFound => 404,
        VoiceAgentSettingsResolutionStatus.Forbidden => 403,
        VoiceAgentSettingsResolutionStatus.Unavailable => 409,
        _ => 422,
    };
}

/// <summary>Resolves VoiceAgent settings after tenant and resource access checks.</summary>
public interface IVoiceAgentSettingsResolver
{
    /// <summary>Resolves one VoiceAgent version for test or live use.</summary>
    Task<VoiceAgentSettingsResolution> ResolveAsync(
        Guid flowVersionId,
        VoiceAgentSettingsMode mode,
        CancellationToken cancellationToken = default);
}

/// <inheritdoc />
public sealed class VoiceAgentSettingsResolver : IVoiceAgentSettingsResolver
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    /// <summary>Initializes the VoiceAgent settings resolver.</summary>
    public VoiceAgentSettingsResolver(
        IUnitOfWork unitOfWork,
        IResourceUserAccessService resourceUserAccessService,
        ICurrentTenantService currentTenantService,
        IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _resourceUserAccessService = resourceUserAccessService;
        _currentTenantService = currentTenantService;
        _userId = Guid.TryParse(
            httpContextAccessor.HttpContext?.User?.FindFirstValue("uid"),
            out var userId)
            ? userId
            : Guid.Empty;
    }

    /// <inheritdoc />
    public async Task<VoiceAgentSettingsResolution> ResolveAsync(
        Guid flowVersionId,
        VoiceAgentSettingsMode mode,
        CancellationToken cancellationToken = default)
    {
        var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w =>
                w.Id == flowVersionId &&
                w.TenantId == _currentTenantService.CurrentTenantId)
            .Include(w => w.Flow)
            .AsNoTracking()
            .SingleOrDefaultAsync(cancellationToken);

        if (flowVersion?.Flow is null || flowVersion.Flow.Type != FlowTypesEnum.VoiceAgent)
        {
            return VoiceAgentSettingsResolution.Failed(
                VoiceAgentSettingsResolutionStatus.NotFound,
                "Voice agent flow version was not found.");
        }

        if ((mode == VoiceAgentSettingsMode.Live && (!flowVersion.IsPublished || flowVersion.IsArchived)) ||
            (mode == VoiceAgentSettingsMode.Test && flowVersion.IsArchived))
        {
            return VoiceAgentSettingsResolution.Failed(
                VoiceAgentSettingsResolutionStatus.Unavailable,
                mode == VoiceAgentSettingsMode.Live
                    ? "Voice agent is not published or is archived."
                    : "Voice agent draft is archived.");
        }

        var (hasAccess, _) = await _resourceUserAccessService.GetResourceAccessAsync(
            _userId,
            flowVersion.FlowId,
            ResourceTypeEnum.Flow,
            flowVersion.Flow.CreatedByUserId,
            flowVersion.Flow.IsTenantWideAccess,
            ResourceAccessTypeEnum.Owner,
            ResourceAccessTypeEnum.Edit,
            ResourceAccessTypeEnum.View);

        if (!hasAccess)
        {
            return VoiceAgentSettingsResolution.Failed(
                VoiceAgentSettingsResolutionStatus.Forbidden,
                "You do not have access to this voice agent.");
        }

        var parsedFlow = VoiceAgentGraphHelpers.TryParseFlow(flowVersion.ReactFlowObject);
        if (parsedFlow is null)
        {
            return VoiceAgentSettingsResolution.Failed(
                VoiceAgentSettingsResolutionStatus.Invalid,
                "Voice agent graph is invalid.");
        }

        var nodeConfig = VoiceAgentGraphHelpers.GetVoiceAgentNodeConfig(parsedFlow);
        if (nodeConfig is null)
        {
            return VoiceAgentSettingsResolution.Failed(
                VoiceAgentSettingsResolutionStatus.NotFound,
                "Voice agent configuration was not found.");
        }

        if (VoiceAgentGraphHelpers.ValidateVoiceAgentGraph(parsedFlow) is string graphError)
        {
            return VoiceAgentSettingsResolution.Failed(
                VoiceAgentSettingsResolutionStatus.Invalid,
                graphError);
        }

        if (VoiceAgentGraphHelpers.ValidateVoiceAgentConversation(parsedFlow) is string conversationError)
        {
            return VoiceAgentSettingsResolution.Failed(
                VoiceAgentSettingsResolutionStatus.Invalid,
                conversationError);
        }

        var settings = VoiceAgentSettingsFactory.Create(
            flowVersion.Id,
            flowVersion.FlowId,
            flowVersion.Flow.Name,
            nodeConfig);

        if (VoiceAgentGraphHelpers.ValidateVoiceAgentEngine(parsedFlow) is string engineError)
        {
            return VoiceAgentSettingsResolution.Failed(
                VoiceAgentSettingsResolutionStatus.Invalid,
                engineError);
        }

        return VoiceAgentSettingsResolution.Succeeded(settings);
    }
}
