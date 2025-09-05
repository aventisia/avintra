namespace AspNetToolkit.Services;

public class LLMDataExtractionService : ILLMDataExtractionService
{
    private readonly ILogger<LLMDataExtractionService> _logger;
    private readonly ExtractViaLLMConfig _extractViaLLMConfig;

    public LLMDataExtractionService(ILogger<LLMDataExtractionService> logger, ExtractViaLLMConfig extractViaLLMConfig)
    {
        _logger = logger;
        _extractViaLLMConfig = extractViaLLMConfig;
    }

    // Extracts structured data from a document by retrieving its text and passing it to an LLM for processing.
    public async Task<ServiceResponse<string>> ExtractDataAsync(string prompt, string llmModel, double modelTemperature, object? ollamaOutputFormatSchema = null)
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


                    _logger.LogInformation("Prepared request DTO for LLM model: {ollamaOutputFormatSchema}", System.Text.Json.JsonSerializer.Serialize(ollamaOutputFormatSchema));

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

                    _logger.LogInformation("Raw LLM response received: {llmResponse}", llmResponse);

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
                    _logger.LogInformation("Final cleaned LLM response: {llmResponse}", llmResponse);

                    break; // Exit retry loop if the extraction was successful
                }
            }

            // Step 10: Return a successful response with the extracted data
            serviceResponse.Data = llmResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data successfully extracted.";
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
}