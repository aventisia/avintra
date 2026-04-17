using ExecutorLibrary.FlowProcessor;
using ExecutorLibrary.FlowProcessor.Interfaces;
using ExecutorLibrary.FlowProcessor.Models;
using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Services;

public class FlowExecutionService : IFlowExecutionService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<FlowExecutionService> _logger;

    public FlowExecutionService(
        IServiceScopeFactory scopeFactory,
        ILogger<FlowExecutionService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    // Note: This method is intentionally not async and does not await the background execution task. 
    // We want the API to return immediately after starting the background execution without waiting for it to complete.
    public void StartExecution(Guid tenantId, Guid userId, Guid jobId, ReactFlowDataModel flow, string accessToken)
    {
        _ = Task.Run(() => ExecuteInBackgroundAsync(jobId, flow, tenantId, userId, accessToken));
    }

    // This method runs the flow execution in the background and updates the job status in the database accordingly. 
    // It also handles any unhandled exceptions to ensure that the job status is updated to Failed if something goes wrong during execution.
    private async Task ExecuteInBackgroundAsync(Guid jobId, ReactFlowDataModel flow, Guid tenantId, Guid userId, string accessToken)
    {
        try
        {
            // Create a new scope to get scoped services for the background execution
            using var scope = _scopeFactory.CreateScope();

            // Set the current tenant in the scoped services so that we can access tenant-specific data during flow execution
            var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
            currentTenantService.CurrentTenantId = tenantId;

            // Get the unit of work to access the database
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            // Get the flow notification service to send real-time updates
            var flowNotificationService = scope.ServiceProvider.GetRequiredService<IFlowNotificationService>();

            // Get the job from the database
            var job = await unitOfWork.JobRepo.GetByConditionAsync(w => w.Id == jobId).SingleOrDefaultAsync();

            // Validate: Job not found
            if (job is null)
            {
                _logger.LogWarning("Background flow execution skipped because job was not found. JobId: {JobId}", jobId);
                return;
            }

            // Update job's metadata before starting execution
            job.Status = JobStatusTypesEnum.Running;
            job.StartTime = DateTimeOffset.UtcNow;
            unitOfWork.JobRepo.Update(job);

            // Error: Failed to save the job start status
            if (!await unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Context SaveChanges failed while updating job status to Running for background flow execution. JobId: {JobId}", jobId);
                return;
            }

            // Initialize the FlowProcessor with NodeProcessor and execute the flow
            var initialVariables = new Dictionary<string, object?>
            {
                ["UserId"] = userId.ToString(),
                ["TenantId"] = tenantId.ToString(),
                ["AccessToken"] = accessToken,
                ["InputArgumentsJson"] = job.InputArgumentsJson
            };

            // Parse InputArgumentsJson and inject chat-specific variables when triggeredBy == "chat"
            InjectChatVariables(job.InputArgumentsJson, initialVariables);

            var flowProcessor = new FlowProcessor(new NodeProcessor());
            var flowResult = await flowProcessor.ExecuteAsync(flow, initialVariables);

            // Extract chat-specific output if this is a chat-triggered flow
            var outputDataJson = ExtractOutputDataJson(initialVariables, flowResult);

            // Update the job with the final status and results after execution
            job.Status = MapFlowStatusToJobStatus(flowResult.Status);
            job.EndTime = flowResult.EndTime;
            job.NodeExecutionLogs = System.Text.Json.JsonSerializer.Serialize(flowResult.NodeLogs);
            job.OutputDataJson = outputDataJson;
            unitOfWork.JobRepo.Update(job);

            // Error: Failed to save the final job status and results
            if (!await unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Context SaveChanges failed while persisting final flow execution status for job. JobId: {JobId}", jobId);
            }
            else
            {
                // Send real-time notification to the user about job completion
                await flowNotificationService.NotifyExecutionCompletedAsync(userId, jobId, job.Status);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error while running background flow execution. JobId: {JobId}", jobId);
            await MarkJobAsFailedAsync(jobId, tenantId, userId, ex.Message);
        }
    }

    // Synchronous flow execution: awaits completion and returns the FlowExecutionResult.
    // Used for chat-triggered flows where the caller needs the output inline.
    public async Task<FlowExecutionResult> StartExecutionAndWaitAsync(Guid tenantId, Guid userId, Guid jobId, ReactFlowDataModel flow, string accessToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();

            var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
            currentTenantService.CurrentTenantId = tenantId;

            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var flowNotificationService = scope.ServiceProvider.GetRequiredService<IFlowNotificationService>();

            var job = await unitOfWork.JobRepo.GetByConditionAsync(w => w.Id == jobId).SingleOrDefaultAsync();

            if (job is null)
            {
                _logger.LogWarning("Synchronous flow execution skipped because job was not found. JobId: {JobId}", jobId);
                return new FlowExecutionResult
                {
                    IsSuccess = false,
                    Status = FlowExecutionStatus.Failed,
                    StartTime = DateTimeOffset.UtcNow,
                    EndTime = DateTimeOffset.UtcNow,
                    ErrorMessage = "Job not found."
                };
            }

            // Update job status to Running
            job.Status = JobStatusTypesEnum.Running;
            job.StartTime = DateTimeOffset.UtcNow;
            unitOfWork.JobRepo.Update(job);

            if (!await unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Context SaveChanges failed while updating job status to Running for synchronous flow execution. JobId: {JobId}", jobId);
                return new FlowExecutionResult
                {
                    IsSuccess = false,
                    Status = FlowExecutionStatus.Failed,
                    StartTime = DateTimeOffset.UtcNow,
                    EndTime = DateTimeOffset.UtcNow,
                    ErrorMessage = "Failed to update job status."
                };
            }

            // Initialize the FlowProcessor with NodeProcessor and execute the flow
            var initialVariables = new Dictionary<string, object?>
            {
                ["UserId"] = userId.ToString(),
                ["TenantId"] = tenantId.ToString(),
                ["AccessToken"] = accessToken,
                ["InputArgumentsJson"] = job.InputArgumentsJson
            };

            // Parse InputArgumentsJson and inject chat-specific variables when triggeredBy == "chat"
            InjectChatVariables(job.InputArgumentsJson, initialVariables);

            var flowProcessor = new FlowProcessor(new NodeProcessor());
            var flowResult = await flowProcessor.ExecuteAsync(flow, initialVariables);

            // Extract chat-specific output if this is a chat-triggered flow
            var outputDataJson = ExtractOutputDataJson(initialVariables, flowResult);

            // Update the job with the final status and results
            job.Status = MapFlowStatusToJobStatus(flowResult.Status);
            job.EndTime = flowResult.EndTime;
            job.NodeExecutionLogs = System.Text.Json.JsonSerializer.Serialize(flowResult.NodeLogs);
            job.OutputDataJson = outputDataJson;
            unitOfWork.JobRepo.Update(job);

            if (!await unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Context SaveChanges failed while persisting final flow execution status for job. JobId: {JobId}", jobId);
            }
            else
            {
                await flowNotificationService.NotifyExecutionCompletedAsync(userId, jobId, job.Status);
            }

            return flowResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error while running synchronous flow execution. JobId: {JobId}", jobId);
            await MarkJobAsFailedAsync(jobId, tenantId, userId, ex.Message);

            return new FlowExecutionResult
            {
                IsSuccess = false,
                Status = FlowExecutionStatus.Failed,
                StartTime = DateTimeOffset.UtcNow,
                EndTime = DateTimeOffset.UtcNow,
                ErrorMessage = ex.Message
            };
        }
    }

    // Helper: Parses InputArgumentsJson and injects chat-specific variables into the flow's initial variables
    // when the flow is triggered by a chat interaction.
    private static void InjectChatVariables(string? inputArgumentsJson, Dictionary<string, object?> initialVariables)
    {
        if (string.IsNullOrWhiteSpace(inputArgumentsJson))
            return;

        try
        {
            var jsonContent = inputArgumentsJson.Trim();

            // Handle double-encoded JSON: InputArgumentsJson is stored via JsonNode.ToJsonString() which
            // wraps the content in quotes when the original value was a string (e.g., from frontend JSON.stringify).
            // Unwrap it first so we can parse the inner JSON object.
            if (jsonContent.StartsWith("\""))
            {
                jsonContent = System.Text.Json.JsonSerializer.Deserialize<string>(jsonContent) ?? string.Empty;
                if (string.IsNullOrWhiteSpace(jsonContent))
                    return;
            }

            using var doc = System.Text.Json.JsonDocument.Parse(jsonContent);
            var root = doc.RootElement;

            if (root.ValueKind != System.Text.Json.JsonValueKind.Object)
                return;

            if (root.TryGetProperty("triggeredBy", out var triggeredByProp) &&
                string.Equals(triggeredByProp.GetString(), "chat", StringComparison.OrdinalIgnoreCase))
            {
                initialVariables["TriggeredBy"] = "chat";

                if (root.TryGetProperty("userInput", out var userInputProp))
                    initialVariables["ChatUserInput"] = userInputProp.GetString() ?? string.Empty;

                if (root.TryGetProperty("threadMessages", out var threadMsgProp))
                    initialVariables["ChatThreadMessages"] = threadMsgProp.GetRawText();

                if (root.TryGetProperty("conversationId", out var convIdProp))
                    initialVariables["ChatConversationId"] = convIdProp.GetString() ?? string.Empty;
            }
        }
        catch
        {
            // InputArgumentsJson is not valid JSON or doesn't have expected shape — skip chat injection
        }
    }

    // Helper: Extracts the OutputDataJson string for the job based on whether it's a chat-triggered flow or not.
    // For chat flows, extracts the LLM response text from _ChatLLMResult.
    // For non-chat flows, serializes the full FlowExecutionResult.
    private static string ExtractOutputDataJson(Dictionary<string, object?> initialVariables, FlowExecutionResult flowResult)
    {
        // Check if this is a chat-triggered flow
        if (initialVariables.TryGetValue("TriggeredBy", out var triggeredBy) &&
            string.Equals(triggeredBy?.ToString(), "chat", StringComparison.OrdinalIgnoreCase) &&
            flowResult.OutputVariables is not null &&
            flowResult.OutputVariables.TryGetValue("_ChatLLMResult", out var chatResult) &&
            chatResult is not null)
        {
            try
            {
                // chatResult is a JsonElement from ProcessLLMRequestNode.Result
                var resultJson = chatResult.ToString() ?? string.Empty;
                using var resultDoc = System.Text.Json.JsonDocument.Parse(resultJson);

                // Extract the "output" field from the LLM response
                if (resultDoc.RootElement.TryGetProperty("output", out var outputProp))
                {
                    // output is a plain string (e.g., "Hello!")
                    if (outputProp.ValueKind == System.Text.Json.JsonValueKind.String)
                        return outputProp.GetString() ?? string.Empty;

                    // output is an object (e.g., {"raw_text": "...", "error": "..."} when is_json_output is true
                    // but LLM didn't return valid JSON) — extract raw_text
                    if (outputProp.ValueKind == System.Text.Json.JsonValueKind.Object &&
                        outputProp.TryGetProperty("raw_text", out var rawTextProp) &&
                        rawTextProp.ValueKind == System.Text.Json.JsonValueKind.String)
                    {
                        return rawTextProp.GetString() ?? string.Empty;
                    }

                    // Fallback for other output types (array, etc.)
                    return outputProp.GetRawText();
                }

                // Fallback: return the entire LLM result JSON
                return resultJson;
            }
            catch
            {
                return chatResult.ToString() ?? string.Empty;
            }
        }

        // Non-chat: serialize the full FlowExecutionResult
        return System.Text.Json.JsonSerializer.Serialize(flowResult);
    }

    // Helper: Marks the job as failed in case of unhandled exceptions during flow execution
    private async Task MarkJobAsFailedAsync(Guid jobId, Guid tenantId, Guid userId, string errorMessage)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
            currentTenantService.CurrentTenantId = tenantId;
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var flowNotificationService = scope.ServiceProvider.GetRequiredService<IFlowNotificationService>();

            var job = await unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobId)
                .SingleOrDefaultAsync();

            if (job is null)
            {
                return;
            }

            job.Status = JobStatusTypesEnum.Failed;
            job.EndTime = DateTimeOffset.UtcNow;
            job.OutputDataJson = System.Text.Json.JsonSerializer.Serialize(new { ErrorMessage = errorMessage });

            unitOfWork.JobRepo.Update(job);
            if (await unitOfWork.SaveAsync())
            {
                // Send real-time notification to the user about job failure
                await flowNotificationService.NotifyExecutionCompletedAsync(userId, jobId, JobStatusTypesEnum.Failed, errorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update failure status for background flow execution job. JobId: {JobId}", jobId);
        }
    }

    // Helper: Maps the flow execution status to the corresponding job status
    private static JobStatusTypesEnum MapFlowStatusToJobStatus(FlowExecutionStatus status)
    {
        return status switch
        {
            FlowExecutionStatus.Completed => JobStatusTypesEnum.Completed,
            FlowExecutionStatus.Aborted => JobStatusTypesEnum.Abort, // TODO: Consider changing this to Aborted to align with FlowExecutionStatus enum naming
            _ => JobStatusTypesEnum.Failed,
        };
    }

}
