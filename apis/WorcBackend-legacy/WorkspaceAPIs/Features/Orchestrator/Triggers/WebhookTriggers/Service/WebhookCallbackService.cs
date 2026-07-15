namespace WorkspaceAPIs.Services;

public class WebhookCallbackService : IWebhookCallbackService
{
    private readonly WorkspaceInternalDbContext _dbContext;
    private readonly ILogger<WebhookCallbackService> _logger;

    public WebhookCallbackService(
        WorkspaceInternalDbContext dbContext,
        ILogger<WebhookCallbackService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SendCallbackAsync(Job job)
    {
        if (job.RefId == null)
            return;

        try
        {
            // Load the linked webhook trigger to get the callback URL
            var trigger = await _dbContext.Triggers
                .FirstOrDefaultAsync(t => t.Id == job.RefId.Value && t.TriggerType == TriggerTypesEnum.Webhook);

            if (trigger == null)
                return;

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
                _logger.LogWarning(ex, "Failed to deserialize webhook trigger metadata for callback (TriggerId: {TriggerId}).", job.RefId);
                return;
            }

            if (model == null || string.IsNullOrWhiteSpace(model.CallbackUrl))
                return;

            var payload = new
            {
                jobId = job.Id,
                triggerId = job.RefId,
                status = job.Status.ToString(),
                startTime = job.StartTime,
                endTime = job.EndTime,
                outputDataJson = job.OutputDataJson,
                inputArgumentsJson = job.InputArgumentsJson
            };

            var jsonBody = System.Text.Json.JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(15);

            var request = new HttpRequestMessage(HttpMethod.Post, model.CallbackUrl)
            {
                Content = new StringContent(jsonBody, Encoding.UTF8, "application/json")
            };

            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Webhook callback to {CallbackUrl} for job {JobId} returned HTTP {StatusCode}.",
                    model.CallbackUrl, job.Id, (int)response.StatusCode);
            }
            else
            {
                _logger.LogInformation(
                    "Webhook callback sent successfully to {CallbackUrl} for job {JobId}.",
                    model.CallbackUrl, job.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook callback failed for job {JobId} (TriggerId: {TriggerId}).", job.Id, job.RefId);
        }
    }
}
