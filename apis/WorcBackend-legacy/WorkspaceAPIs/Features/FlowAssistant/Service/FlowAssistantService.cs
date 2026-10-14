using System.Net;
using WorkspaceAPIs.Features.FlowAssistant.Constants;
using WorkspaceAPIs.Features.FlowAssistant.DTOs;
using WorkspaceAPIs.Features.FlowAssistant.Generated;
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

        var candidates = ResolveCandidateNodeNames(request);

        var (discovery, discoveryError) = await RequestDiscoveryAsync(request, flowVersion, candidates, cancellationToken);
        if (discovery is null)
        {
            yield return SerializeFrame(new { type = "error", message = discoveryError });
            yield break;
        }

        if (TryGetQuestion(discovery.Value, out var discoveryQuestion))
        {
            yield return SerializeFrame(new { type = "question", output = discoveryQuestion });
            yield return SerializeFrame(new { type = "done" });
            yield break;
        }

        var selected = ResolveSelectedNodeNames(discovery.Value, request);

        var (proposal, pipelineError) = await RequestBuilderProposalAsync(request, flowVersion, selected, cancellationToken);
        if (proposal is null)
        {
            yield return SerializeFrame(new { type = "error", message = pipelineError });
            yield break;
        }

        proposal = FlowAssistantProposalNormalizer.Normalize(proposal.Value);

        if (TryGetQuestion(proposal.Value, out var question))
        {
            yield return SerializeFrame(new { type = "question", output = question });
            yield return SerializeFrame(new { type = "done" });
            yield break;
        }

        if ((TryGetKind(proposal.Value, out var kind) && kind == "question" && string.IsNullOrWhiteSpace(question)) ||
            HasNoOperations(proposal.Value))
        {
            yield return SerializeFrame(new
            {
                type = "question",
                output = "I couldn't build that flow yet. Which actions should it include, and what inputs should they use?",
            });
            yield return SerializeFrame(new { type = "done" });
            yield break;
        }

        var configurationQuestion = BuildConfigurationQuestion(proposal.Value);
        if (configurationQuestion is not null)
        {
            yield return SerializeFrame(new { type = "question", output = configurationQuestion });
            yield return SerializeFrame(new { type = "done" });
            yield break;
        }

        var validationError = FlowAssistantProposalValidator.Validate(proposal.Value, request.GraphContext);
        if (validationError is not null)
        {
            // IMPORTANT NOTE: the raw model output is only recoverable via this log.
            var rawJson = proposal.Value.GetRawText();
            var truncatedJson = rawJson.Length > 2000 ? rawJson[..2000] : rawJson;
            _logger.LogWarning(
                "[FlowAssistant] Proposal rejected by validation. FlowVersionId={FlowVersionId}, Reason={Reason}, ModelOutput={ModelOutput}",
                request.FlowVersionId,
                validationError,
                truncatedJson);
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

    private async Task<(JsonElement? Discovery, string? Error)> RequestDiscoveryAsync(
        FlowAssistantRequestDto request,
        WorkspaceAPIs.Entities.FlowVersion flowVersion,
        IReadOnlyCollection<string> candidates,
        CancellationToken cancellationToken)
    {
        var model = ResolveModel(request.ModelId);
        var systemMessage = $"{FlowAssistantConstants.BuildDiscoveryPrompt(candidates)}\n\nCurrent flow graph:\n{BuildGraphSummary(request)}";
        var schema = string.Equals(model.Provider, "openai", StringComparison.OrdinalIgnoreCase)
            ? FlowAssistantConstants.OpenAiDiscoveryJsonSchema
            : FlowAssistantConstants.DiscoveryJsonSchema;

        var discovery = await CallLlmAsync(request, flowVersion, model, systemMessage, schema, cancellationToken);

        if (discovery.Result is null)
            return (null, discovery.Error);

        if (TryGetQuestion(discovery.Result.Value, out _))
            return (discovery.Result, null);

        if (!TryGetDiscoveryNodes(discovery.Result.Value, out _))
        {
            _logger.LogWarning(
                "[FlowAssistant] Discovery returned no selectable nodes. FlowVersionId={FlowVersionId}",
                request.FlowVersionId);
            return (null, "The assistant could not identify the actions for this request.");
        }

        return (discovery.Result, null);
    }

    private async Task<(JsonElement? Proposal, string? Error)> RequestBuilderProposalAsync(
        FlowAssistantRequestDto request,
        WorkspaceAPIs.Entities.FlowVersion flowVersion,
        IReadOnlyCollection<string> selected,
        CancellationToken cancellationToken)
    {
        var model = ResolveModel(request.ModelId);
        var systemMessage = $"{FlowAssistantConstants.BuildBuilderPrompt(selected)}\n\nCurrent flow graph:\n{BuildGraphSummary(request)}{BuildReferenceSection(request.ReferenceData)}";
        var schema = ResolveJsonSchema(model);

        var result = await CallLlmAsync(request, flowVersion, model, systemMessage, schema, cancellationToken);
        return (result.Result, result.Error);
    }

    private async Task<(JsonElement? Result, string? Error)> CallLlmAsync(
        FlowAssistantRequestDto request,
        WorkspaceAPIs.Entities.FlowVersion flowVersion,
        FlowAssistantConstants.FlowAssistantModelOption model,
        string systemMessage,
        string jsonSchema,
        CancellationToken cancellationToken)
    {
        var payload = BuildLlmPayload(request, flowVersion, model, systemMessage, jsonSchema);
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

    private static object BuildLlmPayload(
        FlowAssistantRequestDto request,
        WorkspaceAPIs.Entities.FlowVersion flowVersion,
        FlowAssistantConstants.FlowAssistantModelOption model,
        string systemMessage,
        string jsonSchema)
    {
        var messages = new List<object>
        {
            new { role = "system", content = systemMessage },
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
            provider = model.Provider,
            model = model.Model,
            input = messages,
            is_json_output = true,
            json_schema = jsonSchema,
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

    private static FlowAssistantConstants.FlowAssistantModelOption ResolveModel(string? modelId) =>
        FlowAssistantConstants.SupportedModels.FirstOrDefault(
            option => string.Equals(option.Id, modelId, StringComparison.OrdinalIgnoreCase))
        ?? FlowAssistantConstants.SupportedModels.First(
            option => option.Id == FlowAssistantConstants.DefaultModelId);

    private static string ResolveJsonSchema(FlowAssistantConstants.FlowAssistantModelOption model)
    {
        // IMPORTANT NOTE: OpenAI structured outputs require an object at the schema root, so OpenAI uses a flattened proposal schema instead of the question/proposal union used by other providers.
        return string.Equals(model.Provider, "openai", StringComparison.OrdinalIgnoreCase)
            ? FlowAssistantConstants.OpenAiProposalJsonSchema
            : FlowAssistantConstants.ProposalJsonSchema;
    }

    private static string BuildGraphSummary(FlowAssistantRequestDto request)
    {
        var graph = request.GraphContext;
        return JsonSerializer.Serialize(new
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
            selectedNodeId = string.IsNullOrWhiteSpace(request.SelectedNodeId) ? null : request.SelectedNodeId,
            selectedNode = BuildSelectedNodeContext(request),
        });
    }

    private static IReadOnlyCollection<string> ResolveCandidateNodeNames(FlowAssistantRequestDto request)
    {
        var (queryParts, alwaysInclude) = CollectQueryParts(request);

        foreach (var baseline in FlowAssistantConstants.BaselineNodeNames)
            alwaysInclude.Add(baseline);

        return FlowAssistantCatalogPruner.SelectRelevantNodeNames(
            string.Join(' ', queryParts),
            alwaysInclude,
            FlowAssistantConstants.MaxDiscoveryCandidates);
    }

    private static IReadOnlyCollection<string> ResolveSelectedNodeNames(JsonElement discovery, FlowAssistantRequestDto request)
    {
        var selected = new List<string>();
        var seen = new HashSet<string>(StringComparer.Ordinal);

        if (TryGetDiscoveryNodes(discovery, out var discovered))
        {
            foreach (var name in discovered)
            {
                if (selected.Count >= FlowAssistantConstants.MaxSelectedNodes)
                    break;

                if (!string.IsNullOrWhiteSpace(name) && seen.Add(name))
                    selected.Add(name);
            }
        }

        foreach (var node in request.GraphContext.Nodes)
        {
            var nodeName = ReadNestedString(node, "data", "name");
            if (!string.IsNullOrWhiteSpace(nodeName) && seen.Add(nodeName))
                selected.Add(nodeName);
        }

        foreach (var baseline in FlowAssistantConstants.BaselineNodeNames)
        {
            if (selected.Count >= FlowAssistantConstants.MaxSelectedNodes + request.GraphContext.Nodes.Count)
                break;

            if (seen.Add(baseline))
                selected.Add(baseline);
        }

        return selected;
    }

    private static (List<string> QueryParts, List<string> AlwaysInclude) CollectQueryParts(FlowAssistantRequestDto request)
    {
        var queryParts = new List<string>();
        var alwaysInclude = new List<string>();

        if (!string.IsNullOrWhiteSpace(request.UserInput))
            queryParts.Add(request.UserInput);

        if (request.ThreadMessages is { Count: > 0 })
        {
            foreach (var message in request.ThreadMessages)
            {
                if (!string.IsNullOrWhiteSpace(message.Content))
                    queryParts.Add(message.Content);
            }
        }

        foreach (var node in request.GraphContext.Nodes)
        {
            var nodeName = ReadNestedString(node, "data", "name");
            if (!string.IsNullOrWhiteSpace(nodeName))
            {
                alwaysInclude.Add(nodeName);
                queryParts.Add(nodeName);
            }
        }

        return (queryParts, alwaysInclude);
    }

    private static bool TryGetDiscoveryNodes(JsonElement discovery, out IReadOnlyList<string> nodeNames)
    {
        nodeNames = Array.Empty<string>();

        if (discovery.ValueKind != JsonValueKind.Object ||
            !discovery.TryGetProperty("nodeNames", out var names) ||
            names.ValueKind != JsonValueKind.Array ||
            names.GetArrayLength() == 0)
        {
            return false;
        }

        var allowed = new HashSet<string>(
            FlowAssistantCatalog.AllowedNodesForPrompt.Select(node => node.Name),
            StringComparer.Ordinal);
        var selected = new List<string>();

        foreach (var entry in names.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.String)
                continue;

            var name = entry.GetString();
            if (!string.IsNullOrWhiteSpace(name) && allowed.Contains(name))
                selected.Add(name);
        }

        if (selected.Count == 0)
            return false;

        nodeNames = selected;
        return true;
    }

    private static string BuildReferenceSection(FlowAssistantReferenceDataDto? referenceData)
    {
        if (referenceData is null)
            return string.Empty;

        var hasAnyValue =
            referenceData.Queues.Count > 0 ||
            referenceData.Agents.Count > 0 ||
            referenceData.Blocks.Count > 0 ||
            referenceData.ModelProviders.Count > 0 ||
            referenceData.Skills.Count > 0 ||
            referenceData.KnowledgeBases.Count > 0;

        if (!hasAnyValue)
            return string.Empty;

        var values = JsonSerializer.Serialize(new
        {
            queues = referenceData.Queues,
            agents = referenceData.Agents,
            blocks = referenceData.Blocks,
            modelProviders = referenceData.ModelProviders,
            skills = referenceData.Skills,
            knowledgeBases = referenceData.KnowledgeBases,
        });

        return $"\n\nAvailable reference values (use these exact names where a field expects one):\n{values}";
    }

    private static bool TryGetQuestion(JsonElement proposal, out string question)
    {
        question = string.Empty;
        if (proposal.ValueKind != JsonValueKind.Object ||
            (TryGetKind(proposal, out var proposalKind) && proposalKind == "proposal") ||
            !proposal.TryGetProperty("question", out var element) ||
            element.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        var value = element.GetString();
        if (string.IsNullOrWhiteSpace(value))
            return false;

        question = value;
        return true;
    }

    private static bool TryGetKind(JsonElement proposal, out string kind)
    {
        kind = string.Empty;
        if (proposal.ValueKind != JsonValueKind.Object ||
            !proposal.TryGetProperty("kind", out var element) ||
            element.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        kind = element.GetString() ?? string.Empty;
        return true;
    }

    private static bool HasNoOperations(JsonElement proposal)
    {
        if (proposal.ValueKind != JsonValueKind.Object)
            return false;

        if (!proposal.TryGetProperty("operations", out var operations))
            return true;

        if (operations.ValueKind != JsonValueKind.Array)
            return true;

        return operations.GetArrayLength() == 0;
    }

    private static string? BuildConfigurationQuestion(JsonElement proposal)
    {
        if (proposal.ValueKind != JsonValueKind.Object ||
            !proposal.TryGetProperty("operations", out var operations) ||
            operations.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var missingFields = new List<string>();

        foreach (var operation in operations.EnumerateArray())
        {
            if (operation.ValueKind != JsonValueKind.Object || ReadString(operation, "type") != "addNode")
                continue;

            if (!operation.TryGetProperty("node", out var node) || node.ValueKind != JsonValueKind.Object)
                continue;

            var nodeType = ReadString(node, "type");
            var nodeName = ReadString(node, "name");
            if (string.IsNullOrWhiteSpace(nodeType) || string.IsNullOrWhiteSpace(nodeName))
                continue;

            var metadata = FlowAssistantConfigCatalog.Nodes.FirstOrDefault(
                candidate => candidate.Type == nodeType && candidate.Name == nodeName);
            if (metadata is null)
                continue;

            var providedKeys = ReadInputKeys(node);

            foreach (var field in metadata.Fields)
            {
                if (field.Direction != "Input" || providedKeys.Contains(field.Name))
                    continue;

                if (field.Required)
                    missingFields.Add($"{field.Label} ({nodeName})");
            }
        }

        if (missingFields.Count == 0)
            return null;

        return $"I need a few values before I can build this flow: {string.Join(", ", missingFields.Distinct())}. What should they be?";
    }

    private static HashSet<string> ReadInputKeys(JsonElement node)
    {
        var keys = new HashSet<string>();
        if (!node.TryGetProperty("inputs", out var inputs) || inputs.ValueKind != JsonValueKind.Array)
            return keys;

        foreach (var input in inputs.EnumerateArray())
        {
            var key = ReadString(input, "key");
            if (!string.IsNullOrWhiteSpace(key))
                keys.Add(key);
        }

        return keys;
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

    private static JsonElement? ReadNestedElement(JsonElement element, string parentName, string propertyName) =>
        element.ValueKind == JsonValueKind.Object &&
        element.TryGetProperty(parentName, out var parent) &&
        parent.ValueKind == JsonValueKind.Object &&
        parent.TryGetProperty(propertyName, out var property)
            ? property.Clone()
            : null;

    private static object? BuildSelectedNodeContext(FlowAssistantRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.SelectedNodeId))
            return null;

        var selectedNode = request.GraphContext.Nodes.FirstOrDefault(node =>
            string.Equals(ReadString(node, "id"), request.SelectedNodeId, StringComparison.Ordinal));

        if (selectedNode.ValueKind != JsonValueKind.Object)
            return null;

        return new
        {
            id = ReadString(selectedNode, "id"),
            type = ReadString(selectedNode, "type"),
            name = ReadNestedString(selectedNode, "data", "name"),
            label = ReadNestedString(selectedNode, "data", "label"),
            inputs = ReadNestedElement(selectedNode, "data", "inputs"),
            outputs = ReadNestedElement(selectedNode, "data", "outputs"),
        };
    }

    private static string SerializeFrame(object payload) => $"data: {JsonSerializer.Serialize(payload)}\n\n";
}
