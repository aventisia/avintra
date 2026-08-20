using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using AspNetToolkit.Utils;
using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;
using WorkspaceAPIs.Features.Chats.StreamingChat.DTOs;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Features.Chats.StreamingChat.Service;

public interface IStreamingChatService
{
    /// <summary>
    /// Resolves the Chat AI node configuration for a flow version and relays the
    /// llmpipeline /chat/completions SSE stream back to the caller.
    /// </summary>
    IAsyncEnumerable<string> StreamChatCompletionAsync(
        StreamingChatRequestDto request,
        CancellationToken cancellationToken);
}

public class StreamingChatService : IStreamingChatService
{
    private readonly ILogger<StreamingChatService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IResourceShareService _resourceShareService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly Guid _userId;
    private readonly string _accessToken;

    public StreamingChatService(
        ILogger<StreamingChatService> logger,
        IUnitOfWork unitOfWork,
        IResourceShareService resourceShareService,
        EnvironmentConfig environmentConfig,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _resourceShareService = resourceShareService;
        _environmentConfig = environmentConfig;
        _httpContextAccessor = httpContextAccessor;

        _userId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid"), out var userId)
            ? userId
            : Guid.Empty;

        _accessToken = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? string.Empty;
    }

    public async IAsyncEnumerable<string> StreamChatCompletionAsync(
        StreamingChatRequestDto request,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken)
    {
        // 1. Validate + resolve the Chat AI node config from the flow version.
        var (flowVersion, nodeConfig) = await ResolveChatAgentConfigAsync(request, cancellationToken);
        if (flowVersion is null || nodeConfig is null)
        {
            yield return SerializeError("Chat Agent flow configuration could not be resolved.");
            yield break;
        }

        // 2. Stream from the llmpipeline. The try/catch lives inside the inner
        // iterator method because C# forbids `yield` within a try/catch.
        await foreach (var chunk in StreamFromPipelineAsync(request, flowVersion, nodeConfig, cancellationToken))
        {
            yield return chunk;
        }
    }

    /// <summary>
    /// Posts the resolved LLM payload to llmpipeline /chat/completions and yields
    /// the SSE "data:" lines as they arrive.
    /// </summary>
    private async IAsyncEnumerable<string> StreamFromPipelineAsync(
        StreamingChatRequestDto request,
        WorkspaceAPIs.Entities.FlowVersion flowVersion,
        JsonNode nodeConfig,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var llmPayload = BuildLlmPayload(request, flowVersion, nodeConfig);
        var endpoint = $"{_environmentConfig.LlmPipelineApiBaseUrl}/api/chat/completions/normalized";
        var jsonContent = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(llmPayload),
            Encoding.UTF8,
            "application/json");

