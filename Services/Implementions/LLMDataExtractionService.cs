namespace AspNetToolkit.Services;

public class LLMDataExtractionService : ILLMDataExtractionService
{
    private readonly ILogger<LLMDataExtractionService> _logger;
    private readonly ExtractViaLLMConfig _extractViaLLMConfig;
    private readonly OpenAIConfig _openAIConfig;
    private readonly string _jwt;

    public LLMDataExtractionService(
        ILogger<LLMDataExtractionService> logger,
        ExtractViaLLMConfig extractViaLLMConfig,
        OpenAIConfig openAIConfig,
        IHttpContextAccessor httpContextAccessor)
    {
        _jwt = httpContextAccessor.HttpContext?.Request.Cookies["AccessToken"] ?? string.Empty;

        _logger = logger;
        _extractViaLLMConfig = extractViaLLMConfig;
        _openAIConfig = openAIConfig;
    }

    // Extracts structured data from a document by retrieving its text and passing it to an LLM for processing.
    public async Task<ServiceResponse<string>> ExtractDataAsync(string prompt, string llmModel, double modelTemperature, UsageSourceTypesEnum refType, Guid refId, string refName, object? ollamaOutputFormatSchema = null)
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
            { "gpt-4o-mini", "gpt-4o-mini" },
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
            if (string.IsNullOrEmpty(prompt))
            {
                serviceResponse.Message = "Prompt is required.";
                _logger.LogWarning("Prompt is missing or empty.");
                return serviceResponse;
            }

            if (string.IsNullOrEmpty(llmModel))
            {
                serviceResponse.Message = "LLM model is required.";
                _logger.LogWarning("LLM model identifier is missing or empty.");
                return serviceResponse;
            }

            // Initialize llmResponse as an empty string
            string llmResponse = string.Empty;

            // Step 2: Map the provided model identifier to the actual model version
            string? mappedModel = llmModelMapper.GetValueOrDefault(llmModel);

