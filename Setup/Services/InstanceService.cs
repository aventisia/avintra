namespace AccountsAPIs.Services;

public class InstanceService : IInstanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<InstanceService> _logger;
    private readonly InstanceConfig _instanceConfig;

    public InstanceService(IUnitOfWork unitOfWork, ILogger<InstanceService> logger, InstanceConfig instanceConfig)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _instanceConfig = instanceConfig;
    }

    // Collects and processes metrics such as user count, job execution stats, and other instance-related metrics from an external API.
    public async Task<ServiceResponse<InstanceRequestDto>> CollectMetricsAsync(string source)
    {
        // Initialize the service response with a success status and message
        var serviceResponse = new ServiceResponse<InstanceRequestDto>()
        {
            StatusCode = 200,
            Message = "Metrics collected successfully."
        };

        // Initialize the InstanceRequestDto using the configuration values and prepare for metric collection
        serviceResponse.Data = new InstanceRequestDto()
        {
            Version = _instanceConfig.Version,
            Type = _instanceConfig.Type,
            Source = source,
            Usage = new ProjectUsageMetricDto()
        };

        try
        {
            // Log the start of the metric collection process
            _logger.LogInformation("Initiating metric collection for source: {Source}", source);

            // Fetch the count of users registered on the previous day
            serviceResponse.Data.Usage.Users = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => w.CreatedOn.Date == DateTimeOffset.UtcNow.AddDays(-1).Date)
                .CountAsync();

            _logger.LogInformation("User count for the previous day: {UserCount}", serviceResponse.Data.Usage.Users);

            // Fetch metrics from the external API
            HttpResponseMessage httpResponse = await RequestExternalAPIUtil.RequestExternalAPI(
                CrudTypesEnum.Read,
                $"http://localhost:4001/api/project/usage",
                null);

            // Handle unsuccessful API response
            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to fetch metrics from the external API. Status: {StatusCode}, Reason: {ReasonPhrase}",
                    httpResponse.StatusCode, httpResponse.ReasonPhrase);

                serviceResponse.Message = "Failed to retrieve metrics from external API.";
                return serviceResponse;
            }

            // Deserialize the response content from the external API
            var responseContent = await httpResponse.Content.ReadAsStringAsync();
            var externalServiceResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<ServiceResponse<ProjectUsageMetricDto>>(
                responseContent,
                new Newtonsoft.Json.JsonSerializerSettings
                {
                    MissingMemberHandling = Newtonsoft.Json.MissingMemberHandling.Ignore,
                    ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
                });

            // Validate the external API response
            if (externalServiceResponse.StatusCode != 200 || externalServiceResponse.Data == null)
            {
                _logger.LogError("Deserialization failed or response contains invalid data: {ResponseContent}", responseContent);
                serviceResponse.Message = "Invalid response data from external API.";
                return serviceResponse;
            }

            // Populate the InstanceRequestDto with the fetched data
            serviceResponse.Data.Usage.PublishedAgents = externalServiceResponse.Data.PublishedAgents;
            serviceResponse.Data.Usage.JobsExecuted = externalServiceResponse.Data.JobsExecuted;
            serviceResponse.Data.Usage.TotalExecutionTime = externalServiceResponse.Data.TotalExecutionTime;

            // Log the collected metrics for auditing or debugging purposes
            _logger.LogInformation("Metrics collected successfully: PublishedAgents={PublishedAgents}, JobsExecuted={JobsExecuted}, TotalExecutionTime={TotalExecutionTime}, UsersRegistered={UsersRegistered}",
                serviceResponse.Data.Usage.PublishedAgents,
                serviceResponse.Data.Usage.JobsExecuted,
                serviceResponse.Data.Usage.TotalExecutionTime,
                serviceResponse.Data.Usage.Users);
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the metric collection process
            _logger.LogError("An error occurred while collecting metrics: {ExceptionMessage}", ex.Message);
        }

        // Return the service response, whether successful or containing an error message
        return serviceResponse;
    }

    // Posts the collected metrics to an external API for validation or further processing.
    public async Task PostMetricsToApiAsync(InstanceRequestDto instanceRequestDto)
    {
        try
        {
            // Log the start of posting metrics to the external API
            _logger.LogInformation("Posting metrics to external API for validation.");

            var httpClient = new HttpClient();

            // Add the API Key and Instance details to the headers for authentication
            httpClient.DefaultRequestHeaders.Add("X-OnPrem-Tenant-Id", $"{_instanceConfig.TenantId}");
            httpClient.DefaultRequestHeaders.Add("X-OnPrem-Instance-Key", $"{_instanceConfig.InstanceId}");

            // Serialize the InstanceRequestDto to JSON for the POST body
            var jsonContent = new StringContent(
                Newtonsoft.Json.JsonConvert.SerializeObject(instanceRequestDto),
                Encoding.UTF8,
                "application/json"
            );

            // Call the external API to post the metrics
            var httpResponse = await httpClient.PostAsync("http://localhost:4004/api/onprem/instance/validate", jsonContent);

            // Check if the response was successful
            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to post metrics to the external API. Status: {StatusCode}, Reason: {ReasonPhrase}",
                    httpResponse.StatusCode,
                    httpResponse.ReasonPhrase
                );
                return;
            }

            // Read the response content
            var responseContent = await httpResponse.Content.ReadAsStringAsync();

            // Deserialize the response content into a ServiceResponse object
            var externalServiceResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<ServiceResponse<InstanceResponseDto>>(
                responseContent,
                new Newtonsoft.Json.JsonSerializerSettings
                {
                    MissingMemberHandling = Newtonsoft.Json.MissingMemberHandling.Ignore,
                    ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
                });

            // Check if the response contains valid data
            if (externalServiceResponse.StatusCode != 200 || externalServiceResponse.Data == null)
            {
                _logger.LogError("Failed to deserialize the API response or the data is invalid: {ResponseContent}", responseContent);
            }

            _logger.LogInformation("Metrics posted successfully to the external API.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while posting metrics: {ExceptionMessage}", ex.Message);
        }
    }
}