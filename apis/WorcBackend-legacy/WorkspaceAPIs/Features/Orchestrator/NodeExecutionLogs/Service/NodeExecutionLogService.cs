using System.IO.Compression;
using System.Text;
using System.Text.Json;
using WorkspaceAPIs.DTOs;
using WorkspaceAPIs.Helpers;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations for persisting and retrieving per-node execution logs.
/// </summary>
public class NodeExecutionLogService : INodeExecutionLogService
{
    private readonly IUnitOfWork _unitOfWork;

    public NodeExecutionLogService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // Inserts a batch of node execution logs for the specified job.
    public async Task<ServiceResponse<bool>> InsertNodeExecutionLogsAsync(Guid jobId, List<NodeExecutionLogDto> logs)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to insert node execution logs.", 500);

        if (logs == null || logs.Count == 0)
            return serviceResponse.Update("No logs provided.", 400);

        // Resolve job metadata (tenant isolation is enforced by the job entity query filter).
        var jobMeta = await _unitOfWork.JobRepo
            .GetByConditionAsync(j => j.Id == jobId)
            .Select(j => new { j.Id, j.TenantId })
            .SingleOrDefaultAsync();

        if (jobMeta == null)
            return serviceResponse.Update("Job not found.", 404);

        // Map DTOs to entities with compressed payloads.
        var entities = logs.Select(dto => MapDtoToEntity(dto, jobId, jobMeta.TenantId)).ToList();

        await _unitOfWork.JobNodeExecutionLogRepo.InsertAsync(entities);

        return await _unitOfWork.SaveAsync()
            ? serviceResponse.Update("Node execution logs inserted.", 200, true)
            : serviceResponse.Update("Failed to save logs.", 500);
    }

    // Retrieves all node execution logs for the specified job.
    public async Task<ServiceResponse<List<NodeExecutionLogDto>>> GetNodeExecutionLogsAsync(Guid jobId)
    {
        var serviceResponse = ServiceResponse<List<NodeExecutionLogDto>>.Create("Failed to retrieve logs.", 500);

        var logs = await _unitOfWork.JobNodeExecutionLogRepo
            .GetByConditionAsync(n => n.JobId == jobId)
            .OrderBy(n => n.ExecutedAt)
            .ToListAsync();

        var dtos = logs.Select(MapEntityToDto).ToList();

        return serviceResponse.Update("Logs retrieved.", 200, dtos);
    }

    // Retrieves the most recent node execution log for the specified job as a JSON document.
    public async Task<ServiceResponse<JsonDocument?>> GetLastNodeExecutionLogAsync(Guid jobId)
    {
        var serviceResponse = ServiceResponse<JsonDocument?>.Create("Failed to retrieve last node execution log.", 500);

        var lastLog = await _unitOfWork.JobNodeExecutionLogRepo
            .GetByConditionAsync(n => n.JobId == jobId)
            .OrderByDescending(n => n.ExecutedAt)
            .ThenByDescending(n => n.Id)
            .FirstOrDefaultAsync();

        if (lastLog is null)
        {
            return serviceResponse.Update("No node execution logs found.", 200, (JsonDocument?)null);
        }

        var document = BuildLastNodeLogDocument(lastLog);
        return serviceResponse.Update("Last node execution log retrieved.", 200, document);
    }

    // Builds a JSON document representing the last executed node for display in the job details view.
    private static JsonDocument BuildLastNodeLogDocument(JobNodeExecutionLog entity)
    {
        var inputsJson = NodeExecutionLogCompressionHelpers.DecompressJson(entity.InputsJsonCompressed);
        var outputsJson = NodeExecutionLogCompressionHelpers.DecompressJson(entity.OutputsJsonCompressed);

        using var stream = new System.IO.MemoryStream();
        using (var writer = new Utf8JsonWriter(stream))
        {
            writer.WriteStartObject();
            writer.WriteString("nodeExecutionId", entity.NodeExecutionId);
            writer.WriteNumber("retryAttempt", entity.RetryAttempt);
            writer.WriteString("nodeId", entity.NodeId);
            writer.WriteString("nodeDisplayName", entity.NodeDisplayName);
            writer.WriteString("nodeUniqueName", entity.NodeUniqueName);
            writer.WriteBoolean("isSuccess", entity.IsSuccess);
            writer.WriteNumber("duration", entity.Duration);
            writer.WriteString("executedAt", entity.ExecutedAt);
            writer.WritePropertyName("inputs");
            writer.WriteRawValue(inputsJson ?? "{}", skipInputValidation: true);
            writer.WritePropertyName("outputs");
            writer.WriteRawValue(outputsJson ?? "{}", skipInputValidation: true);
            writer.WriteEndObject();
        }

        return JsonDocument.Parse(stream.ToArray());
    }

    // Maps a DTO to a new entity with compressed JSON payloads.
    private static JobNodeExecutionLog MapDtoToEntity(NodeExecutionLogDto dto, Guid jobId, Guid tenantId)
    {
        var inputsJson = SerializeDictionary(dto.Inputs);
        var outputsJson = SerializeDictionary(dto.Outputs);

        return new JobNodeExecutionLog
        {
            Id = Guid.NewGuid(),
            JobId = jobId,
            TenantId = tenantId,
            NodeExecutionId = dto.NodeExecutionId,
            RetryAttempt = dto.RetryAttempt,
            NodeId = dto.NodeId,
            NodeDisplayName = dto.NodeDisplayName,
            NodeUniqueName = dto.NodeUniqueName,
            IsSuccess = dto.IsSuccess,
            Duration = dto.Duration,
            InputsJsonCompressed = NodeExecutionLogCompressionHelpers.CompressJson(inputsJson),
            OutputsJsonCompressed = NodeExecutionLogCompressionHelpers.CompressJson(outputsJson),
            InputsJsonLength = inputsJson.Length,
            OutputsJsonLength = outputsJson.Length,
            ExecutedAt = DateTimeOffset.UtcNow
        };
    }

    // Maps an entity back to a DTO with decompressed JSON payloads.
    private static NodeExecutionLogDto MapEntityToDto(JobNodeExecutionLog entity)
    {
        var inputsJson = NodeExecutionLogCompressionHelpers.DecompressJson(entity.InputsJsonCompressed);
        var outputsJson = NodeExecutionLogCompressionHelpers.DecompressJson(entity.OutputsJsonCompressed);

        return new NodeExecutionLogDto
        {
            NodeExecutionId = entity.NodeExecutionId,
            RetryAttempt = entity.RetryAttempt,
            NodeId = entity.NodeId,
            NodeDisplayName = entity.NodeDisplayName,
            NodeUniqueName = entity.NodeUniqueName,
            IsSuccess = entity.IsSuccess,
            Duration = entity.Duration,
            Inputs = DeserializeDictionary(inputsJson),
            Outputs = DeserializeDictionary(outputsJson)
        };
    }

    // Serializes a key/value dictionary to a JSON string.
    private static string SerializeDictionary(Dictionary<string, string>? dictionary)
    {
        if (dictionary == null || dictionary.Count == 0)
            return "{}";

        return System.Text.Json.JsonSerializer.Serialize(dictionary);
    }

    // Deserializes a JSON string into a key/value dictionary.
    private static Dictionary<string, string> DeserializeDictionary(string? json)
    {
        if (string.IsNullOrWhiteSpace(json) || json == "{}")
            return new Dictionary<string, string>();

        return System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json)
               ?? new Dictionary<string, string>();
    }
}
