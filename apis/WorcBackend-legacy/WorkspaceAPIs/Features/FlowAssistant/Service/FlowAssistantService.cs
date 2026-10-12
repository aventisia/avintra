using System.Net;
using WorkspaceAPIs.Features.FlowAssistant.Constants;
using WorkspaceAPIs.Features.FlowAssistant.DTOs;
using WorkspaceAPIs.Features.FlowAssistant.Helpers;

using JsonException = System.Text.Json.JsonException;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace WorkspaceAPIs.Features.FlowAssistant.Service;

/// <summary>
/// Resolves the Agent flow, calls the LLM pipeline, and relays graph proposals as SSE frames.
/// </summary>
public class FlowAssistantService : IFlowAssistantService
{
    private readonly ILogger<FlowAssistantService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IResourceShareService _resourceShareService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly string _accessToken;

    public FlowAssistantService(
        ILogger<FlowAssistantService> logger,
        IUnitOfWork unitOfWork,
        IResourceShareService resourceShareService,
        EnvironmentConfig environmentConfig,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _resourceShareService = resourceShareService;
        _environmentConfig = environmentConfig;

        _userId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid"), out var userId)
            ? userId
            : Guid.Empty;

        _accessToken = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? string.Empty;
    }

    /// <summary>
    /// Streams normalized flow-assistant frames for an Agent flow.
    /// </summary>
    public async IAsyncEnumerable<string> StreamFlowAssistantAsync(
        FlowAssistantRequestDto request,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken)
    {
        request.GraphContext ??= new FlowAssistantGraphContextDto();

        var (flowVersion, resolutionError) = await ResolveAgentFlowAsync(request.FlowVersionId, cancellationToken);
        if (flowVersion is null)
        {
            yield return SerializeFrame(new { type = "error", message = resolutionError });
            yield break;
        }

        var graphError = ValidateGraphSize(request.GraphContext);
        if (graphError is not null)
        {
            yield return SerializeFrame(new { type = "error", message = graphError });
            yield break;
        }

        yield return SerializeFrame(new { type = "delta", output = "Generating a proposal for your flow…" });

        var (proposal, pipelineError) = await RequestProposalAsync(request, flowVersion, cancellationToken);
        if (proposal is null)
        {
            yield return SerializeFrame(new { type = "error", message = pipelineError });
            yield break;
        }

        var validationError = FlowAssistantProposalValidator.Validate(proposal.Value, request.GraphContext);
        if (validationError is not null)
        {
            yield return SerializeFrame(new { type = "error", message = validationError });
            yield break;
        }

        yield return SerializeFrame(new { type = "graph_proposal", output = proposal.Value });
        yield return SerializeFrame(new { type = "done" });
    }

    private async Task<(WorkspaceAPIs.Entities.FlowVersion? FlowVersion, string? Error)> ResolveAgentFlowAsync(
        Guid flowVersionId,
        CancellationToken cancellationToken)
    {
        var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(version => version.Id == flowVersionId)
            .Include(version => version.Flow)
            .IgnoreQueryFilters()
            .AsNoTracking()
            .SingleOrDefaultAsync(cancellationToken);

        if (flowVersion?.Flow is null)
            return (null, "Flow version not found.");

        if (flowVersion.Flow.Type != FlowTypesEnum.Agent)
            return (null, "The flow assistant only supports Agent flows.");

        var (hasAccess, _) = await _resourceShareService.GetResourceAccessAsync(
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
            _logger.LogWarning(
                "[FlowAssistant] Access denied. FlowVersionId={FlowVersionId}, UserId={UserId}",
                flowVersionId,
                _userId);
            return (null, "You do not have access to this flow.");
        }

        return (flowVersion, null);
    }

    private static string? ValidateGraphSize(FlowAssistantGraphContextDto graph)
    {
        if (graph.Nodes.Count > FlowAssistantConstants.MaxGraphNodes)
            return $"This flow has too many nodes for the assistant (max {FlowAssistantConstants.MaxGraphNodes}).";

        if (graph.Edges.Count > FlowAssistantConstants.MaxGraphEdges)
            return $"This flow has too many connections for the assistant (max {FlowAssistantConstants.MaxGraphEdges}).";

        return null;
    }

    private async Task<(JsonElement? Proposal, string? Error)> RequestProposalAsync(
        FlowAssistantRequestDto request,
        WorkspaceAPIs.Entities.FlowVersion flowVersion,
        CancellationToken cancellationToken)
    {
        var payload = BuildLlmPayload(request, flowVersion);
        var endpoint = $"{_environmentConfig.LlmPipelineApiBaseUrl}/api/v2/llm/generate";
        var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var httpClient = new HttpClient(new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator,
        });
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        httpClient.Timeout = Timeout.InfiniteTimeSpan;