            // If the model identifier is unrecognized, return an error
            if (string.IsNullOrEmpty(mappedModel))
            {
                serviceResponse.Message = $"Unrecognized model identifier: {llmModel}";
                _logger.LogWarning("Invalid model identifier: {llmModel}", llmModel);
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

                    if (mappedModel == "gpt-4o-mini")
                    {
                        // Validate the API key
                        if (string.IsNullOrWhiteSpace(_openAIConfig.OpenAIApiKey))
                        {
                            serviceResponse.Message = "API key is required.";
                            _logger.LogWarning("API key is missing or empty.");

                            // Exit early if API URL is invalid
                            return serviceResponse;
                        }

                        // Validate the API URL
                        if (string.IsNullOrWhiteSpace(_openAIConfig.OpenAIApiUrl) || !Uri.IsWellFormedUriString(_openAIConfig.OpenAIApiUrl, UriKind.Absolute))
                        {
                            serviceResponse.Message = "A valid API URL is required.";
                            _logger.LogWarning("API URL is invalid or not well-formed.");

                            // Exit early if API URL is invalid
                            return serviceResponse;
                        }

                        // Prepare the message list: system prompt (optional) + user input
                        var messageList = new List<Dictionary<string, string>>()
                        {
                            // The system prompt could be included if needed, for example:
                            // new Dictionary<string, string> { { "role", "system" }, { "content", system_prompt } },

                            // User message to be processed by the OpenAI model
                            new Dictionary<string, string>
                            {
                                { "role", "user" },
                                { "content", prompt + " Please provide the response in JSON format only. " + System.Text.Json.JsonSerializer.Serialize(ollamaOutputFormatSchema)}
                            }
                        };

                        _logger.LogInformation("Prepared openai or gemini OutputFormatSchema: {ollamaOutputFormatSchema}", System.Text.Json.JsonSerializer.Serialize(ollamaOutputFormatSchema));

                        // Proceed to fetch chat completion from the OpenAI API
                        var openaiRawResponse = await GetChatCompletionAsync(messageList, mappedModel, client, modelTemperature, ollamaOutputFormatSchema);

                        // Parse the response string into a JsonDocument for easier manipulation of JSON data.
                        using var jsonDoc = JsonDocument.Parse(openaiRawResponse);

                        // Extract the assistant's reply text from the parsed JSON
                        llmResponse = jsonDoc.RootElement
                            .GetProperty("choices")[0]
                            .GetProperty("message")
                            .GetProperty("content")
                            .GetString() ?? "";

                        // Log the successful completion of the request
                        _logger.LogInformation("Successfully received response from OpenAI.{llmResponse}", llmResponse);

                        // Get token usage details if available
                        if (jsonDoc.RootElement.TryGetProperty("usage", out JsonElement usageElement))
                        {
                            inputTokens = usageElement.GetProperty("prompt_tokens").GetInt32();
                            outputTokens = usageElement.GetProperty("completion_tokens").GetInt32();
                            inputCachedTokens = usageElement.GetProperty("prompt_tokens_details").GetProperty("cached_tokens").GetInt32();
                            outputReasoningTokens = usageElement.GetProperty("completion_tokens_details").GetProperty("reasoning_tokens").GetInt32();
                        }

                        // Get total execution time
                        totalExecutionTime = (DateTime.UtcNow - startTime).TotalSeconds;

                        // Add input tokens usage to the credits usage list
                        if (inputTokens > 0)
                        {
                            creditsUsageList.Add(new
                            {
                                serviceType = "Gpt4oMiniInput",
                                consumedUnit = inputTokens,
                                refType = refType.ToString(),
                                refId = refId.ToString(),
                                refName = refName
                            });
                        }

                        // Add output tokens usage to the credits usage list
                        if (outputTokens > 0)
                        {
                            creditsUsageList.Add(new
                            {
                                serviceType = "Gpt4oMiniOutput",
                                consumedUnit = outputTokens,
                                refType = refType.ToString(),
                                refId = refId.ToString(),
                                refName = refName
                            });
                        }

                        break; // Exit retry loop if the extraction was successful
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
                        if (ollamaOutputFormatSchema == null)
                        {
                            requestDto = new
                            {
                                stream = false,
                                prompt,
                                //format = "json",
                                model = mappedModel,
                                options = new
                                {
                                    // seed = 1452692,
                                    temperature = modelTemperature
                                }
                            };
                        }
                        else
                        {
                            requestDto = new
                            {
                                stream = false,
                                prompt,
                                format = ollamaOutputFormatSchema ?? "json",
                                model = mappedModel,
                                options = new
                                {
                                    // seed = 1452692,
                                    temperature = modelTemperature
                                }
                            };
                        }


                        _logger.LogInformation("Prepared ollamaOutputFormatSchema: {ollamaOutputFormatSchema}", System.Text.Json.JsonSerializer.Serialize(ollamaOutputFormatSchema));

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

            // Get total execution time
            totalExecutionTime = (DateTime.UtcNow - startTime).TotalSeconds;

            // Add total execution time usage to the credits usage list
            if (totalExecutionTime > 0)
            {
                creditsUsageList.Add(new
                {
                    serviceType = "AiModelExecution",
                    consumedUnit = totalExecutionTime,
                    refType = refType.ToString(),
                    refId = refId.ToString(),
                    refName = refName
                });
            }

            // Log token usage details
            _logger.LogInformation("Token usage - Input Tokens: {inputTokens}, Input Cached Tokens: {inputCachedTokens}, Output Tokens: {outputTokens}, Output Reasoning Tokens: {outputReasoningTokens}, Total Execution Time (s): {totalExecutionTime}",
                inputTokens, inputCachedTokens, outputTokens, outputReasoningTokens, totalExecutionTime);

            // Create credits usage in AccountsDb database
            HttpResponseMessage creditUsagesResponse = await RequestExternalAPIUtil.RequestExternalAPI(CrudTypesEnum.Create, "http://localhost:4000/api/credit-usage/bulk", _jwt, creditsUsageList);

            // Failed to add credit usage
            if (!creditUsagesResponse.IsSuccessStatusCode)
            {
                string errorContent = await creditUsagesResponse.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to create credit usage records. Response: {creditUsagesResponse.StatusCode} - {errorContent}");
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

    // Retrieves the chat completion from the OpenAI API based on the given list of messages and model.
    public async Task<string> GetChatCompletionAsync(List<Dictionary<string, string>> messageList, string model, HttpClient client, double temperature, object? outputFormatSchema)
    {
        // Validate the input message list before proceeding
        if (messageList == null || messageList.Count == 0)
        {
            _logger.LogWarning("The provided message list is empty.");
            return "The message list is empty. Please provide valid input.";
        }

        try
        {
            // Log the start of the request
            _logger.LogInformation("Starting request to OpenAI API...");

            // Add Authorization header with the API key for authentication
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAIConfig.OpenAIApiKey}");

            // Prepare the request body with necessary parameters (model, messages, etc.)
            var requestBody = new
            {
                model = model, // Specify the model to use for the request (e.g., "gpt-4o-mini")
                messages = messageList, // List of messages including user input and system prompts
                temperature = temperature, // Controls the randomness of the output (0 to 1)
                // response_format = outputFormatSchema != null ? new { type = "json_object" } : null, // Optional: Specify the response format (JSON object if defined)

                // Optional parameters (commented out for now):
                // max_tokens = 5000, // Max number of tokens to generate in the response
                // top_p = 1.0f, // Nucleus sampling: the cumulative probability for token selection
                // frequency_penalty = 0.0f, // Penalize new tokens based on their frequency in the text
                // presence_penalty = 0.0f, // Penalize new tokens based on whether they appear in the text
                // stop = new string[] { "\n" } // Optional: Stop sequence to end the response generation
            };

            _logger.LogInformation("Prepared request body for OpenAI API: {RequestBody}", JsonConvert.SerializeObject(requestBody));

            // Serialize the request body to JSON format for the POST request
            var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");

            // Send the POST request to the OpenAI API asynchronously
            var apiResponse = await client.PostAsync(_openAIConfig.OpenAIApiUrl, content);

            // Check if the response status code is successful (200 OK)
            if (!apiResponse.IsSuccessStatusCode)
            {
                // If the response is not successful, log the error and return the status code
                var errorResponse = await apiResponse.Content.ReadAsStringAsync();
                _logger.LogError($"API request failed with status code {apiResponse.StatusCode}. Response: {errorResponse}");
                return string.Empty;
            }

            // Read and process the response content from the OpenAI API
            var responseString = await apiResponse.Content.ReadAsStringAsync();

            // Return the chat completion text
            return responseString;
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the process
            _logger.LogError($"An error occurred while processing the OpenAI API request: {ex.Message}", ex);
            return string.Empty;
        }
    }
}