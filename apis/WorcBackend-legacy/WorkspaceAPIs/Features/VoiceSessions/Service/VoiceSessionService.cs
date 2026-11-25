using WorkspaceAPIs.Features.VoiceSessions.DTOs;

namespace WorkspaceAPIs.Features.VoiceSessions.Service;

/// <summary>
/// Bootstraps one caller-bound LiveKit session through llmpipeline.
/// </summary>
public interface IVoiceSessionService
{
    /// <summary>
    /// Creates the voice conversation and the LiveKit room with its caller token.
    /// </summary>
    Task<ServiceResponse<VoiceSessionDto>> CreateSessionAsync(
        VoiceSessionRequestDto voiceSessionRequestDto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks the caller's active voice conversation ended so it stops counting against the session cap.
    /// </summary>
    Task<ServiceResponse<bool>> EndSessionAsync(
        Guid conversationId,
        CancellationToken cancellationToken = default);
}

/// <inheritdoc />
public sealed class VoiceSessionService : IVoiceSessionService
{
    private static readonly TimeSpan VoiceSessionFreshness = TimeSpan.FromMinutes(3);
    private static readonly JsonSerializerOptions PipelineJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IUnitOfWork _unitOfWork;
    private readonly IVoiceAgentSettingsResolver _settingsResolver;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<VoiceSessionService> _logger;
    private readonly int _maxActiveVoiceSessionsPerUser;
    private readonly Guid _userId;
    private readonly string _accessToken;

    /// <summary>Initializes the voice session bootstrap.</summary>
    public VoiceSessionService(
        IUnitOfWork unitOfWork,
        IVoiceAgentSettingsResolver settingsResolver,
        ICurrentTenantService currentTenantService,
        EnvironmentConfig environmentConfig,
        IHttpClientFactory httpClientFactory,
        ILogger<VoiceSessionService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _settingsResolver = settingsResolver;
        _currentTenantService = currentTenantService;
        _environmentConfig = environmentConfig;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _maxActiveVoiceSessionsPerUser = Math.Max(1, environmentConfig.MaxActiveVoiceSessionsPerUser);
        _userId = Guid.TryParse(
            httpContextAccessor.HttpContext?.User?.FindFirstValue("uid"),
            out var userId)
            ? userId
            : Guid.Empty;
        _accessToken = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? string.Empty;
    }

    /// <inheritdoc />
    public async Task<ServiceResponse<VoiceSessionDto>> CreateSessionAsync(
        VoiceSessionRequestDto voiceSessionRequestDto,
        CancellationToken cancellationToken = default)
    {
        var serviceResponse = ServiceResponse<VoiceSessionDto>.Create("Failed to create voice session.", 500);

        if (!Enum.TryParse<VoiceAgentSettingsMode>(voiceSessionRequestDto.Mode, true, out var mode))
            return serviceResponse.Update("Voice session mode must be 'test' or 'live'.", 422);

        var resolution = await _settingsResolver.ResolveAsync(
            voiceSessionRequestDto.FlowVersionId,
            mode,
            cancellationToken);

        var settings = resolution.Settings;
        if (resolution.Status != VoiceAgentSettingsResolutionStatus.Success || settings is null)
            return serviceResponse.Update(resolution.Message, resolution.ToHttpStatusCode());

        var conversation = CreateVoiceConversation(voiceSessionRequestDto.FlowVersionId);
        var freshAfter = DateTimeOffset.UtcNow - VoiceSessionFreshness;
        var tenantId = _currentTenantService.CurrentTenantId;
        var activeSessions = 0;
        var saved = true;

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // IMPORTANT NOTE: the lock serializes two simultaneous starts for one user,
            // so both cannot pass the cap before either row exists.
            await _unitOfWork.AcquireAdvisoryLockAsync($"voice-session:{_userId}");
            // IMPORTANT NOTE: the cap spans every space of the user, so the query drops the
            // DbContext space filter and must restate tenant isolation itself.
            activeSessions = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(active =>
                    active.TenantId == tenantId &&
                    active.UserId == _userId &&
                    active.Channel == ConversationChannelEnum.Voice &&
                    active.Status == ConversationStatusEnum.Active &&
                    active.LastModifiedOn >= freshAfter)
                .IgnoreQueryFilters()
                .CountAsync();
            if (activeSessions >= _maxActiveVoiceSessionsPerUser)
                return;

            await _unitOfWork.ConversationRepo.InsertAsync(conversation);
            saved = await _unitOfWork.SaveAsync();
        });

        if (activeSessions >= _maxActiveVoiceSessionsPerUser)
            return serviceResponse.Update("You already have the maximum number of active voice sessions.", 429);

        if (!saved)
        {
            _logger.LogError("Failed to persist voice conversation for user {UserId}.", _userId);
            return serviceResponse.Update("Failed to create voice session.", 500);
        }

