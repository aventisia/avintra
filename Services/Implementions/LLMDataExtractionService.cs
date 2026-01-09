namespace AspNetToolkit.Services;

public class LLMDataExtractionService : ILLMDataExtractionService
{
    private readonly ILogger<LLMDataExtractionService> _logger;
    private readonly ExtractViaLLMConfig _extractViaLLMConfig;
    private readonly HttpClientUrlConfig _httpClientUrlConfig;
    private readonly string _jwt;

    public LLMDataExtractionService(
        ILogger<LLMDataExtractionService> logger,
        ExtractViaLLMConfig extractViaLLMConfig,
        IHttpContextAccessor httpContextAccessor,
        HttpClientUrlConfig httpClientUrlConfig)
    {
        _jwt = httpContextAccessor.HttpContext?.Request.Cookies["AccessToken"] ?? httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString().Replace("Bearer ", "") ?? "";

        _logger = logger;
        _extractViaLLMConfig = extractViaLLMConfig;
        _httpClientUrlConfig = httpClientUrlConfig;
    }

    // To check if credits are available to continue.
    public async Task<ServiceResponse<bool>> HasSufficientCreditsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Insufficient credits to continue. Please top up your credits.",
            StatusCode = 400
        };

        try
        {
            // Create credits usage in AccountsDb database
            var response = await RequestExternalAPIUtil.RequestExternalAPI(CrudTypesEnum.Read, $"{_httpClientUrlConfig.AccountsApisBaseUrl}/credit-usage/available-credits", _jwt);
            var responseContent = await response.Content.ReadAsStringAsync();

            // Failed to get available credits
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Failed to retrieve available credits. Response: {response.StatusCode} - {responseContent}");
                return serviceResponse;
            }

            serviceResponse.StatusCode = 200;
            dynamic availableCredits = JsonConvert.DeserializeObject<dynamic>(responseContent) ?? new { data = new { AvailableCredits = 0 } };
            _logger.LogInformation($"Successfully retrieved available credits: {availableCredits.data.availableCredits}");

            if (availableCredits.data.availableCredits <= 10)
            {
                serviceResponse.Message = "Insufficient credits to continue. Please top up your credits.";
                _logger.LogWarning($"Insufficient credits available: {availableCredits.data.availableCredits}");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.Message = "Credits are available to continue.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Extracts structured data from a document by retrieving its text and passing it to an LLM (Large Language Model) for processing.
    public async Task<ServiceResponse<string>> ExtractDataAsync(LLMRequest llmRequest)
    {
        var serviceResponse = new ServiceResponse<string>()
        {
            // Default message when extraction fails
            Message = "Data extraction failed. Please try again later."
        };

        _logger.LogInformation("Starting data extraction process...");

        var startTime = DateTime.UtcNow;
        double totalExecutionTime = 0;
        var inputTokens = 0;
        var inputCachedTokens = 0;
        var outputTokens = 0;
        var outputReasoningTokens = 0;

        try
        {
            // Step 1: Validate the input request parameters
            if (
                llmRequest.Input == null ||
                (llmRequest.Input is string strInput && string.IsNullOrWhiteSpace(strInput)) ||
                (llmRequest.Input is List<LLMMessage> messages && messages.Count == 0))
            {
                serviceResponse.Message = "Prompt or messages are required.";
                _logger.LogWarning("Invalid LLMRequest.Input: Missing or empty prompt/messages.");
                return serviceResponse;
            }

            if (string.IsNullOrEmpty(llmRequest.Model))
            {
                serviceResponse.Message = "LLM model identifier is required.";
                _logger.LogWarning("Missing or empty LLM model identifier.");
                return serviceResponse;
            }

            // Initialize LLM response to an empty string
            string llmResponse = string.Empty;

            // Step 3: Attempt data extraction with retry logic (up to 3 attempts)
            for (int attempt = 1; attempt <= 3; attempt++)
            {
                _logger.LogInformation("Attempt {Attempt} of 3 to process LLM model for data extraction.", attempt);

                using (HttpClient client = new HttpClient())
                {
                    // Set timeout to 3 minutes to ensure the process does not hang indefinitely
                    client.Timeout = TimeSpan.FromMinutes(3);

                    try
                    {
                        // Send request to LLM API for chat completion and capture the response
                        var apiResponse = await GetChatCompletionAsync(client, llmRequest);

                        // Store the model's output in the response
                        llmResponse = apiResponse.Output;

                        // Log success after receiving the LLM response
                        _logger.LogInformation("Received successful response from LLM Pipeline API: {LLMResponse}", llmResponse);

                        // Capture token usage statistics if available
                        inputTokens = apiResponse.InputTokens;
                        outputTokens = apiResponse.OutputTokens;
                        inputCachedTokens = apiResponse.InputCachedTokens;
                        outputReasoningTokens = apiResponse.OutputReasoningTokens;

                        // Log token usage metrics for monitoring purposes
                        _logger.LogInformation(
                            "LLM Token Usage - Input: {InputTokens}, Output: {OutputTokens}, Cached Input: {InputCachedTokens}, Reasoning: {OutputReasoningTokens}",
                            inputTokens, outputTokens, inputCachedTokens, outputReasoningTokens
                        );

                        // Calculate the total execution time for the API call
                        totalExecutionTime = (DateTime.UtcNow - startTime).TotalSeconds;

                        _logger.LogInformation("Total execution time for LLM request: {ExecutionTimeSeconds} seconds", totalExecutionTime);

                        // If the API response is successful, break the loop
                        break;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Attempt {Attempt} failed with error: {ErrorMessage}", attempt, ex.Message);
                    }
                }
            }

            // Step 4: Clean up any unwanted debug or formatting tags from the response
            if (llmResponse.Contains("</think>"))
            {
                // Remove <think> tags and their contents from the response
                llmResponse = llmResponse.Remove(llmResponse.IndexOf("<think>"), llmResponse.IndexOf("</think>") - llmResponse.IndexOf("<think>") + 8);
                _logger.LogInformation("Removed <think> tags and their contents from the response.");
            }

            if (llmResponse.Contains("```json"))
            {
                // Remove the "```json" code block tag
                llmResponse = llmResponse.Remove(llmResponse.IndexOf("```json"), 7);
                _logger.LogInformation("Removed ```json code block tag from the response.");
            }

            if (llmResponse.Contains("```"))
            {
                // Remove any remaining "```" code block tags
                llmResponse = llmResponse.Remove(llmResponse.IndexOf("```"), 3);
                _logger.LogInformation("Removed remaining ``` code block tags from the response.");
            }

            llmResponse = llmResponse.Trim();
            serviceResponse.Data = llmResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data successfully extracted.";
            _logger.LogInformation("Final cleaned LLM response: {llmResponse}", llmResponse);

            // Log detailed token usage for future analysis
            _logger.LogInformation("Token Usage Details - Input Tokens: {inputTokens}, Cached Input Tokens: {inputCachedTokens}, Output Tokens: {outputTokens}, Output Reasoning Tokens: {outputReasoningTokens}",
                inputTokens, inputCachedTokens, outputTokens, outputReasoningTokens);

            // Step 10: Return a successful response with the cleaned extracted data
            _logger.LogInformation("Data extraction completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError("An unexpected error occurred during the extraction process: {ErrorMessage}.", ex.Message);
        }

        return serviceResponse;
    }

    // Retrieves the text content from a file by sending a request to the external LLM pipeline API.
    public async Task<string> GetFileTextAsync(string fileUrl)
    {
        try
        {
            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("API_KEY", _extractViaLLMConfig.LLMPipelineAPIKey);

                var requestDto = new
                {
                    file_url = fileUrl
                };

                var jsonRequest = System.Text.Json.JsonSerializer.Serialize(requestDto);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                _logger.LogInformation("Requesting file text extraction from pipeline for file URL: {fileUrl}", fileUrl);
                HttpResponseMessage response = await client.PostAsync($"{_extractViaLLMConfig.LLMPipelineAPI}/extract-file-text", content);

                // If the response is unsuccessful, log the error and return an empty string
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to retrieve text from the file. StatusCode: {statusCode}, FileURL: {fileUrl}", response.StatusCode, fileUrl);
                    return string.Empty;
                }

                string fileText = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Successfully extracted text from file URL: {fileUrl}", fileUrl);
                return fileText;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("An error occurred while retrieving file text: {error}", ex.Message);
            return string.Empty;
        }
    }

    // Sends a list of messages and LLM configuration to the LLM Pipeline API and retrieves the generated response.
    public async Task<LLMResponse> GetChatCompletionAsync(HttpClient client, LLMRequest lLMRequest)
    {
        try
        {
            _logger.LogInformation("Starting request to LLM Pipeline API...");

            // Add authorization header using the JWT
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_jwt}");

            // Log the request body for debugging
            _logger.LogInformation("LLM Pipeline API request body: {RequestBody}",
                JsonConvert.SerializeObject(lLMRequest));

            // Serialize the request body
            var content = new StringContent(
                JsonConvert.SerializeObject(lLMRequest),
                Encoding.UTF8,
                "application/json"
            );

            // Construct the request URL
            var requestUrl = $"{_httpClientUrlConfig.LlmPipelineApisBaseUrl.TrimEnd('/')}/llm/generate";

            // Send POST request to the LLM Pipeline API
            var apiResponse = await client.PostAsync(requestUrl, content);

            // Handle non-successful HTTP responses
            if (!apiResponse.IsSuccessStatusCode)
            {
                var errorResponse = await apiResponse.Content.ReadAsStringAsync();
                _logger.LogError("LLM Pipeline API request failed. Status Code: {StatusCode}. Response: {Response}", apiResponse.StatusCode, errorResponse);
                return new LLMResponse();
            }

            // Read the response content
            var responseString = await apiResponse.Content.ReadAsStringAsync();

            // Deserialize JSON into LLMResponse
            var llmResponse = System.Text.Json.JsonSerializer.Deserialize<LLMResponse>(
                responseString,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new LLMResponse();

            _logger.LogInformation("Received response from LLM Pipeline API successfully.");

            return llmResponse;
        }
        catch (Exception ex)
        {
            // Log any unexpected errors
            _logger.LogError(ex, "An exception occurred while sending request to LLM Pipeline API: {Message}", ex.Message
            );
            return new LLMResponse();
        }
    }
}