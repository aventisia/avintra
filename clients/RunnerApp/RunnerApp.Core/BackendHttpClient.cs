using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace RunnerApp.Services;

public class BackendHttpClient : IBackendClient
{
    private readonly HttpClient _httpClient;
    private readonly string _accessToken;
    private readonly MachineTokenManager? _tokenManager;

    // Space of the last-fetched execution graph. The backend derives it from the job, and
    // we echo it as "X-Space-Id" on the config-store fetch (which carries no jobId) so
    // space-scoped config keys resolve. Null for Central flows; graph is always fetched
    // before any config-store call.
    private Guid? _graphSpaceId;

    public BackendHttpClient(HttpClient httpClient, string accessToken)
    {
        _httpClient = httpClient;
        _accessToken = accessToken;
        _tokenManager = null;
    }

    public BackendHttpClient(HttpClient httpClient, MachineTokenManager tokenManager)
    {
        _httpClient = httpClient;
        _accessToken = string.Empty;
        _tokenManager = tokenManager;
    }

    public async Task<ExecutionGraphDto?> GetExecutionGraphAsync(Guid jobId, CancellationToken ct = default)
    {
        using var request = await CreateRequestAsync(HttpMethod.Get, $"workspace/api/execution/graph/{jobId}", ct);
        var response = await _httpClient.SendAsync(request, ct);
        var wrapper = await EnsureServiceSuccessAsync<ExecutionGraphDto>(response, ct);
        _graphSpaceId = wrapper?.Data?.SpaceId;
        return wrapper?.Data;
    }