        var flowSpaceId = flowVersion.Flow?.SpaceId;
        if (flowSpaceId.HasValue && flowSpaceId.Value != Guid.Empty)
            httpClient.DefaultRequestHeaders.Add("X-Space-Id", flowSpaceId.Value.ToString());

        httpClient.DefaultRequestHeaders.Add("X-Env-Type", flowVersion.IsPublished ? "prod" : "dev");

        HttpResponseMessage response;
        try
        {
            response = await httpClient.PostAsync(endpoint, jsonContent, cancellationToken);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            _logger.LogError(ex, "[FlowAssistant] llmpipeline request failed.");
            return (null, "The assistant could not reach the language model.");
        }

        using (response)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "[FlowAssistant] llmpipeline returned {Status}. Body={Body}",
                    response.StatusCode,
                    body);

                return (null, response.StatusCode == HttpStatusCode.Unauthorized
                    ? "The assistant is not authorized to use the language model."
                    : "The assistant could not reach the language model.");
            }

            using var document = JsonDocument.Parse(body);
            var root = document.RootElement;

            if (root.TryGetProperty("error", out var errorElement) && errorElement.ValueKind == JsonValueKind.String)
                return (null, errorElement.GetString());

            if (root.TryGetProperty("status", out var statusElement) &&
                statusElement.ValueKind == JsonValueKind.String &&
                string.Equals(statusElement.GetString(), "failed", StringComparison.OrdinalIgnoreCase))
                return (null, "The language model could not generate a proposal.");

            if (!root.TryGetProperty("output", out var outputElement))
                return (null, "The language model returned no output.");

            if (outputElement.ValueKind == JsonValueKind.String)
            {
                var outputText = outputElement.GetString();
                if (string.IsNullOrWhiteSpace(outputText))
                    return (null, "The language model returned no output.");

                try
                {
                    using var proposalDocument = JsonDocument.Parse(outputText);
                    return (proposalDocument.RootElement.Clone(), null);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "[FlowAssistant] Model output was not valid JSON.");
                    return (null, "The language model returned an invalid proposal.");
                }
            }

            if (outputElement.ValueKind == JsonValueKind.Object)
                return (outputElement.Clone(), null);

            return (null, "The language model returned an invalid proposal.");
        }
    }

    private static object BuildLlmPayload(FlowAssistantRequestDto request, WorkspaceAPIs.Entities.FlowVersion flowVersion)
    {
        var messages = new List<object>
        {
            new { role = "system", content = BuildSystemMessage(request.GraphContext) },
        };

        if (request.ThreadMessages is { Count: > 0 })
        {
            foreach (var message in request.ThreadMessages)
            {
                if (string.IsNullOrWhiteSpace(message.Role) || string.IsNullOrWhiteSpace(message.Content))
                    continue;

                messages.Add(new { role = message.Role, content = message.Content });
            }
        }

        if (!string.IsNullOrWhiteSpace(request.UserInput))
            messages.Add(new { role = "user", content = request.UserInput });

        return new
        {
            provider = FlowAssistantConstants.Provider,
            model = FlowAssistantConstants.Model,
            input = messages,
            is_json_output = true,
            json_schema = FlowAssistantConstants.ProposalJsonSchema,
            max_output_tokens = FlowAssistantConstants.MaxOutputTokens,
            temperature = FlowAssistantConstants.Temperature,
            top_p = FlowAssistantConstants.TopP,
            stream = false,
            is_byok_enabled = false,
            ref_type = "Flow",
            ref_id = flowVersion.FlowId.ToString(),
            ref_name = flowVersion.Flow?.Name ?? string.Empty,
            action = "FlowAssistantGenerate",
            agent_name = flowVersion.Flow?.Name,
        };
    }

    private static string BuildSystemMessage(FlowAssistantGraphContextDto graph)
    {
        var summary = JsonSerializer.Serialize(new
        {
            nodes = graph.Nodes.Select(node => new
            {
                id = ReadString(node, "id"),
                type = ReadString(node, "type"),
                name = ReadNestedString(node, "data", "name"),
            }),
            edges = graph.Edges.Select(edge => new
            {
                id = ReadString(edge, "id"),
                source = ReadString(edge, "source"),
                target = ReadString(edge, "target"),
            }),
        });

        return $"{FlowAssistantConstants.SystemPrompt}\n\nCurrent flow graph:\n{summary}";
    }

    private static string? ReadString(JsonElement element, string propertyName) =>
        element.ValueKind == JsonValueKind.Object &&
        element.TryGetProperty(propertyName, out var property) &&
        property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;

    private static string? ReadNestedString(JsonElement element, string parentName, string propertyName) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(parentName, out var parent)
            ? ReadString(parent, propertyName)
            : null;

    private static string SerializeFrame(object payload) => $"data: {JsonSerializer.Serialize(payload)}\n\n";
}
