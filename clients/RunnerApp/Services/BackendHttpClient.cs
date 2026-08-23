using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace RunnerApp.Services;

public class BackendHttpClient : IBackendClient
{
    private readonly HttpClient _httpClient;
    private readonly string _accessToken;

    public BackendHttpClient(HttpClient httpClient, string accessToken)
    {
        _httpClient = httpClient;
        _accessToken = accessToken;
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
    }

    public async Task<ExecutionGraphDto?> GetExecutionGraphAsync(Guid jobId, CancellationToken ct = default)
    {
        var response = await _httpClient.GetAsync($"workspace/api/execution/graph/{jobId}", ct);
        var wrapper = await EnsureServiceSuccessAsync<ExecutionGraphDto>(response, ct);
        return wrapper?.Data;
    }

    public async Task StartJobAsync(Guid jobId, CancellationToken ct = default)
    {
        var response = await _httpClient.PostAsJsonAsync($"workspace/api/execution/job/{jobId}/start", new { }, ct);
        await EnsureServiceSuccessAsync<object>(response, ct);
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

        var response = await _httpClient.PostAsJsonAsync($"workspace/api/execution/job/{jobId}/close", payload, ct);
        await EnsureServiceSuccessAsync<object>(response, ct);
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

    public async Task<MachineRegistrationResult?> RegisterMachineAsync(string operatingSystem, string osId, string username, string hostname, CancellationToken ct = default)
    {
        var payload = new
        {
            operatingSystem,
            osID = osId,
            username,
            hostname,
            serviceAccountUsername = MachineIdentity.ServiceAccountUsername,
            linkedUserAccountId = GetLinkedUserAccountId(),
        };

        var response = await _httpClient.PostAsJsonAsync("workspace/api/machine-auth/register", payload, ct);
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
        var request = new HttpRequestMessage(HttpMethod.Post, "workspace/api/machine-auth/register")
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

    private static List<NodeExecutionLogDto> MapLogsToDtos(List<NodeExecutionLog> logs)
    {
        return logs.Select(l => new NodeExecutionLogDto
        {
            NodeExecutionId = l.UniqueNodeId,
            NodeId = l.NodeId,
            NodeDisplayName = l.NodeName,
            NodeUniqueName = l.NodeUniqueName,
            IsSuccess = l.IsSuccess,
            Duration = l.Duration,
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

    // Extracts the "uid" claim from the JWT access token; it identifies the linked user account.
    private string GetLinkedUserAccountId()
    {
        try
        {
            // Access token is a JWT: header.payload.signature
            var parts = _accessToken.Split('.');
            if (parts.Length != 3)
                return string.Empty;

            var payload = System.Text.Json.JsonDocument.Parse(Base64UrlDecode(parts[1]));
            if (payload.RootElement.TryGetProperty("uid", out var uid))
                return uid.GetString() ?? string.Empty;
        }
        catch
        {
            // Fall through to empty; the backend will reject the registration.
        }

        return string.Empty;
    }

    private static string Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        switch (padded.Length % 4)
        {
            case 2: padded += "=="; break;
            case 3: padded += "="; break;
        }

        return System.Text.Encoding.UTF8.GetString(System.Convert.FromBase64String(padded));
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

        [JsonPropertyName("inputs")]
        public Dictionary<string, string> Inputs { get; set; } = new();

        [JsonPropertyName("outputs")]
        public Dictionary<string, string> Outputs { get; set; } = new();
    }
}
