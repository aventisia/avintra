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

    // Extracts structured data from a document by retrieving its text and passing it to an LLM for processing.
    public async Task<ServiceResponse<string>> ExtractDataAsync(LLMRequest llmRequest)
    {
        var serviceResponse = new ServiceResponse<string>()
        {
            // Default failure message
            Message = "Data extraction failed. Please try again."
        };

        _logger.LogInformation("Initiating data extraction process.");

        // Mapping model identifiers to the actual model versions
        var llmModelMapper = new Dictionary<string, string>
        {
            { "deepseek-r1", "deepseek-r1:7b" },
            { "phi4", "phi4:14b" },
            { "llama3.1", "llama3.1:8b" },
            { "llama3.2", "llama3.2:3b" },
            { "mistral", "mistral:7b" },
            { "gemma", "gemma3:12b" },
        };

        var startTime = DateTime.UtcNow;
        double totalExecutionTime = 0;
        var inputTokens = 0;
        var inputCachedTokens = 0;
        var outputTokens = 0;
        var outputReasoningTokens = 0;

        List<object> creditsUsageList = new List<object>();

        try
        {
            // Step 1: Validate input parameters
            if (
                llmRequest.Input == null ||
                (llmRequest.Input is string strInput && string.IsNullOrWhiteSpace(strInput)) ||
                (llmRequest.Input is List<LLMMessage> messages && messages.Count == 0))
            {
                serviceResponse.Message = "Prompt or messages are required.";
                _logger.LogWarning("LLMRequest.Input is missing, empty string, or empty list of messages.");
                return serviceResponse;
            }

            if (string.IsNullOrEmpty(llmRequest.Model))
            {
                serviceResponse.Message = "LLM model is required.";
                _logger.LogWarning("LLM model identifier is missing or empty.");
                return serviceResponse;
            }

            // Initialize llmResponse as an empty string
            string llmResponse = string.Empty;

            // Step 2: Map the provided model identifier to the actual model version
            string? mappedModel = llmModelMapper.GetValueOrDefault(llmRequest.Model);

            // If the model identifier is unrecognized, return an error
            if (string.IsNullOrEmpty(mappedModel))
            {
                serviceResponse.Message = $"Unrecognized model identifier: {llmRequest.Model}";
                _logger.LogWarning("Invalid model identifier: {llmModel}", llmRequest.Model);
                return serviceResponse;
            }

            // Step 3: Attempt data extraction with retries (up to 3 attempts)
            for (int attempt = 1; attempt <= 3; attempt++)
            {
                _logger.LogInformation("Attempt {Attempt} of 3 to process the LLM model.", attempt);

                using (HttpClient client = new HttpClient())
                {
                    // Set timeout to 3 minutes
                    client.Timeout = TimeSpan.FromMinutes(3);

                    // Check if the requested model is in the Ollama list
                    bool isOllamaModel = llmModelMapper.ContainsKey(llmRequest.Model);

                    if (!isOllamaModel)
                    {
                        if (llmRequest.Model == "gpt-4o-mini" || llmRequest.Model == "gpt-4o")
                        {
                            llmRequest.Provider = LLMProviderLiteral.OpenAI.ToString().ToLower();
                        }

                        // Send request to LLM Pipeline API and get chat completion
                        var apiResponse = await GetChatCompletionAsync(client, llmRequest);

                        // Extract the model's generated output
                        llmResponse = apiResponse.Output;

                        // Log successful receipt of response
                        _logger.LogInformation("Successfully received response from LLM Pipeline API: {LLMResponse}", llmResponse
                        );

                        // Capture token usage metrics if available
                        inputTokens = apiResponse.InputTokens;
                        outputTokens = apiResponse.OutputTokens;
                        inputCachedTokens = apiResponse.InputCachedTokens;
                        outputReasoningTokens = apiResponse.OutputReasoningTokens;

                        // Log token usage for monitoring
                        _logger.LogInformation(
                            "LLM Pipeline API token usage - Input: {InputTokens}, Output: {OutputTokens}, " +
                            "Cached Input: {InputCachedTokens}, Reasoning: {OutputReasoningTokens}",
                            inputTokens, outputTokens, inputCachedTokens, outputReasoningTokens
                        );

                        // Calculate total execution time
                        totalExecutionTime = (DateTime.UtcNow - startTime).TotalSeconds;

                        _logger.LogInformation("Total execution time for LLM Pipeline API request: {ExecutionTimeSeconds} seconds", totalExecutionTime);

                        // Exit retry loop after successful extraction
                        break;
                    }
                    else
                    {

                        client.DefaultRequestHeaders.Add("API_KEY", _extractViaLLMConfig.OllamaAPIKey);
                        var baseUri = _extractViaLLMConfig.OllamaAPI; // Get the base URI for the API

                        // Step 4: Get currently loaded models from the API
                        var loadedModelsResponse = await client.GetAsync($"{baseUri}/{OllamaApiRoutes.GetLoadedModels}");
                        if (!loadedModelsResponse.IsSuccessStatusCode)
                        {
                            // Log the full response details
                            var responseContent = await loadedModelsResponse.Content.ReadAsStringAsync();
                            _logger.LogWarning("Failed to get loaded models. StatusCode: {StatusCode}, Headers: {Headers}, Content: {ResponseContent}",
                                loadedModelsResponse.StatusCode,
                                loadedModelsResponse.Headers,
                                responseContent);
                            continue;
                        }

                        // Deserialize the list of loaded models from the response
                        var loadedModels = System.Text.Json.JsonSerializer.Deserialize<OllamaModelResponse>(
                            await loadedModelsResponse.Content.ReadAsStringAsync(), new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            });

                        _logger.LogInformation($"Loaded models: '{string.Join(", ", loadedModels?.Models.Select(s => s.Model) ?? Enumerable.Empty<string>())}'");

                        if (loadedModels != null && !loadedModels.Models.Any(s => s.Model != null && s.Model.Contains(mappedModel)))
                        {
                            // No exact match found — proceed to unload all currently loaded models
                            _logger.LogInformation($"No match found for model: '{mappedModel}'");

                            // Unload any currently loaded models
                            foreach (var modelDetail in loadedModels.Models)
                            {
                                var unloadRequest = new
                                {
                                    model = modelDetail.Model,
                                    keep_alive = 0 // Indicate that the model should be unloaded
                                };

                                // Send the unload request
                                var unloadContent = new StringContent(System.Text.Json.JsonSerializer.Serialize(unloadRequest), Encoding.UTF8, "application/json");
                                var unloadResponse = await client.PostAsync($"{baseUri}/{OllamaApiRoutes.Generate}", unloadContent);

                                if (!unloadResponse.IsSuccessStatusCode)
                                {
                                    _logger.LogWarning("Failed to unload model: {Model}", modelDetail.Model);
                                }
                                else
                                {
                                    _logger.LogInformation("Successfully unloaded model: {Model}", modelDetail.Model);
                                }
                            }
                        }
                        else
                        {
                            _logger.LogInformation($"Loaded models: '{string.Join(", ", loadedModels?.Models.Select(s => s.Model) ?? Enumerable.Empty<string>())}'");
                        }

                        // Step 5: Send the generation request to the model with the prompt and temperature
                        object requestDto;
                        if (!llmRequest.IsJsonOutput)
                        {
                            requestDto = new
                            {
                                stream = false,
                                llmRequest.Input,
                                //format = "json",
                                model = mappedModel,
                                options = new
                                {
                                    // seed = 1452692,
                                    temperature = llmRequest.Temperature
                                }
                            };
                        }
                        else
                        {
                            requestDto = new
                            {
                                stream = false,
                                llmRequest.Input,
                                format = llmRequest.JsonSchema,
                                model = mappedModel,
                                options = new
                                {
                                    // seed = 1452692,
                                    temperature = llmRequest.Temperature
                                }
                            };
                        }

                        _logger.LogInformation("Prepared ollamaOutputFormatSchema: {ollamaOutputFormatSchema}", System.Text.Json.JsonSerializer.Serialize(llmRequest.JsonSchema));

                        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(requestDto), Encoding.UTF8, "application/json");
                        _logger.LogInformation("Sending request to LLM model: {MappedModel}", mappedModel);

                        // Step 6: Send POST request to generate the data from the LLM
                        HttpResponseMessage response = await client.PostAsync($"{baseUri}/{OllamaApiRoutes.Generate}", content);

                        // Step 7: Handle the response from the API
                        if (!response.IsSuccessStatusCode)
                        {
                            _logger.LogError("Failed to get a valid response from LLM model. Status Code: {statusCode}", response.StatusCode);
                            continue;
                        }

                        // Parse the LLM API response
                        var ollamaResponse = await response.Content.ReadAsStringAsync();

                        // Step 8: Ensure the response contains the expected "response" field
                        if (!ollamaResponse.Contains("response"))
                        {
                            _logger.LogWarning("LLM response is missing the 'response' field.");
                            continue;
                        }

                        // Step 9: Process and clean the LLM-generated content
                        using JsonDocument doc = JsonDocument.Parse(ollamaResponse);
                        llmResponse = doc.RootElement.GetProperty("response").GetString() ?? string.Empty;
                    }

                    _logger.LogInformation("Raw LLM response received: {llmResponse}", llmResponse);

                    break; // Exit retry loop if the extraction was successful
                }
            }

            // Clean up known debug or formatting tags from the response
            if (llmResponse.Contains("</think>"))
            {
                // Remove <think> tags and content between them
                llmResponse = llmResponse.Remove(llmResponse.IndexOf("<think>"), llmResponse.IndexOf("</think>") - llmResponse.IndexOf("<think>") + 8);
                _logger.LogInformation("Removed <think> tag content from response.");
            }

            if (llmResponse.Contains("```json"))
            {
                // Remove the "```json" code block tag
                llmResponse = llmResponse.Remove(llmResponse.IndexOf("```json"), 7);
                _logger.LogInformation("Removed ```json tag from response.");
            }

            if (llmResponse.Contains("```"))
            {
                // Remove any remaining "```" code block tag
                llmResponse = llmResponse.Remove(llmResponse.IndexOf("```"), 3);
                _logger.LogInformation("Removed ``` tag from response.");
            }

            llmResponse = llmResponse.Trim(); // Clean up any excess whitespace
            serviceResponse.Data = llmResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = llmResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data successfully extracted.";
            _logger.LogInformation("Final cleaned LLM response: {llmResponse}", llmResponse);

            // Log token usage details
            _logger.LogInformation("Token usage - Input Tokens: {inputTokens}, Input Cached Tokens: {inputCachedTokens}, Output Tokens: {outputTokens}, Output Reasoning Tokens: {outputReasoningTokens} ",
                inputTokens, inputCachedTokens, outputTokens, outputReasoningTokens);
            _logger.LogInformation("Credits usage details prepared: {creditsUsageList}", JsonConvert.SerializeObject(creditsUsageList));

            // Create credits usage in AccountsDb database
            HttpResponseMessage creditUsagesResponse = await RequestExternalAPIUtil.RequestExternalAPI(CrudTypesEnum.Create, $"{_httpClientUrlConfig.AccountsApisBaseUrl}/credit-usage/bulk", _jwt, creditsUsageList);

            // Failed to add credit usage
            if (!creditUsagesResponse.IsSuccessStatusCode)
            {
                string errorContent = await creditUsagesResponse.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to create credit usage records. Response: {creditUsagesResponse.StatusCode} - {errorContent}");
            }
            else
            {
                _logger.LogInformation("Successfully created credit usage records.");
            }

            // Step 10: Return a successful response with the extracted data
            _logger.LogInformation("Data extraction completed successfully.");
        }
        catch (Exception ex)
        {
            // Step 11: Catch unexpected errors and log them
            _logger.LogError("An unexpected error occurred during the extraction process: {ErrorMessage}.", ex.Message);
        }

        // Return the response, which may contain an error message if something went wrong
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