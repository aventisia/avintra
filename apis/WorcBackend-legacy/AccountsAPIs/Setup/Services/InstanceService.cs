namespace AccountsAPIs.Services;

public class InstanceService : IInstanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<InstanceService> _logger;
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly EnvironmentConfig _environmentConfig;

    public InstanceService(
        IUnitOfWork unitOfWork, 
        ILogger<InstanceService> logger, 
        AppDefaultConfig appDefaultConfig, 
        EnvironmentConfig environmentConfig)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _appDefaultConfig = appDefaultConfig;
        _environmentConfig = environmentConfig;
    }

    // Collects and processes metrics such as user count, job execution stats, and other instance-related metrics from an external API.
    public async Task<ServiceResponse<InstanceRequestDto>> CollectMetricsAsync(string source)
    {
        // Initialize the service response with a success status and message
        var serviceResponse = new ServiceResponse<InstanceRequestDto>()
        {
            Data = null,
            Message = "Metrics collected successfully."
        };

        // Initialize the InstanceRequestDto using the configuration values and prepare for metric collection
        serviceResponse.Data = new InstanceRequestDto()
        {
            PlatformVersion = _appDefaultConfig.PlatformVersion,
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
                $"{_environmentConfig.WorcApiBaseUrl}/api/project/usage",
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

            serviceResponse.Message = "Project data collected successfully";
            serviceResponse.StatusCode = 200;

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
            httpClient.DefaultRequestHeaders.Add("X-OnPrem-Tenant-Id", $"{_environmentConfig.OnPremTenantId}");
            httpClient.DefaultRequestHeaders.Add("X-OnPrem-Instance-Key", $"{_environmentConfig.OnPremInstanceKey}");

            // Serialize the InstanceRequestDto to JSON for the POST body
            var jsonContent = new StringContent(
                Newtonsoft.Json.JsonConvert.SerializeObject(instanceRequestDto),
                Encoding.UTF8,
                "application/json"
            );

            // Call the external API to post the metrics
            var httpResponse = await httpClient.PostAsync($"{_appDefaultConfig.GlobalAdminApiBaseUrl}/api/onprem/instance/validate", jsonContent);

            // Check if the response was successful
            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to post metrics to the external API. Status: {StatusCode}, Reason: {ReasonPhrase}",
                    httpResponse.StatusCode,
                    httpResponse.ReasonPhrase
                );
                // Update runtime application settings from the API response
                _environmentConfig.OnPremLoginDisabled = true;
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
            _environmentConfig.OnPremExecutionDisabled = externalServiceResponse.Data.Enforcement.IsExecutionDisabled;
            _environmentConfig.OnPremLoginDisabled = externalServiceResponse.Data.Enforcement.IsLoginDisabled;
            _environmentConfig.OnPremExecutionTimeAllowed = externalServiceResponse.Data.Enforcement.ExecutionTimeAllowed;
            _environmentConfig.OnPremTenantType = externalServiceResponse.Data.Tenant.Type.ToString();
            _environmentConfig.OnPremTenantId = externalServiceResponse.Data.Tenant.TenantId.ToString();
            _environmentConfig.OnPremContractStart = externalServiceResponse.Data.Contract.ContractStartDate.Date;
            _environmentConfig.OnPremContractEnd = externalServiceResponse.Data.Contract.ContractRenewalDate.Date;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while posting metrics: {ExceptionMessage}", ex.Message);
        }
    }
}