        using var httpClient = new HttpClient(new HttpClientHandler
        {
            // llmpipeline may be reached over HTTPS with a dev certificate in local dev.
            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator,
        });

        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        httpClient.Timeout = Timeout.InfiniteTimeSpan;
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("text/event-stream"));

        // Forward the flow's space to llmpipeline so Chat Agent LLM credit usage
        // is attributed to the correct space (rather than defaulting to Central).
        var flowSpaceId = flowVersion.Flow?.SpaceId;
        if (flowSpaceId.HasValue && flowSpaceId.Value != Guid.Empty)
        {
            httpClient.DefaultRequestHeaders.Add("X-Space-Id", flowSpaceId.Value.ToString());
        }

        // Forward the flow's environment to llmpipeline so Chat Agent resource
        // resolution (credentials, vaults, etc.) matches the flow's publication
        // status: published → "prod", otherwise "dev". Mirrors the executor path.
        httpClient.DefaultRequestHeaders.Add("X-Env-Type", flowVersion.IsPublished ? "prod" : "dev");

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = jsonContent,
        };

        using var response = await httpClient.SendAsync(
            httpRequest,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError(
                "llmpipeline /chat/completions failed. status={Status} body={Body}",
                response.StatusCode,
                errorBody);
            yield return SerializeError($"LLM pipeline request failed ({response.StatusCode}).");
            yield break;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream, Encoding.UTF8);

        while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(line))
                continue;

            // Forward only "data:" frames (skip SSE comments/heartbeats).
            if (!line.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                continue;

            // Re-add the SSE frame terminator that StreamReader stripped so
            // the browser's SSE parser can split frames correctly.
            yield return line + "\n\n";
        }
    }

    /// <summary>
    /// Loads the Chat Agent flow version and extracts the Chat AI node's
    /// model/prompt/tools/kb/actions configuration from its ReactFlow object.
    ///
    /// For persisted (Assist) chats the flow version must be published and
    /// non-archived. For temporary (Studio test panel) chats the current
    /// draft version may be used as long as the caller has view access to the
    /// parent flow.
    /// </summary>
    private async Task<(WorkspaceAPIs.Entities.FlowVersion? FlowVersion, JsonNode? NodeConfig)> ResolveChatAgentConfigAsync(
        StreamingChatRequestDto request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "[StreamingChat] Resolving Chat Agent config. FlowVersionId={Id}, IsTempChat={IsTempChat}, UserId={UserId}",
            request.FlowVersionId,
            request.IsTempChat,
            _userId);

        // Load the flow version by ID and type. The published/archived gate is
        // applied after the DB query so it can vary between temporary (Studio
        // test panel, draft allowed) and persisted (Assist, published required)
        // chats without building a dynamic expression tree.
        //
        // A flow version ID is globally unique within a tenant, so the lookup is
        // intentionally NOT scoped to the current space query filter. The caller's
        // access is enforced separately via GetResourceAccessAsync below.
        var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w =>
                w.Id == request.FlowVersionId &&
                w.Flow.Type == FlowTypesEnum.ChatAgent)
            .Include(w => w.Flow)
                .ThenInclude(f => f!.FlowUsers)
            .Include(w => w.FlowVersionUsers)
            .IgnoreQueryFilters()
            .AsNoTracking()
            .SingleOrDefaultAsync(cancellationToken);

        if (flowVersion is not null && !request.IsTempChat && (!flowVersion.IsPublished || flowVersion.IsArchived))
        {
            _logger.LogWarning(
                "[StreamingChat] Persisted chat requires a published, non-archived version. FlowVersionId={Id}, IsPublished={IsPublished}, IsArchived={IsArchived}",
                request.FlowVersionId,
                flowVersion.IsPublished,
                flowVersion.IsArchived);
            return (null, null);
        }

        if (flowVersion is null)
        {
            _logger.LogWarning(
                "[StreamingChat] Flow version not found or wrong type/archived. FlowVersionId={Id}, IsTempChat={IsTempChat}",
                request.FlowVersionId,
                request.IsTempChat);
            return (null, null);
        }

        // Verify the caller has access. For temp chats we only need view access
        // to the parent flow; for persisted chats we keep the published access
        // gate (owner / shared / tenant-wide) already implied by the query above.
        var (hasAccess, _) = await _resourceShareService.GetResourceAccessAsync(
            _userId,
            flowVersion.FlowId,
            ResourceTypeEnum.Flow,
            flowVersion.Flow?.CreatedByUserId ?? Guid.Empty,
            flowVersion.Flow?.IsTenantWideAccess ?? false,
            ResourceAccessTypeEnum.Owner,
            ResourceAccessTypeEnum.Edit,
            ResourceAccessTypeEnum.View);

        if (!hasAccess)
        {
            _logger.LogWarning(
                "[StreamingChat] User denied access to flow. FlowVersionId={Id}, FlowId={FlowId}, UserId={UserId}",
                request.FlowVersionId,
                flowVersion.FlowId,
                _userId);
            return (null, null);
        }

        _logger.LogInformation(
            "[StreamingChat] Flow version resolved. FlowVersionId={Id}, FlowId={FlowId}",
            request.FlowVersionId,
            flowVersion.FlowId);

        // Parse the flow graph and locate the Chat AI node (CreateConversationAIAgent -> aiNode).
        var flow = ReactFlowHelper.Parse(flowVersion.ReactFlowObject);
        var chatNode = flow?.Nodes?.FirstOrDefault(n =>
            string.Equals(n.Type, "aiNode", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(n.Data?.Name, "CreateConversationAIAgent", StringComparison.OrdinalIgnoreCase));

        if (chatNode is null)
        {
            _logger.LogWarning(
                "[StreamingChat] No aiNode named CreateConversationAIAgent found. FlowVersionId={Id}, NodeCount={NodeCount}",
                request.FlowVersionId,
                flow?.Nodes?.Count ?? 0);
            return (flowVersion, null);
        }

        if (chatNode.Data?.Inputs is null || chatNode.Data.Inputs.Count == 0)
        {
            _logger.LogWarning(
                "[StreamingChat] Chat AI node has no inputs. FlowVersionId={Id}",
                request.FlowVersionId);
            return (flowVersion, null);
        }

        // Convert the node inputs into a JsonObject keyed by their config key
        // (e.g. __ModelConfig__Conversation) so we can extract typed values.
        var configObj = new JsonObject();
        foreach (var input in chatNode.Data.Inputs)
        {
            if (string.IsNullOrWhiteSpace(input.Key) || input.Value is null)
                continue;

            configObj[input.Key] = input.Value is JsonElement je
                ? JsonNode.Parse(je.GetRawText())
                : JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(input.Value));
        }

        _logger.LogInformation(
            "[StreamingChat] Chat AI node config resolved with {InputCount} inputs. FlowVersionId={Id}",
            configObj.Count,
            request.FlowVersionId);

        return (flowVersion, configObj);
    }

    /// <summary>
    /// Builds the llmpipeline LLMRequest payload from the resolved Chat AI node config.
    /// </summary>
    private object BuildLlmPayload(
        StreamingChatRequestDto request,
        WorkspaceAPIs.Entities.FlowVersion flowVersion,
        JsonNode nodeConfig)
    {
        var modelConfig = GetObjectProperty(nodeConfig, "__ModelConfig__Conversation") ?? GetObjectProperty(nodeConfig, "__ModelConfig__");
        var prompt = GetStringProperty(nodeConfig, "__Prompt__Conversation") ?? GetStringProperty(nodeConfig, "__Prompt__");
        var kbConfig = GetObjectProperty(nodeConfig, "__KbConfig__Conversation") ?? GetObjectProperty(nodeConfig, "__KbConfig__");
        var toolsConfig = GetArrayProperty(nodeConfig, "__ToolsConfig__Conversation") ?? GetArrayProperty(nodeConfig, "__ToolsConfig__");
        var skillsConfig = GetObjectProperty(nodeConfig, "__SkillsConfig__Conversation") ?? GetObjectProperty(nodeConfig, "__SkillsConfig__");
        var actionsConfig = GetObjectProperty(nodeConfig, "__RecommendedActionsConfig__Conversation");

        var enableDynamicActions = GetBoolProperty(actionsConfig, "enableDynamicActions") ?? false;
        var followUpMessagePrompt = GetStringProperty(actionsConfig, "followUpMessagePrompt");

        var skillNames = GetStringArrayProperty(skillsConfig, "skills");
        var hasSkillNames = skillNames is { Count: > 0 };

        // Build the ordered input message list: system prompt, follow-up prompt, then chat history.
        var messages = new List<object>();
        if (!string.IsNullOrWhiteSpace(prompt))
            messages.Add(new { role = "system", content = prompt });
        if (!string.IsNullOrWhiteSpace(followUpMessagePrompt))
            messages.Add(new { role = "system", content = followUpMessagePrompt });

        if (request.ThreadMessages is { Count: > 0 })
        {
            foreach (var m in request.ThreadMessages)
            {
                if (string.IsNullOrWhiteSpace(m.Role) || string.IsNullOrWhiteSpace(m.Content))
                    continue;
                messages.Add(new { role = m.Role, content = m.Content });
            }
        }

        if (!string.IsNullOrWhiteSpace(request.UserInput))
            messages.Add(new { role = "user", content = request.UserInput });

        // tool_config: array of { tool, credential_name, actions: [{action, approval}] }
        var toolConfig = new List<object>();
        if (toolsConfig is not null)
        {
            foreach (var item in toolsConfig.AsArray())
            {
                if (item is not JsonObject obj)
                    continue;

                var actions = new List<object>();
                if (obj.TryGetPropertyValue("actions", out var actionsNode) && actionsNode is JsonArray actionsArray)
                {
                    foreach (var a in actionsArray)
                    {
                        if (a is not JsonObject actionObj)
                            continue;
                        actions.Add(new
                        {
                            action = actionObj.TryGetPropertyValue("action", out var act) ? act?.ToString() : null,
                            approval = actionObj.TryGetPropertyValue("approval", out var appr) ? appr?.ToString() : "human",
                        });
                    }
                }

                toolConfig.Add(new
                {
                    tool = obj.TryGetPropertyValue("tool", out var tool) ? tool?.ToString() : null,
                    credential_name = ReadCredentialProperty(obj),
                    actions,
                });
            }
        }

        var kbNames = kbConfig is JsonObject kb && kb.TryGetPropertyValue("knowledgeBase", out var kbNode) && kbNode is JsonArray kbArray
            ? kbArray.Where(x => x is not null).Select(x => x!.ToString()).ToList()
            : null;
        var hasKbNames = kbNames is { Count: > 0 };
        var topK = hasKbNames ? (GetIntProperty(kbConfig, "numberOfChunks") ?? 5) : (int?)null;

        return new
        {
            provider = modelConfig?.TryGetPropertyValue("provider", out var provider) == true ? provider?.ToString() : null,
            model = modelConfig?.TryGetPropertyValue("model", out var model) == true ? model?.ToString() : null,
            input = messages,
            files = request.Files,
            tool_config = toolConfig.Count > 0 ? toolConfig : null,
            is_chat_agent = true,
            generate_followup_messages = enableDynamicActions,
            stream = true,
            is_temp_chat = request.IsTempChat,
            conversation_id = request.ConversationId?.ToString() ?? (request.IsTempChat ? null : Guid.NewGuid().ToString()),
            temperature = modelConfig?.TryGetPropertyValue("temperature", out var temp) == true ? temp?.GetValue<double>() : 1.0,
            top_p = modelConfig?.TryGetPropertyValue("top_p", out var topP) == true ? topP?.GetValue<double>() : 1.0,
            reasoning_effort = modelConfig?.TryGetPropertyValue("reasoning_effort", out var reEffort) == true && reEffort?.GetValueKind() == System.Text.Json.JsonValueKind.String ? reEffort?.GetValue<string>() : null,
            is_byok_enabled = modelConfig?.TryGetPropertyValue("is_byok_enabled", out var byok) == true && byok?.GetValue<bool>() == true,
            credential_name = ReadCredentialProperty(modelConfig),
            kb_names = kbNames,
            top_k = topK,
            skill_names = hasSkillNames ? skillNames : null,
            ref_type = "Agent",
            ref_id = flowVersion.FlowId.ToString(),
            ref_name = flowVersion.Flow?.Name ?? string.Empty,
            action = "AgentExecution",
            agent_name = flowVersion.Flow?.Name,
        };
    }

    // --- JsonNode helpers ---

    private static JsonObject? GetObjectProperty(JsonNode? node, string key)
    {
        if (node is not JsonObject obj || !obj.TryGetPropertyValue(key, out var value) || value is not JsonObject nested)
            return null;
        return nested;
    }

    private static JsonArray? GetArrayProperty(JsonNode? node, string key)
    {
        if (node is not JsonObject obj || !obj.TryGetPropertyValue(key, out var value) || value is not JsonArray arr)
            return null;
        return arr;
    }

    private static List<string>? GetStringArrayProperty(JsonNode? node, string key)
    {
        var arr = GetArrayProperty(node, key);
        if (arr is null)
            return null;

        var values = arr
            .Where(x => x is not null)
            .Select(x => x!.ToString())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        return values.Count > 0 ? values : null;
    }

    private static string? GetStringProperty(JsonNode? node, string key)
    {
        if (node is not JsonObject obj || !obj.TryGetPropertyValue(key, out var value) || value is null)
            return null;
        return value.GetValueKind() == System.Text.Json.JsonValueKind.String ? value.GetValue<string>() : value.ToString();
    }

    // Reads a credential reference from a config object. Accepts the canonical
    // "credential_name" key and the legacy "credential_id" key (Q12 back-compat).
    private static string? ReadCredentialProperty(JsonNode? node)
    {
        var canonical = GetStringProperty(node, "credential_name");
        if (!string.IsNullOrWhiteSpace(canonical)) return canonical;
        return GetStringProperty(node, "credential_id");
    }

    private static bool? GetBoolProperty(JsonNode? node, string key)
    {
        if (node is not JsonObject obj || !obj.TryGetPropertyValue(key, out var value) || value is null)
            return null;
        return value.GetValueKind() switch
        {
            System.Text.Json.JsonValueKind.True => true,
            System.Text.Json.JsonValueKind.False => false,
            System.Text.Json.JsonValueKind.String when bool.TryParse(value.GetValue<string>(), out var b) => b,
            _ => null,
        };
    }

    private static int? GetIntProperty(JsonNode? node, string key)
    {
        if (node is not JsonObject obj || !obj.TryGetPropertyValue(key, out var value) || value is null)
            return null;
        return value.GetValueKind() switch
        {
            System.Text.Json.JsonValueKind.Number when value is JsonValue => value.GetValue<int>(),
            System.Text.Json.JsonValueKind.String when int.TryParse(value.GetValue<string>(), out var parsed) => parsed,
            _ => null,
        };
    }

    private static string SerializeError(string message)
        => $"data: {System.Text.Json.JsonSerializer.Serialize(new { type = "error", message })}\n\n";
}
