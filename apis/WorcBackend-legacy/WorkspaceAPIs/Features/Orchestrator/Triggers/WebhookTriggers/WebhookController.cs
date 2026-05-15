namespace WorkspaceAPIs.Controllers;

/// <summary>
/// Public endpoint for external applications to fire a webhook trigger and poll for job status.
/// No JWT authorization — authentication is performed via X-Api-Key and X-Tenant-Id headers.
/// </summary>
[Route("webhook")]
[ApiController]
public class WebhookController : BaseApiController
{
    private readonly WorkspaceInternalDbContext _dbContext;
    private readonly IJobsExecutorService _jobsExecutorService;
    private readonly ILogger<WebhookController> _logger;

    public WebhookController(
        WorkspaceInternalDbContext dbContext,
        IJobsExecutorService jobsExecutorService,
        ILogger<WebhookController> logger)
    {
        _dbContext = dbContext;
        _jobsExecutorService = jobsExecutorService;
        _logger = logger;
    }

    /// <summary>
    /// Fires a webhook trigger. Creates a job and returns the job ID for polling.
    /// </summary>
    /// <remarks>
    /// Required headers: X-Api-Key, X-Tenant-Id
    /// </remarks>
    [HttpPost("{triggerId}")]
    public async Task<IActionResult> FireWebhook(Guid triggerId, [FromBody] WebhookFireRequestDto? request)
    {
        // ── 1. Read headers ──────────────────────────────────────────────────
        var apiKey = Request.Headers["X-Api-Key"].FirstOrDefault();
        var tenantIdRaw = Request.Headers["X-Tenant-Id"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(tenantIdRaw))
            return PlainTextError(400, "X-Api-Key and X-Tenant-Id headers are required.");

        if (!Guid.TryParse(tenantIdRaw, out var tenantId))
            return PlainTextError(400, "X-Tenant-Id must be a valid GUID.");

        // ── 2. Load trigger (no tenant filter) ──────────────────────────────
        var trigger = await _dbContext.Triggers
            .Include(t => t.TriggerFlowVersions)
            .FirstOrDefaultAsync(t => t.Id == triggerId);

        if (trigger == null)
        {
            _logger.LogWarning("Webhook fire rejected: trigger {TriggerId} not found.", triggerId);
            return PlainTextError(404, "Trigger not found.");
        }

        if (trigger.TriggerType != TriggerTypesEnum.WebhookTrigger)
        {
            _logger.LogWarning("Webhook fire rejected: trigger {TriggerId} is not a webhook trigger.", triggerId);
            return PlainTextError(404, "Trigger not found.");
        }

        // ── 3. Validate tenant ───────────────────────────────────────────────
        if (trigger.TenantId != tenantId)
        {
            _logger.LogWarning("Webhook fire rejected: tenant mismatch for trigger {TriggerId}.", triggerId);
            return PlainTextError(400, "Invalid tenant.");
        }

        // ── 4. Validate disabled state ───────────────────────────────────────
        if (trigger.IsDisabled)
        {
            _logger.LogWarning("Webhook fire rejected: trigger {TriggerId} is disabled.", triggerId);
            return PlainTextError(403, "This webhook trigger is disabled.");
        }

        // ── 5. Deserialize metadata ──────────────────────────────────────────
        WebhookTriggerModel? model;
        try
        {
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
            jsonOptions.Converters.Add(new JsonStringEnumConverter());
            model = System.Text.Json.JsonSerializer.Deserialize<WebhookTriggerModel>(
                trigger.Metadata.RootElement.GetRawText(), jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialize metadata for trigger {TriggerId}.", triggerId);
            return PlainTextError(500, "Internal error reading trigger configuration.");
        }

        if (model == null)
            return PlainTextError(500, "Internal error reading trigger configuration.");

        // ── 6. Validate API key ──────────────────────────────────────────────
        var incomingHash = WebhookTriggerService.HashApiKey(apiKey);
        if (incomingHash != model.ApiKeyHash)
        {
            _logger.LogWarning("Webhook fire rejected: invalid API key for trigger {TriggerId}.", triggerId);
            return PlainTextError(401, "Invalid API key.");
        }

        // ── 7. Optional JSON Schema validation ──────────────────────────────
        if (!string.IsNullOrWhiteSpace(model.ExpectedPayloadSchema) && request?.Payload != null)
        {
            try
            {
                var schema = JSchema.Parse(model.ExpectedPayloadSchema);
                var payload = JObject.Parse(request.Payload!.Value.GetRawText());
                var isValid = payload.IsValid(schema, out IList<string> errors);
                if (!isValid)
                {
                    var errorMessage = "Payload does not match the expected schema. " + string.Join("; ", errors);
                    return PlainTextError(422, errorMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "JSON Schema validation error for trigger {TriggerId}.", triggerId);
                return PlainTextError(422, $"Payload schema validation failed. {ex.Message}");
            }
        }

        // ── 8. Resolve agent (FlowVersion) ──────────────────────────────────
        var flowVersionId = trigger.TriggerFlowVersions?.FirstOrDefault()?.FlowVersionId;
        if (flowVersionId == null || flowVersionId == Guid.Empty)
        {
            _logger.LogWarning("Webhook fire rejected: no agent linked to trigger {TriggerId}.", triggerId);
            return PlainTextError(400, "No agent is linked to this webhook trigger.");
        }

        // ── 9. Create job ───────────────────────────────────────────────────
        var job = new Job
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            FlowVersionId = flowVersionId.Value,
            TriggerType = TriggerTypesEnum.WebhookTrigger,
            RefId = triggerId,
            Status = JobStatusTypesEnum.Created,
            Priority = JobPriorityTypesEnum.Normal,
            InputArgumentsJson = request?.Payload.HasValue == true ? request.Payload.Value.GetRawText() : null,
            CreatedOn = DateTimeOffset.UtcNow
        };

        _dbContext.Jobs.Add(job);
        await _dbContext.SaveChangesAsync();

        // ── 10. Dispatch job execution ───────────────────────────────────────
        _ = Task.Run(async () =>
        {
            try
            {
                await _jobsExecutorService.ExecuteJobCommandAsync(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error dispatching job {JobId} for webhook trigger {TriggerId}.", job.Id, triggerId);
            }
        });

        _logger.LogInformation("Webhook trigger {TriggerId} fired. Job {JobId} created.", triggerId, job.Id);

        return Ok(new WebhookFireResponseDto
        {
            JobId = job.Id,
            Status = job.Status.ToString(),
            PollingUrl = $"/api/webhook/job/{job.Id}"
        });
    }

    /// <summary>
    /// Polls for the current status and output of a job created by a webhook trigger.
    /// </summary>
    /// <remarks>
    /// Required headers: X-Api-Key, X-Tenant-Id
    /// </remarks>
    [HttpGet("job/{jobId}")]
    public async Task<IActionResult> GetJobStatus(Guid jobId)
    {
        // ── 1. Read headers ──────────────────────────────────────────────────
        var apiKey = Request.Headers["X-Api-Key"].FirstOrDefault();
        var tenantIdRaw = Request.Headers["X-Tenant-Id"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(tenantIdRaw))
            return PlainTextError(400, "X-Api-Key and X-Tenant-Id headers are required.");

        if (!Guid.TryParse(tenantIdRaw, out var tenantId))
            return PlainTextError(400, "X-Tenant-Id must be a valid GUID.");

        // ── 2. Load job ──────────────────────────────────────────────────────
        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == jobId);
        if (job == null || job.TenantId != tenantId || job.TriggerType != TriggerTypesEnum.WebhookTrigger)
            return PlainTextError(404, "Job not found.");

        // ── 3. Validate API key against the linked trigger ──────────────────
        if (job.RefId.HasValue)
        {
            var trigger = await _dbContext.Triggers.FirstOrDefaultAsync(t => t.Id == job.RefId.Value);
            if (trigger != null)
            {
                WebhookTriggerModel? model = null;
                try
                {
                    var jsonOptions = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                    };
                    jsonOptions.Converters.Add(new JsonStringEnumConverter());
                    model = System.Text.Json.JsonSerializer.Deserialize<WebhookTriggerModel>(
                        trigger.Metadata.RootElement.GetRawText(), jsonOptions);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to deserialize trigger metadata while polling job {JobId}.", jobId);
                }

                if (model != null)
                {
                    var incomingHash = WebhookTriggerService.HashApiKey(apiKey);
                    if (incomingHash != model.ApiKeyHash)
                        return PlainTextError(401, "Invalid API key.");
                }
            }
        }

        // ── 4. Return status ─────────────────────────────────────────────────
        return Ok(new WebhookJobStatusDto
        {
            JobId = job.Id,
            Status = job.Status.ToString(),
            StartTime = job.StartTime,
            EndTime = job.EndTime,
            InputArgumentsJson = job.InputArgumentsJson,
            OutputDataJson = job.OutputDataJson
        });
    }
}
