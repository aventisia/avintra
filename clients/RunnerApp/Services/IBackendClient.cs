using ExecutorLibrary.FlowProcessor.Models;

namespace RunnerApp.Services;

public interface IBackendClient
{
    Task<ExecutionGraphDto?> GetExecutionGraphAsync(Guid jobId, CancellationToken ct = default);
    Task ReportLogsAsync(Guid jobId, List<NodeExecutionLog> logs, CancellationToken ct = default);
    Task StartJobAsync(Guid jobId, CancellationToken ct = default);
    Task CloseJobAsync(Guid jobId, FlowExecutionStatus status, List<NodeExecutionLog> logs, CancellationToken ct = default);
    Task<MachineRegistrationResult?> RegisterMachineAsync(string operatingSystem, string osId, string username, string hostname, CancellationToken ct = default);
    Task<MachineRegistrationResult?> RegisterMachineWithApiKeyAsync(string operatingSystem, string osId, string username, string hostname, string tenantId, string apiKey, string linkedUsername, CancellationToken ct = default);
}

public record MachineRegistrationResult(Guid MachineId, string Jwt, DateTimeOffset ExpiresOn);