        VoiceSessionDto? session;
        try
        {
            session = await RequestPipelineSessionAsync(settings, conversation.Id, mode, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // IMPORTANT NOTE: the row is already committed, so a cancelled create must not
            // keep counting against the per-user cap as a live call.
            conversation.Status = ConversationStatusEnum.Failed;
            if (!await _unitOfWork.SaveAsync())
                _logger.LogError("Failed to persist cancelled voice conversation for user {UserId}.", _userId);
            throw;
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Voice session bootstrap request failed for user {UserId}.", _userId);
            session = null;
        }

        if (session is null)
        {
            conversation.Status = ConversationStatusEnum.Failed;
            if (!await _unitOfWork.SaveAsync())
                _logger.LogError("Failed to persist failed voice conversation for user {UserId}.", _userId);
            return serviceResponse.Update("Voice session could not be started.", 502);
        }

        return serviceResponse.Update("Voice session created.", 200, session);
    }

    /// <inheritdoc />
    public async Task<ServiceResponse<bool>> EndSessionAsync(
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to end voice session.", 500);
        var tenantId = _currentTenantService.CurrentTenantId;
        var conversation = await _unitOfWork.ConversationRepo
            .GetByConditionAsync(existing =>
                existing.Id == conversationId &&
                existing.TenantId == tenantId &&
                existing.UserId == _userId &&
                existing.Channel == ConversationChannelEnum.Voice)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(cancellationToken);

        if (conversation is null || conversation.Status != ConversationStatusEnum.Active)
            return serviceResponse.Update("Voice session ended.", 200, true);

        conversation.Status = ConversationStatusEnum.Completed;
        _unitOfWork.ConversationRepo.Update(conversation);
        if (!await _unitOfWork.SaveAsync())
        {
            _logger.LogError("Failed to end voice conversation for user {UserId}.", _userId);
            return serviceResponse.Update("Failed to end voice session.", 500);
        }

        return serviceResponse.Update("Voice session ended.", 200, true);
    }

    private Conversation CreateVoiceConversation(Guid flowVersionId)
    {
        var spaceId = _currentTenantService.CurrentSpaceId;
        return new Conversation
        {
            Id = Guid.NewGuid(),
            TenantId = _currentTenantService.CurrentTenantId,
            SpaceId = spaceId == Guid.Empty ? null : spaceId,
            Status = ConversationStatusEnum.Active,
            Channel = ConversationChannelEnum.Voice,
            FlowVersionId = flowVersionId,
            UserId = _userId,
            CreatedByUserId = _userId,
            LastModifiedByUserId = _userId,
        };
    }

    private async Task<VoiceSessionDto?> RequestPipelineSessionAsync(
        VoiceAgentSettingsDto settings,
        Guid conversationId,
        VoiceAgentSettingsMode mode,
        CancellationToken cancellationToken)
    {
        var payload = new
        {
            flow_version_id = settings.FlowVersionId,
            flow_id = settings.FlowId,
            conversation_id = conversationId,
            mode = mode == VoiceAgentSettingsMode.Test ? "test" : "live",
        };
        using var content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json");

        var httpClient = _httpClientFactory.CreateClient();
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        httpClient.DefaultRequestHeaders.Add(
            "X-Env-Type",
            mode == VoiceAgentSettingsMode.Live ? "prod" : "dev");
        if (_currentTenantService.CurrentSpaceId != Guid.Empty)
            httpClient.DefaultRequestHeaders.Add("X-Space-Id", _currentTenantService.CurrentSpaceId.ToString());

        var endpoint = $"{_environmentConfig.LlmPipelineApiBaseUrl}/api/v2/voice/sessions";
        using var response = await httpClient.PostAsync(endpoint, content, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "Voice session bootstrap failed. status={StatusCode}",
                (int)response.StatusCode);
            return null;
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        var session = System.Text.Json.JsonSerializer.Deserialize<LlmPipelineVoiceSession>(body, PipelineJsonOptions);

        if (session is null ||
            string.IsNullOrWhiteSpace(session.RoomName) ||
            string.IsNullOrWhiteSpace(session.ClientToken) ||
            !string.Equals(session.ConversationId, conversationId.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Voice session bootstrap returned an invalid response.");
            return null;
        }

        return new VoiceSessionDto
        {
            RoomName = session.RoomName,
            ServerUrl = session.ServerUrl,
            ClientToken = session.ClientToken,
            ExpiresIn = session.ExpiresIn,
            ConversationId = session.ConversationId,
            AgentName = session.AgentName,
            Mode = session.Mode,
            NoiseCancellation = settings.NoiseCancellation,
        };
    }

    private sealed class LlmPipelineVoiceSession
    {
        [JsonPropertyName("room_name")]
        public string RoomName { get; init; } = string.Empty;

        [JsonPropertyName("server_url")]
        public string ServerUrl { get; init; } = string.Empty;

        [JsonPropertyName("client_token")]
        public string ClientToken { get; init; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; init; }

        [JsonPropertyName("conversation_id")]
        public string ConversationId { get; init; } = string.Empty;

        [JsonPropertyName("agent_name")]
        public string AgentName { get; init; } = string.Empty;

        [JsonPropertyName("mode")]
        public string Mode { get; init; } = "live";
    }
}