    public async Task<IReadOnlyDictionary<string, string>> FetchConfigKeyValuePairsAsync(IEnumerable<string> keys, CancellationToken ct = default)
    {
        using var request = await CreateRequestAsync(HttpMethod.Post, "workspace/api/config-store/fetch", ct);
        request.Content = JsonContent.Create(keys);
        if (_graphSpaceId.HasValue)
        {
            request.Headers.Add("X-Space-Id", _graphSpaceId.Value.ToString());
        }

        var response = await _httpClient.SendAsync(request, ct);
        var wrapper = await EnsureServiceSuccessAsync<IEnumerable<ConfigKeyValueDto>>(response, ct);

        return wrapper?.Data?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value, StringComparer.OrdinalIgnoreCase)
            ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    }

    public async Task StartJobAsync(Guid jobId, CancellationToken ct = default)
    {
        using var request = await CreateRequestAsync(HttpMethod.Post, $"workspace/api/execution/job/{jobId}/start", ct);
        request.Content = JsonContent.Create(new { });
        var response = await _httpClient.SendAsync(request, ct);
        await EnsureServiceSuccessAsync<object>(response, ct);
    }

    public async Task<Guid?> GetNextPendingJobAsync(Guid machineId, CancellationToken ct = default)
    {
        using var request = await CreateRequestAsync(HttpMethod.Get, $"workspace/api/execution/machine/{machineId}/next-pending-job", ct);
        var response = await _httpClient.SendAsync(request, ct);
        var wrapper = await EnsureServiceSuccessAsync<NextPendingJobDto>(response, ct);
        return wrapper?.Data?.JobId;
    }

    public async Task CloseJobAsync(Guid jobId, FlowExecutionStatus status, List<NodeExecutionLog> logs, string? remarks = null, CancellationToken ct = default)
    {
        var dtos = MapLogsToDtos(logs);

        var payload = new
        {
            closingStatus = status.ToString(),
            nodeExecutionLogs = dtos,
            remarks,
        };

        using var request = await CreateRequestAsync(HttpMethod.Post, $"workspace/api/execution/job/{jobId}/close", ct);
        request.Content = JsonContent.Create(payload);
        var response = await _httpClient.SendAsync(request, ct);
        await EnsureServiceSuccessAsync<object>(response, ct);
    }

    public async Task InsertNodeExecutionLogsAsync(Guid jobId, IReadOnlyList<NodeExecutionLog> logs, CancellationToken ct = default)
    {
        if (logs.Count == 0)
        {
            return;
        }

        using var request = await CreateRequestAsync(HttpMethod.Post, $"workspace/api/job/{jobId}/node-execution-logs", ct);
        request.Content = JsonContent.Create(MapLogsToDtos(logs));
        var response = await _httpClient.SendAsync(request, ct);
        await EnsureServiceSuccessAsync<bool>(response, ct);
    }

    public async Task<MachineRegistrationResult?> RegisterMachineAsync(string operatingSystem, string osId, string username, string hostname, CancellationToken ct = default)
    {
        if (_tokenManager is not null)
        {
            throw new InvalidOperationException(
                "RegisterMachineAsync requires the fixed-token constructor; construct the registration client with the linked-user JWT.");
        }

        var payload = new
        {
            operatingSystem,
            osID = osId,
            username,
            hostname,
            serviceAccountUsername = MachineIdentity.ServiceAccountUsername,
            linkedUserAccountId = GetLinkedUserAccountId(),
        };

        // Registration uses the linked-user JWT it was constructed with; it is the source of
        // machine tokens and must never route through the token manager (recursion).
        using var request = new HttpRequestMessage(HttpMethod.Post, "workspace/api/machine-auth/register")
        {
            Content = JsonContent.Create(payload)
        };
        if (!string.IsNullOrWhiteSpace(_accessToken))
        {
            request.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _accessToken);
        }

        var response = await _httpClient.SendAsync(request, ct);
        var wrapper = await EnsureServiceSuccessAsync<MachineAuthResponseDto>(response, ct);
        if (wrapper?.Data is null)
            return null;

        return new MachineRegistrationResult(wrapper.Data.MachineId, wrapper.Data.Jwt, wrapper.Data.ExpiresOn);
    }

    public async Task<MachineRegistrationResult?> RegisterMachineWithApiKeyAsync(string operatingSystem, string osId, string username, string hostname, string tenantId, string apiKey, string linkedUsername, CancellationToken ct = default)
    {
        var payload = new
        {
            operatingSystem,
            osID = osId,
            username,
            hostname,
            serviceAccountUsername = MachineIdentity.ServiceAccountUsername,
            linkedUserAccountId = linkedUsername,
        };

        // API-key authenticated registration: the key and tenant header let the backend
        // resolve the tenant without a user JWT, and the linked username resolves the user.
        using var request = new HttpRequestMessage(HttpMethod.Post, "workspace/api/machine-auth/register")
        {
            Content = JsonContent.Create(payload)
        };
        request.Headers.Add("X-API-KEY", apiKey);
        request.Headers.Add("X-TENANT-ID", tenantId);

        var response = await _httpClient.SendAsync(request, ct);
        var wrapper = await EnsureServiceSuccessAsync<MachineAuthResponseDto>(response, ct);
        if (wrapper?.Data is null)
            return null;

        return new MachineRegistrationResult(wrapper.Data.MachineId, wrapper.Data.Jwt, wrapper.Data.ExpiresOn);
    }

    /// <summary>
    /// Renews a still-valid machine JWT via machine-auth/validate (JWT auth allowed) and
    /// returns the freshly minted token. Used by worker processes, which hold no tenant API
    /// key. The token must be passed explicitly (never via the token manager) because this is
    /// the refresh path itself.
    /// </summary>
    public async Task<MachineRegistrationResult?> ValidateMachineAsync(string machineJwt, string osId, string username, CancellationToken ct = default)
    {
        var payload = new
        {
            operatingSystem = OperatingSystem.IsWindows() ? "Windows" : "Linux",
            osID = osId,
            username,
            hostname = MachineIdentity.Hostname,
            serviceAccountUsername = MachineIdentity.ServiceAccountUsername,
            linkedUserAccountId = JwtUtils.GetClaim(machineJwt, "uname"),
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "workspace/api/machine-auth/validate")
        {
            Content = JsonContent.Create(payload)
        };
        if (!string.IsNullOrWhiteSpace(machineJwt))
        {
            request.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", machineJwt);
        }

        var response = await _httpClient.SendAsync(request, ct);
        var wrapper = await EnsureServiceSuccessAsync<MachineAuthResponseDto>(response, ct);
        if (wrapper?.Data is null)
            return null;

        return new MachineRegistrationResult(wrapper.Data.MachineId, wrapper.Data.Jwt, wrapper.Data.ExpiresOn);
    }

    /// <summary>
    /// Builds a concise remark for a failed flow execution using the first failed node's output status.
    /// The error message is placed first so truncation in the UI still shows the useful part.
    /// Falls back to the provided error message or a generic message when no failed node log is available.
    /// </summary>
    public static string BuildFailedNodeRemark(List<NodeExecutionLog> logs, string? errorMessage = null)
    {
        var failedLog = logs.FirstOrDefault(l => !l.IsSuccess);
        if (failedLog is not null)
        {
            var statusMessage = failedLog.Outputs.TryGetValue("Status", out var status) ? status : null;
            if (!string.IsNullOrWhiteSpace(statusMessage))
                return $"{statusMessage} (node: {failedLog.NodeName})";
        }

        if (!string.IsNullOrWhiteSpace(errorMessage))
            return $"{errorMessage}";

        return "Flow execution failed.";
    }

    // Builds a request with the freshest available bearer token: the token manager's current
    // token when present (refreshing it first if it is near expiry), otherwise the fixed
    // access token. Per-request headers keep refreshed tokens flowing without mutating
    // DefaultRequestHeaders mid-flight.
    private async Task<HttpRequestMessage> CreateRequestAsync(HttpMethod method, string url, CancellationToken ct)
    {
        var token = _tokenManager is not null
            ? await _tokenManager.GetValidTokenAsync(ct)
            : _accessToken;

        var request = new HttpRequestMessage(method, url);
        if (!string.IsNullOrWhiteSpace(token))
        {
            request.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }

        return request;
    }

    private static List<NodeExecutionLogDto> MapLogsToDtos(IEnumerable<NodeExecutionLog> logs)
    {
        return logs.Select(l => new NodeExecutionLogDto
        {
            NodeExecutionId = l.UniqueNodeId,
            NodeId = l.NodeId,
            NodeDisplayName = l.NodeName,
            NodeUniqueName = l.NodeUniqueName,
            IsSuccess = l.IsSuccess,
            Duration = l.Duration,
            ExecutedAt = l.ExecutedAt == default ? null : l.ExecutedAt,
            CallerReferenceId = l.CallerReferenceId,
            LoopReferenceId = l.LoopReferenceId,
            LoopIterationIndex = l.LoopIterationIndex,
            Inputs = l.Inputs,
            Outputs = l.Outputs,
        }).ToList();
    }

    private static async Task<ServiceResponseWrapper<T>?> EnsureServiceSuccessAsync<T>(HttpResponseMessage response, CancellationToken ct)
    {
        response.EnsureSuccessStatusCode();

        var wrapper = await response.Content.ReadFromJsonAsync<ServiceResponseWrapper<T>>(
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken: ct)
            ?? throw new InvalidOperationException("Backend returned an empty response.");

        if (wrapper.StatusCode is < 200 or >= 300)
        {
            throw new InvalidOperationException(
                $"Backend returned a business-rule failure (status {wrapper.StatusCode}): {wrapper.Message}");
        }

        return wrapper;
    }

    // Extracts the "uid" claim from the fixed access token; it identifies the linked user account.
    private string GetLinkedUserAccountId()
    {
        return JwtUtils.GetClaim(_accessToken, "uid");
    }

    private class ServiceResponseWrapper<T>
    {
        [JsonPropertyName("data")]
        public T? Data { get; set; }

        [JsonPropertyName("statusCode")]
        public int StatusCode { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }

    private class MachineAuthResponseDto
    {
        [JsonPropertyName("jwt")]
        public string Jwt { get; set; } = string.Empty;

        [JsonPropertyName("expiresOn")]
        public DateTimeOffset ExpiresOn { get; set; }

        [JsonPropertyName("machineId")]
        public Guid MachineId { get; set; }
    }

    private class NextPendingJobDto
    {
        [JsonPropertyName("id")]
        public Guid JobId { get; set; }
    }

    private class NodeExecutionLogDto
    {
        [JsonPropertyName("nodeExecutionId")]
        public string NodeExecutionId { get; set; } = string.Empty;

        [JsonPropertyName("retryAttempt")]
        public int RetryAttempt { get; set; }

        [JsonPropertyName("nodeId")]
        public string NodeId { get; set; } = string.Empty;

        [JsonPropertyName("nodeDisplayName")]
        public string NodeDisplayName { get; set; } = string.Empty;

        [JsonPropertyName("nodeUniqueName")]
        public string NodeUniqueName { get; set; } = string.Empty;

        [JsonPropertyName("isSuccess")]
        public bool IsSuccess { get; set; }

        [JsonPropertyName("duration")]
        public double Duration { get; set; }

        [JsonPropertyName("executedAt")]
        public DateTimeOffset? ExecutedAt { get; set; }

        [JsonPropertyName("callerReferenceId")]
        public string CallerReferenceId { get; set; } = string.Empty;

        [JsonPropertyName("loopReferenceId")]
        public string LoopReferenceId { get; set; } = string.Empty;

        [JsonPropertyName("loopIterationIndex")]
        public int LoopIterationIndex { get; set; } = -1;

        [JsonPropertyName("inputs")]
        public Dictionary<string, string> Inputs { get; set; } = new();

        [JsonPropertyName("outputs")]
        public Dictionary<string, string> Outputs { get; set; } = new();
    }
}