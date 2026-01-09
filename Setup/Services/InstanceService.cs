namespace AccountsAPIs.Services;

public class InstanceService : IInstanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<InstanceService> _logger;
    private readonly InstanceConfig _instanceConfig;
    private readonly AppRuntimeSettings _appRuntimeSettings;
    private readonly HttpClientUrlConfig _httpClientUrlConfig;
    private readonly IHostEnvironment _hostEnvironment;

    public InstanceService(IUnitOfWork unitOfWork, ILogger<InstanceService> logger, InstanceConfig instanceConfig, AppRuntimeSettings appRuntimeSettings, HttpClientUrlConfig httpClientUrlConfig, IHostEnvironment hostEnvironment)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _instanceConfig = instanceConfig;
        _appRuntimeSettings = appRuntimeSettings;
        _httpClientUrlConfig = httpClientUrlConfig;
        _hostEnvironment = hostEnvironment;
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
            Type = string.Equals(_hostEnvironment.EnvironmentName, _instanceConfig.Type, StringComparison.OrdinalIgnoreCase) ? "Prod" : "NonProd",
            Source = source,
            Last7DayUsages = new List<ProjectUsageMetricDto>()
        };

        try
        {
            // Log the start of the metric collection process
            _logger.LogInformation("Initiating metric collection for source: {Source}", source);

            // Fetch metrics from the external API
            HttpResponseMessage httpResponse = await RequestExternalAPIUtil.RequestExternalAPI(
                CrudTypesEnum.Read,
                $"{_httpClientUrlConfig.WorkspaceApisBaseUrl}/project/usage",
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
            var externalServiceResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<ServiceResponse<List<ProjectUsageMetricDto>>>(
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

            // Fetch all user data to calculate the user count for each day (up to today)
            var userData = _unitOfWork.AccountUserRepo.GetAllAsync().AsQueryable();

            // For each day's metric, calculate the total number of users up until the given date
            foreach (var data in externalServiceResponse.Data)
            {
                // Fetch the user count for each date (up to today for each date in the Last7DayUsages)
                data.Users = await userData.Where(w => w.CreatedOn.Date <= data.Date).CountAsync();
            }

            // Add the fetched usage data to the `Last7DayUsages` list in the response
            serviceResponse.Data.Last7DayUsages.AddRange(externalServiceResponse.Data);

            // Log the successful completion of data collection
            _logger.LogInformation("Metrics successfully collected for {Source}. Total metrics collected: {Count} entries.", source, externalServiceResponse.Data.Count);
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
            httpClient.DefaultRequestHeaders.Add("X-OnPrem-Instance-Key", $"{_instanceConfig.InstanceKey}");

            // Serialize the InstanceRequestDto to JSON for the POST body
            var jsonContent = new StringContent(
                Newtonsoft.Json.JsonConvert.SerializeObject(instanceRequestDto),
                Encoding.UTF8,
                "application/json"
            );

            // Call the external API to post the metrics
            var httpResponse = await httpClient.PostAsync($"{_httpClientUrlConfig.GlobalAdminApisBaseUrl}/onprem/instance/validate", jsonContent);

            // Check if the response was successful
            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to post metrics to the external API. Status: {StatusCode}, Reason: {ReasonPhrase}",
                    httpResponse.StatusCode,
                    httpResponse.ReasonPhrase
                );
                // Update runtime application settings from the API response
                _appRuntimeSettings.IsLoginDisabled = true;
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

            // Update runtime application settings from the API response
            _appRuntimeSettings.InvalidCheckCount = externalServiceResponse.Data.EnforcementInfo.InvalidCheckCount;
            _appRuntimeSettings.IsExecutionDisabled = externalServiceResponse.Data.EnforcementInfo.IsExecutionDisabled;
            _appRuntimeSettings.IsLoginDisabled = externalServiceResponse.Data.EnforcementInfo.IsLoginDisabled;
            _appRuntimeSettings.ExecutionTimeAllowed = externalServiceResponse.Data.EnforcementInfo.MaxExecutionTime >= 0;
            _appRuntimeSettings.IsContractExpired = DateTimeOffset.UtcNow.Date > externalServiceResponse.Data.ContractInfo.RenewalDate.Date;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while posting metrics: {ExceptionMessage}", ex.Message);
        }
    }
}