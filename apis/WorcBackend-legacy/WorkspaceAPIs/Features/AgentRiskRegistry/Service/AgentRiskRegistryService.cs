using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;
using WorkspaceAPIs.Entities;

namespace WorkspaceAPIs.Services;

public class AgentRiskRegistryService : IAgentRiskRegistryService
{
    private readonly ILogger<AgentRiskRegistryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly INotificationService _notificationService;
    private readonly TenantDbContext _tenantDbContext;
    private readonly Guid _userId;

    public AgentRiskRegistryService(
        ILogger<AgentRiskRegistryService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        INotificationService notificationService,
        TenantDbContext tenantDbContext)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _notificationService = notificationService;
        _tenantDbContext = tenantDbContext;
    }

    public async Task<ServiceResponse<IEnumerable<AgentRiskRegistryRowDto>>> GetAllRowsAsync()
    {
        var response = new ServiceResponse<IEnumerable<AgentRiskRegistryRowDto>>
        {
            Data = null,
            Message = "Unable to retrieve agent risk registry rows.",
        };

        try
        {
            var records = await _unitOfWork.AgentRiskRegistryRepo.GetAllAsync().ToListAsync();

            response.Data = records.Select(MapRow).ToList();
            response.StatusCode = 200;
            response.Message = "Agent risk registry rows retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred in GetAllRowsAsync.");
        }

        return response;
    }

    public async Task<ServiceResponse<IEnumerable<AgentRiskRegistryRowDto>>> GetPendingApprovalsAsync()
    {
        var response = new ServiceResponse<IEnumerable<AgentRiskRegistryRowDto>>
        {
            Data = null,
            Message = "Unable to retrieve pending approvals.",
        };

        try
        {
            var records = await _unitOfWork.AgentRiskRegistryRepo.GetAllAsync().ToListAsync();

            response.Data = records
                .Where(r =>
                {
                    var approval = Deserialize<ApprovalStateDto>(r.ApprovalJson) ?? new ApprovalStateDto();
                    return approval.IsSubmitted &&
                           string.Equals(approval.Decision, "pending", StringComparison.OrdinalIgnoreCase) &&
                           ParseGuid(approval.RequestedToUserId) == _userId;
                })
                .Select(r => MapRow(r))
                .ToList();
            response.StatusCode = 200;
            response.Message = "Pending approvals retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred in GetPendingApprovalsAsync.");
        }

        return response;
    }

    /// <summary>
    /// Maps an entity to a registry table row DTO.
    /// </summary>
    private static AgentRiskRegistryRowDto MapRow(AgentRiskRegistry r)
    {
        var issues = Deserialize<List<AgentRiskIssueDto>>(r.IssuesJson);
        var openIssues = issues.Count(i =>
            !string.IsNullOrEmpty(i.Status) &&
            (i.Status.Equals("open", StringComparison.OrdinalIgnoreCase) ||
             i.Status.Equals("investigating", StringComparison.OrdinalIgnoreCase)));

        var approval = Deserialize<ApprovalStateDto>(r.ApprovalJson) ?? new ApprovalStateDto();

        return new AgentRiskRegistryRowDto
        {
            FlowVersionId = r.FlowVersionId,
            FlowId = r.FlowId,
            Name = r.AgentName,
            CompositeTier = r.CompositeTier,
            Status = r.Status,
            OpenIssues = openIssues,
            ReviewDate = ParseIsoDate(approval.RequestedOn),
            ApprovalDate = ParseIsoDate(approval.DecidedOn),
        };
    }

    public async Task<ServiceResponse<AgentRiskRegistryDto>> GetByFlowVersionAsync(Guid flowVersionId)
    {
        var response = new ServiceResponse<AgentRiskRegistryDto>
        {
            Data = null,
            Message = "Unable to retrieve agent risk registry record.",
        };

        try
        {
            var record = await _unitOfWork.AgentRiskRegistryRepo
                .GetByConditionAsync(w => w.FlowVersionId == flowVersionId)
                .FirstOrDefaultAsync();

            if (record == null)
            {
                // No saved record yet — resolve the agent identity and dependency
                // lists live from the flow config so the wizard can show the AI
                // models / tools before the first save.
                var flowVersion = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == flowVersionId)
                    .Include(fv => fv.Flow)
                    .FirstOrDefaultAsync();

                if (flowVersion == null)
                {
                    response.StatusCode = 404;
                    response.Message = "No agent risk registry record found for this agent.";
                    return response;
                }

                var (aiModels, tools, skills, knowledgeBases) = ResolveDependencies(flowVersion.ReactFlowObject);

                response.Data = new AgentRiskRegistryDto
                {
                    Id = Guid.Empty,
                    FlowVersionId = flowVersionId,
                    FlowId = flowVersion.FlowId,
                    AgentName = flowVersion.Flow?.Name,
                    AgentType = flowVersion.Flow?.Type.ToString(),
                    VersionNumber = flowVersion.VersionNumber,
                    CompositeTier = AgentRiskTierEnum.Low,
                    Status = AgentRiskLifecycleStatusEnum.NotAssessed,
                    AiModels = aiModels,
                    ThirdPartyTools = tools,
                    Skills = skills,
                    KnowledgeBases = knowledgeBases,
                    Risks = new List<RiskRegisterRowDto>(),
                    Approval = new ApprovalStateDto(),
                    Issues = new List<AgentRiskIssueDto>(),
                };
                response.StatusCode = 200;
                response.Message = "Agent risk registry record retrieved successfully.";
                return response;
            }

            response.Data = ToDto(record);
            response.StatusCode = 200;
            response.Message = "Agent risk registry record retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred in GetByFlowVersionAsync.");
        }

        return response;
    }

    public async Task<ServiceResponse<AgentRiskRegistryDto>> UpsertAsync(AgentRiskRegistryUpsertDto dto)
    {
        var response = new ServiceResponse<AgentRiskRegistryDto>
        {
            Data = null,
            Message = "Unable to save the agent risk registry record.",
        };

        try
        {
            // Resolve the agent identity + dependency lists from the flow config.
            var (flowVersion, flow) = await LoadFlowAsync(dto.FlowVersionId, dto.FlowId);
            var (aiModels, tools, skills, knowledgeBases) = ResolveDependencies(flowVersion?.ReactFlowObject);

            var record = await _unitOfWork.AgentRiskRegistryRepo
                .GetByConditionAsync(w => w.FlowVersionId == dto.FlowVersionId)
                .FirstOrDefaultAsync();

            if (record == null)
            {
                record = new AgentRiskRegistry
                {
                    Id = Guid.NewGuid(),
                    FlowVersionId = dto.FlowVersionId,
                    FlowId = dto.FlowId,
                    AgentName = flow?.Name,
                    AgentType = flow?.Type.ToString(),
                    VersionNumber = flowVersion?.VersionNumber ?? 0,
                    CreatedByUserId = _userId,
                };
                await _unitOfWork.AgentRiskRegistryRepo.InsertAsync(record);
            }

            // Capture the previously persisted approval state BEFORE it is overwritten.
            var priorApproval = Deserialize<ApprovalStateDto>(record.ApprovalJson) ?? new ApprovalStateDto();

            // Apply all other human-input fields.
            ApplyHumanInput(record, dto);

            // Merge human-entered assessment fields onto the resolved model/tool lists.
            MergeModelAssessments(aiModels, dto.AiModels);
            MergeToolAssessments(tools, dto.ThirdPartyTools);

            // Persist backend-resolved dependency lists.
            record.AiModelsJson = System.Text.Json.JsonSerializer.Serialize(aiModels);
            record.ThirdPartyToolsJson = System.Text.Json.JsonSerializer.Serialize(tools);
            record.SkillsJson = System.Text.Json.JsonSerializer.Serialize(skills);
            record.KnowledgeBasesJson = System.Text.Json.JsonSerializer.Serialize(knowledgeBases);

            // Compute the composite tier from the sub-scores.
            record.CompositeTier = ComputeTier(record);

            record.LastModifiedByUserId = _userId;
            record.LastModifiedOn = DateTimeOffset.UtcNow;

            // Enforce the approval workflow guard before saving.
            var approval = dto.Approval ?? new ApprovalStateDto();
            var (canApprove, guardMessage) = await EnforceApprovalDecisionAsync(priorApproval, approval);
            if (!canApprove)
            {
                response.StatusCode = 403;
                response.Message = guardMessage;
                return response;
            }
            // Persist the (possibly server-authoritative) approval state.
            record.ApprovalJson = System.Text.Json.JsonSerializer.Serialize(approval);

            await _unitOfWork.SaveAsync();

            // Notify the designated approver when the assessment is newly submitted.
            await NotifyApproverOnSubmissionAsync(record, priorApproval, approval);

            response.Data = ToDto(record);
            response.StatusCode = 200;
            response.Message = "Agent risk registry record saved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred in UpsertAsync.");
        }

        return response;
    }

    /// <summary>
    /// Enforces the approval authorization guard. Only the designated approver may
    /// make a decision (approve/reject/returned); the decided-by identity is set
    /// server-authoritatively from the authenticated user rather than trusting the
    /// client-supplied name.
    /// </summary>
    /// <returns>True when the decision is allowed, false otherwise.</returns>
    private async Task<(bool allowed, string message)> EnforceApprovalDecisionAsync(ApprovalStateDto priorApproval, ApprovalStateDto approval)
    {
        var incomingDecisionChanged = !string.Equals(approval.Decision, priorApproval.Decision, StringComparison.OrdinalIgnoreCase);

        // Only enforce when an actual decision (non-pending) transition is attempted.
        if (string.Equals(approval.Decision, "pending", StringComparison.OrdinalIgnoreCase) || !incomingDecisionChanged)
        {
            return (true, string.Empty);
        }

        // Resolve the designated approver id from the submitted state.
        var approverId = ParseGuid(approval.RequestedToUserId);
        if (approverId == Guid.Empty || approverId != _userId)
        {
            return (false, "Only the designated approver can make an approval decision.");
        }

        // Server-authoritative: stamp the actual authenticated user as the decision maker.
        approval.DecidedByUserId = _userId;
        approval.DecidedBy = await GetUserDisplayNameAsync(_userId);
        approval.DecidedOn = DateTimeOffset.UtcNow.ToString("o");

        return (true, string.Empty);
    }

    /// <summary>
    /// Sends an in-app notification to the designated approver when an assessment
    /// transitions to submitted for the first time. Gated by the tenant's
    /// "Agent Risk Assessment Approval" notification setting (enabled by default).
    /// </summary>
    private async Task NotifyApproverOnSubmissionAsync(AgentRiskRegistry record, ApprovalStateDto priorApproval, ApprovalStateDto approval)
    {
        if (!approval.IsSubmitted || string.IsNullOrWhiteSpace(approval.RequestedToUserId)) return;
        if (priorApproval.IsSubmitted) return;

        var approverId = ParseGuid(approval.RequestedToUserId);
        if (approverId == Guid.Empty) return;

        try
        {
            // Respect the tenant-level enable/disable for this notification type.
            var enabled = await IsNotificationAgentRiskApprovalEnabledAsync();
            if (!enabled) return;

            var agentName = record.AgentName ?? "Agent";
            var createNotification = new CreateNotificationDto
            {
                Title = "Agent Risk Review",
                Message = $"A risk assessment for '{agentName}' is pending your approval.",
                Type = NotificationTypesEnum.Information,
                DeliveryChannel = DeliveryChannelEnum.Platform,
                AudienceScope = AudienceScopeEnum.SelectedUsers,
                TargetUserIds = new List<Guid> { approverId },
            };
            await _notificationService.InsertNotificationAsync(createNotification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify approver for agent risk assessment {FlowVersionId}", record.FlowVersionId);
        }
    }

    /// <summary>
    /// Returns whether the tenant's "Agent Risk Assessment Approval" notification is
    /// enabled. Defaults to true when no settings are stored.
    /// </summary>
    private async Task<bool> IsNotificationAgentRiskApprovalEnabledAsync()
    {
        try
        {
            var tenant = await _tenantDbContext.ReadOnlyTenants
                .Where(t => t.Id == _currentTenantService.CurrentTenantId)
                .Select(t => t.NotificationSettings)
                .SingleOrDefaultAsync();

            return tenant?.AgentRiskAssessmentApproval ?? new NotificationSettings().AgentRiskAssessmentApproval;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read agent risk approval notification setting; defaulting to enabled.");
            return new NotificationSettings().AgentRiskAssessmentApproval;
        }
    }


    /// <summary>
    /// Parses a string into a Guid, returning Guid.Empty when invalid.
    /// </summary>
    private static Guid ParseGuid(string? value)
    {
        return Guid.TryParse(value, out var parsed) ? parsed : Guid.Empty;
    }

    /// <summary>
    /// Resolves the display name for a workspace user, or null when not found.
    /// </summary>
    private async Task<string?> GetUserDisplayNameAsync(Guid userId)
    {
        try
        {
            var user = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => w.Id == userId)
                .Select(s => new { s.FirstName, s.LastName })
                .SingleOrDefaultAsync();
            return user == null ? null : $"{user.FirstName} {user.LastName}".Trim();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving display name for user {UserId}", userId);
            return null;
        }
    }

    /// <summary>
    /// Loads the flow version + flow for a given agent.
    /// </summary>
    private async Task<(FlowVersion?, Flow?)> LoadFlowAsync(Guid flowVersionId, Guid flowId)
    {
        var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w => w.Id == flowVersionId && w.FlowId == flowId)
            .Include(fv => fv.Flow)
            .FirstOrDefaultAsync();
        return (flowVersion, flowVersion?.Flow);
    }

    /// <summary>
    /// Parses the flow's ReactFlowObject and resolves the AI models and
    /// third-party tools (plus skills / knowledge bases) the agent depends on.
    /// Each model is enriched with its node name and the KBs/skills/tools linked
    /// to the same node.
    /// </summary>
    private (List<AiModelDto>, List<ThirdPartyToolDto>, List<string>, List<string>) ResolveDependencies(string? reactFlowObject)
    {
        var aiModels = new List<AiModelDto>();
        var tools = new List<ThirdPartyToolDto>();
        var skills = new List<string>();
        var knowledgeBases = new List<string>();

        var flow = ReactFlowHelper.Parse(reactFlowObject);
        if (flow?.Nodes is null) return (aiModels, tools, skills, knowledgeBases);

        foreach (var node in flow.Nodes)
        {
            if (node.Data?.Inputs is null) continue;

            var configObj = new JsonObject();
            foreach (var input in node.Data.Inputs)
            {
                if (string.IsNullOrWhiteSpace(input.Key) || input.Value is null) continue;
                configObj[input.Key] = input.Value is JsonElement je
                    ? JsonNode.Parse(je.GetRawText())
                    : JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(input.Value));
            }

            // Per-node linked context (KBs, skills, tools) for the model rows.
            var nodeKbs = new List<string>();
            var nodeSkills = new List<string>();
            var nodeTools = new List<string>();

            // Tools: __ToolsConfig__* -> array of { tool, credential_name, actions }
            foreach (var kvp in configObj)
            {
                if (!kvp.Key.Contains("__ToolsConfig__") || kvp.Value is not JsonArray toolsArr) continue;
                foreach (var item in toolsArr)
                {
                    if (item is not JsonObject toolObj) continue;
                    var toolName = toolObj.TryGetPropertyValue("tool", out var tn) ? tn?.ToString() : null;
                    if (string.IsNullOrWhiteSpace(toolName)) continue;
                    var credential = toolObj.TryGetPropertyValue("credential_name", out var cn) ? cn?.ToString() : null;
                    var actions = "";
                    if (toolObj.TryGetPropertyValue("actions", out var an) && an is JsonArray actionArr)
                        actions = string.Join(", ", actionArr.Where(x => x is not null).Select(x => x!.ToString()));
                    tools.Add(new ThirdPartyToolDto { Tool = toolName, CredentialName = credential, Actions = actions });
                    if (!nodeTools.Contains(toolName)) nodeTools.Add(toolName);
                }
            }

            // Skills: __SkillsConfig__* -> skills[]
            foreach (var kvp in configObj)
            {
                if (!kvp.Key.Contains("__SkillsConfig__") || kvp.Value is not JsonObject sc) continue;
                if (sc.TryGetPropertyValue("skills", out var sn) && sn is JsonArray skillsArr)
                    foreach (var name in skillsArr.Where(x => x is not null))
                    {
                        var s = name!.ToString();
                        if (!skills.Contains(s)) skills.Add(s);
                        if (!nodeSkills.Contains(s)) nodeSkills.Add(s);
                    }
            }

            // Knowledge bases: __KbConfig__* -> knowledgeBase[]
            foreach (var kvp in configObj)
            {
                if (!kvp.Key.Contains("__KbConfig__") || kvp.Value is not JsonObject kb) continue;
                if (kb.TryGetPropertyValue("knowledgeBase", out var kbNode) && kbNode is JsonArray kbArr)
                    foreach (var name in kbArr.Where(x => x is not null))
                    {
                        var k = name!.ToString();
                        if (!knowledgeBases.Contains(k)) knowledgeBases.Add(k);
                        if (!nodeKbs.Contains(k)) nodeKbs.Add(k);
                    }
            }

            // AI models: __ModelConfig__* -> { provider, model, credential_name, is_byok_enabled }
            var nodeName = string.IsNullOrWhiteSpace(node.Data.Name) ? node.Data.Label : node.Data.Name;
            foreach (var kvp in configObj)
            {
                if (!kvp.Key.Contains("__ModelConfig__") || kvp.Value is not JsonObject mc) continue;
                aiModels.Add(new AiModelDto
                {
                    Provider = mc.TryGetPropertyValue("provider", out var p) ? p?.ToString() : null,
                    Model = mc.TryGetPropertyValue("model", out var m) ? m?.ToString() : null,
                    CredentialName = mc.TryGetPropertyValue("credential_name", out var c) ? c?.ToString() : null,
                    IsByokEnabled = mc.TryGetPropertyValue("is_byok_enabled", out var b) && b?.GetValue<bool>() == true,
                    NodeName = nodeName,
                    ModelType = ResolveModelType(kvp.Key),
                    LinkedKnowledgeBases = nodeKbs,
                    LinkedSkills = nodeSkills,
                    LinkedTools = nodeTools,
                    RiskRating = "low",
                });
            }
        }

        return (aiModels, tools, skills, knowledgeBases);
    }

    /// <summary>
    /// Derives the model type from the config key suffix, e.g.
    /// `__ModelConfig__Conversation` -> conversation, `__ModelConfig__Inferencing`
    /// -> inferencing. Speech-to-text / text-to-speech are treated as generative.
    /// </summary>
    private static string? ResolveModelType(string configKey)
    {
        var idx = configKey.IndexOf("__ModelConfig__", StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        var suffix = configKey[(idx + "__ModelConfig__".Length)..].Trim();

        if (suffix.Equals("Conversation", StringComparison.OrdinalIgnoreCase)) return "conversation";
        if (suffix.Equals("Inferencing", StringComparison.OrdinalIgnoreCase)) return "inferencing";
        if (suffix.Equals("SpeechToText", StringComparison.OrdinalIgnoreCase)) return "generative";
        if (suffix.Equals("TextToSpeech", StringComparison.OrdinalIgnoreCase)) return "generative";
        return null;
    }

    /// <summary>
    /// Copies human-input fields onto the entity. The risk register rows and the
    /// human-input overrides for models/tools are merged onto the resolved lists.
    /// </summary>
    private void ApplyHumanInput(AgentRiskRegistry record, AgentRiskRegistryUpsertDto dto)
    {
        record.IsConsumerFacing = dto.IsConsumerFacing;
        record.IntendedUse = dto.IntendedUse;
        record.BusinessProcesses = dto.BusinessProcesses;
        record.ScopeScore = dto.ScopeScore;
        record.DataSensitivityScore = dto.DataSensitivityScore;
        record.DependencyComplexityScore = dto.DependencyComplexityScore;
        record.SupervisoryImpactScore = dto.SupervisoryImpactScore;
        record.TierJustification = dto.TierJustification;
        record.Status = dto.Status;
        record.LastValidationDate = dto.LastValidationDate;
        record.NextReviewDate = dto.NextReviewDate;
        record.ValidatorUserId = dto.ValidatorUserId;
        record.RisksJson = System.Text.Json.JsonSerializer.Serialize(dto.Risks);
        record.IssuesJson = System.Text.Json.JsonSerializer.Serialize(dto.Issues ?? new List<AgentRiskIssueDto>());
    }

    /// <summary>
    /// Merges human-entered assessment fields from the submitted models onto the
    /// backend-resolved list (matched by provider + model). The resolved list is
    /// authoritative for identity; human fields are preserved across saves.
    /// </summary>
    private static void MergeModelAssessments(List<AiModelDto> resolved, List<AiModelDto> submitted)
    {
        foreach (var sub in submitted)
        {
            var target = resolved.FirstOrDefault(m =>
                string.Equals(m.Provider, sub.Provider, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(m.Model, sub.Model, StringComparison.OrdinalIgnoreCase));
            if (target is null) continue;

            target.RiskRating = sub.RiskRating;
            target.ModelType = sub.ModelType;
            target.OutputConsumedBy = sub.OutputConsumedBy;
            target.MonitoringPlan = sub.MonitoringPlan;
            target.UsageRestrictions = sub.UsageRestrictions;
            target.Risks = sub.Risks;
            target.Mitigations = sub.Mitigations;
        }
    }

    /// <summary>
    /// Merges human-entered due-diligence fields onto the resolved tool list
    /// (matched by tool name).
    /// </summary>
    private static void MergeToolAssessments(List<ThirdPartyToolDto> resolved, List<ThirdPartyToolDto> submitted)
    {
        foreach (var sub in submitted)
        {
            var target = resolved.FirstOrDefault(t =>
                string.Equals(t.Tool, sub.Tool, StringComparison.OrdinalIgnoreCase));
            if (target is null) continue;

            target.IsDueDiligenceCompleted = sub.IsDueDiligenceCompleted;
            target.DueDiligenceStatus = sub.DueDiligenceStatus;
            target.Risks = sub.Risks;
            target.Mitigations = sub.Mitigations;
        }
    }

    /// <summary>
    /// Computes the composite tier as the MAX of the four sub-scores (no dilution).
    /// Scores are 1-5; a sub-score of 4+ is High, 3 is Medium, otherwise Low.
    /// </summary>
    private AgentRiskTierEnum ComputeTier(AgentRiskRegistry record)
    {
        var maxScore = Math.Max(record.ScopeScore, Math.Max(record.DataSensitivityScore,
            Math.Max(record.DependencyComplexityScore, record.SupervisoryImpactScore)));

        if (maxScore >= 4) return AgentRiskTierEnum.High;
        if (maxScore >= 3) return AgentRiskTierEnum.Medium;
        return AgentRiskTierEnum.Low;
    }

    /// <summary>
    /// Maps an entity to its DTO.
    /// </summary>
    private AgentRiskRegistryDto ToDto(AgentRiskRegistry record)
    {
        return new AgentRiskRegistryDto
        {
            Id = record.Id,
            FlowVersionId = record.FlowVersionId,
            FlowId = record.FlowId,
            AgentName = record.AgentName,
            AgentType = record.AgentType,
            VersionNumber = record.VersionNumber,
            IsConsumerFacing = record.IsConsumerFacing,
            IntendedUse = record.IntendedUse,
            BusinessProcesses = record.BusinessProcesses,
            ScopeScore = record.ScopeScore,
            DataSensitivityScore = record.DataSensitivityScore,
            DependencyComplexityScore = record.DependencyComplexityScore,
            SupervisoryImpactScore = record.SupervisoryImpactScore,
            CompositeTier = record.CompositeTier,
            TierJustification = record.TierJustification,
            Status = record.Status,
            LastValidationDate = record.LastValidationDate,
            NextReviewDate = record.NextReviewDate,
            ValidatorUserId = record.ValidatorUserId,
            AiModels = Deserialize<List<AiModelDto>>(record.AiModelsJson),
            ThirdPartyTools = Deserialize<List<ThirdPartyToolDto>>(record.ThirdPartyToolsJson),
            Skills = Deserialize<List<string>>(record.SkillsJson),
            KnowledgeBases = Deserialize<List<string>>(record.KnowledgeBasesJson),
            Risks = Deserialize<List<RiskRegisterRowDto>>(record.RisksJson),
            Approval = Deserialize<ApprovalStateDto>(record.ApprovalJson) ?? new ApprovalStateDto(),
            CanApprove = CanCurrentUserApprove(record),
            Issues = Deserialize<List<AgentRiskIssueDto>>(record.IssuesJson),
        };
    }

    /// <summary>
    /// Returns true when the current user is the designated approver for a pending
    /// submission and may approve/reject it.
    /// </summary>
    private bool CanCurrentUserApprove(AgentRiskRegistry record)
    {
        var approval = Deserialize<ApprovalStateDto>(record.ApprovalJson) ?? new ApprovalStateDto();
        if (!approval.IsSubmitted) return false;
        if (!string.Equals(approval.Decision, "pending", StringComparison.OrdinalIgnoreCase)) return false;

        var approverId = ParseGuid(approval.RequestedToUserId);
        return approverId != Guid.Empty && approverId == _userId;
    }

    private static T Deserialize<T>(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return System.Text.Json.JsonSerializer.Deserialize<T>("[]") ?? default!;
        return System.Text.Json.JsonSerializer.Deserialize<T>(json) ?? default!;
    }

    /// <summary>
    /// Parses an ISO-8601 date string into a DateTimeOffset, or null if invalid/empty.
    /// </summary>
    private static DateTimeOffset? ParseIsoDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return DateTimeOffset.TryParse(value, out var parsed) ? parsed : (DateTimeOffset?)null;
    }
}
