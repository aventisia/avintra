using ExecutorLibrary.FlowProcessor;
using ExecutorLibrary.FlowProcessor.Interfaces;
using ExecutorLibrary.FlowProcessor.Models;
using ExecutorLibrary.Models;
using NodeLibrary.Core;

namespace WorkspaceAPIs.Services;

public class ExecuteFlowStep2Service : IExecuteFlowStep2Service
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ExecuteFlowStep2Service> _logger;
    private readonly Guid? _userId;

    public ExecuteFlowStep2Service(
        IServiceScopeFactory scopeFactory,
        ILogger<ExecuteFlowStep2Service> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Note: This method is intentionally not async and does not await the background execution task. 
    // We want the API to return immediately after starting the background execution without waiting for it to complete.
    public void StartExecution(FlowExecutionArgs flowExecutionArgs)
    {
        _ = Task.Run(() => ExecuteInBackgroundAsync(flowExecutionArgs));
    }

    // This method runs the flow execution in the background and updates the job status in the database accordingly. 
    // It also handles any unhandled exceptions to ensure that the job status is updated to Failed if something goes wrong during execution.
    private async Task ExecuteInBackgroundAsync(FlowExecutionArgs flowExecutionArgs)
    {
        try
        {
            // Create a new scope to get scoped services for the background execution
            using var scope = _scopeFactory.CreateScope();

            // Set the current tenant in the scoped services so that we can access tenant-specific data during flow execution
            var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
            currentTenantService.CurrentTenantId = flowExecutionArgs.TenantId;

            // Get the unit of work to access the database
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            // Get the flow notification service to send real-time updates
            var executionNotificationService = scope.ServiceProvider.GetRequiredService<IExecutionNotificationService>();

            // Get the job from the database
            var job = await unitOfWork.JobRepo.GetByConditionAsync(w => w.Id == flowExecutionArgs.JobId).SingleOrDefaultAsync();

            // Validate: Job not found
            if (job is null)
            {
                _logger.LogWarning("Background flow execution skipped because job was not found. JobId: {JobId}", flowExecutionArgs.JobId);
                return;
            }


            // Populate "ExecutedBy" only if it has not already been set.
            //
            // Attribution rules:
            // 1. ManualTrigger (non-published) → current authenticated user name or Agent Builder fallback.
            // 2. API, Email, Event, Message, Queue, Time, Webhook → trigger name (prefixed for traceability).
            // 3. All other trigger types → constructed machine identity (OS username + OS ID).
            //
            // NOTE: This mapping should be reviewed whenever new TriggerTypesEnum values are introduced.
            if (string.IsNullOrWhiteSpace(job.ExecutedBy))
            {
                // Attempt to resolve workspace user (applicable for UI-based executions)
                var user = await unitOfWork.WorkspaceUserRepo
                    .GetByConditionAsync(w => w.Id == _userId)
                    .SingleOrDefaultAsync();

                // Manual execution (Agent Builder / UI)
                if (job.TriggerType == TriggerTypesEnum.Manual && !job.IsPublished)
                {
                    job.ExecutedBy = user != null
                        ? $"{user.FirstName} {user.LastName}"
                        : "Agent Builder";

                    job.ExecutedOn = "Agent Builder (web)";
                }
                // Trigger-based execution
                else if (
                    job.TriggerType == TriggerTypesEnum.Api ||
                    job.TriggerType == TriggerTypesEnum.Email ||
                    job.TriggerType == TriggerTypesEnum.Event ||
                    job.TriggerType == TriggerTypesEnum.Message ||
                    job.TriggerType == TriggerTypesEnum.Queue ||
                    job.TriggerType == TriggerTypesEnum.Time ||
                    job.TriggerType == TriggerTypesEnum.Webhook)
                {
                    var trigger = await unitOfWork.TriggerRepo
                        .GetByConditionAsync(w => w.Id == job.RefId)
                        .FirstOrDefaultAsync();

                    job.ExecutedBy = trigger != null
                        ? $"trigger_{trigger.Name}"
                        : "trigger_Unknown";

                    job.ExecutedOn = job.Machine != null
                        ? $"machine_{job.Machine.Name}"
                        : "Web Server";
                }
                // Machine-based execution (default fallback)
                else
                {
                    var safeUser = job.Machine?.Hostname?.Trim().ToLower() ?? "unknown";
                    var osId = job.Machine?.OsID;
                    var shortOsId = !string.IsNullOrEmpty(osId) && osId.Length >= 4
                        ? osId.Substring(0, 4).ToLower()
                        : "xxxx";

                    var machineIdentity = $"{safeUser}_{shortOsId}";
                    job.ExecutedOn = $"machine_{safeUser}_{shortOsId}"; ;
                    job.ExecutedBy = user != null
                        ? $"{user.FirstName} {user.LastName}"
                        : "Unknown User";
                }
            }

            // Update job's metadata before starting execution
            job.Status = JobStatusEnum.Running;
            job.StartTime = DateTimeOffset.UtcNow;
            unitOfWork.JobRepo.Update(job);

            // Error: Failed to save the job start status
            if (!await unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Context SaveChanges failed while updating job status to Running for background flow execution. JobId: {JobId}", flowExecutionArgs.JobId);
                return;
            }

            // Initialize the FlowProcessor with NodeProcessor and execute the flow
            var initialVariables = new Dictionary<string, object?>
            {
                ["_agent"] = new FlowMetadata
                {
                    Id = flowExecutionArgs.FlowVersionId,
                    Name = flowExecutionArgs.FlowName
                },
                ["_caller"] = new CallerContext
                {
                    UserId = flowExecutionArgs.UserId,
                    TenantId = flowExecutionArgs.TenantId,
                    AccessToken = flowExecutionArgs.AccessToken ?? string.Empty
                },
                ["_job"] = new JobContext
                {
                    Id = job.Id,
                    InputArguments = ParseJobInputArguments(job.InputArgumentsJson)
                }
            };

            // Parse InputArgumentsJson and inject chat-specific variables when triggeredBy == "chat"
            InjectChatVariables(job.InputArgumentsJson, initialVariables);

            var flowProcessor = new FlowProcessor(new NodeProcessor());
            var flowResult = await flowProcessor.ExecuteAsync(flowExecutionArgs.FlowData, initialVariables);

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
                _logger.LogWarning("Context SaveChanges failed while persisting final flow execution status for job. JobId: {JobId}", flowExecutionArgs.JobId);
            }
            else
            {
                // Send real-time notification to the user about job completion
                await executionNotificationService.NotifyExecutionCompletedAsync(flowExecutionArgs.UserId, flowExecutionArgs.JobId, job.Status);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error while running background flow execution. JobId: {JobId}", flowExecutionArgs.JobId);
            await MarkJobAsFailedAsync(flowExecutionArgs.JobId, flowExecutionArgs.TenantId, flowExecutionArgs.UserId, ex.Message);
        }
    }

    // Synchronous flow execution: awaits completion and returns the FlowExecutionResult.
    // Used for chat-triggered flows where the caller needs the output inline.
    public async Task<FlowExecutionResult> StartExecutionAndWaitAsync(FlowExecutionArgs flowExecutionArgs)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();

            var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
            currentTenantService.CurrentTenantId = flowExecutionArgs.TenantId;

            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var executionNotificationService = scope.ServiceProvider.GetRequiredService<IExecutionNotificationService>();

            var job = await unitOfWork.JobRepo.GetByConditionAsync(w => w.Id == flowExecutionArgs.JobId).SingleOrDefaultAsync();

            if (job is null)
            {
                _logger.LogWarning("Synchronous flow execution skipped because job was not found. JobId: {JobId}", flowExecutionArgs.JobId);
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
            job.Status = JobStatusEnum.Running;
            job.StartTime = DateTimeOffset.UtcNow;
            unitOfWork.JobRepo.Update(job);

            if (!await unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Context SaveChanges failed while updating job status to Running for synchronous flow execution. JobId: {JobId}", flowExecutionArgs.JobId);
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
                ["_agent"] = new FlowMetadata
                {
                    Id = flowExecutionArgs.FlowVersionId,
                    Name = flowExecutionArgs.FlowName
                },
                ["_caller"] = new CallerContext
                {
                    UserId = flowExecutionArgs.UserId,
                    TenantId = flowExecutionArgs.TenantId,
                    AccessToken = flowExecutionArgs.AccessToken ?? string.Empty
                },
                ["_job"] = new JobContext
                {
                    Id = job.Id,
                    InputArguments = ParseJobInputArguments(job.InputArgumentsJson)
                }
            };

            // Parse InputArgumentsJson and inject chat-specific variables when triggeredBy == "chat"
            InjectChatVariables(job.InputArgumentsJson, initialVariables);

            var flowProcessor = new FlowProcessor(new NodeProcessor());
            var flowResult = await flowProcessor.ExecuteAsync(flowExecutionArgs.FlowData, initialVariables);

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
                _logger.LogWarning("Context SaveChanges failed while persisting final flow execution status for job. JobId: {JobId}", flowExecutionArgs.JobId);
            }
            else
            {
                await executionNotificationService.NotifyExecutionCompletedAsync(flowExecutionArgs.UserId, flowExecutionArgs.JobId, job.Status);
            }

            return flowResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error while running synchronous flow execution. JobId: {JobId}", flowExecutionArgs.JobId);
            await MarkJobAsFailedAsync(flowExecutionArgs.JobId, flowExecutionArgs.TenantId, flowExecutionArgs.UserId, ex.Message);

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
                    // if (outputProp.ValueKind == System.Text.Json.JsonValueKind.Object &&
                    //     outputProp.TryGetProperty("raw_text", out var rawTextProp) &&
                    //     rawTextProp.ValueKind == System.Text.Json.JsonValueKind.String)
                    // {
                    //     return rawTextProp.GetString() ?? string.Empty;
                    // }

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
            var executionNotificationService = scope.ServiceProvider.GetRequiredService<IExecutionNotificationService>();

            var job = await unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobId)
                .SingleOrDefaultAsync();

            if (job is null)
            {
                return;
            }

            job.Status = JobStatusEnum.Failed;
            job.EndTime = DateTimeOffset.UtcNow;
            job.OutputDataJson = System.Text.Json.JsonSerializer.Serialize(new { ErrorMessage = errorMessage });

            unitOfWork.JobRepo.Update(job);
            if (await unitOfWork.SaveAsync())
            {
                // Send real-time notification to the user about job failure
                await executionNotificationService.NotifyExecutionCompletedAsync(userId, jobId, JobStatusEnum.Failed, errorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update failure status for background flow execution job. JobId: {JobId}", jobId);
        }
    }

    // Helper: Parses InputArgumentsJson and returns it as a System.Text.Json.Nodes.JsonNode for JobContext.InputArguments.
    // Handles double-encoded JSON (stored via JsonNode.ToJsonString()) the same way InjectChatVariables does.
    private static System.Text.Json.Nodes.JsonNode? ParseJobInputArguments(string? inputArgumentsJson)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(inputArgumentsJson))
                return null;

            var jsonContent = inputArgumentsJson.Trim();

            // Unwrap double-encoded JSON (e.g. stored as a JSON string literal)
            if (jsonContent.StartsWith("\""))
            {
                jsonContent = System.Text.Json.JsonSerializer.Deserialize<string>(jsonContent) ?? string.Empty;
                if (string.IsNullOrWhiteSpace(jsonContent))
                    return null;
            }

            return System.Text.Json.Nodes.JsonNode.Parse(jsonContent);
        }
        catch
        {
            return null;
        }
    }

    // Helper: Maps the flow execution status to the corresponding job status
    private static JobStatusEnum MapFlowStatusToJobStatus(FlowExecutionStatus status)
    {
        return status switch
        {
            FlowExecutionStatus.Completed => JobStatusEnum.Completed,
            FlowExecutionStatus.Aborted => JobStatusEnum.Aborted,
            _ => JobStatusEnum.Failed,
        };
    }

}
