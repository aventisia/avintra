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
    public async Task<ServiceResponse<string>> ExtractDataAsync(string prompt, string llmModel, double modelTemperature)
    {
        var serviceResponse = new ServiceResponse<string>()
        {
            Message = "Data extraction failed. Please try again."
        };

        _logger.LogInformation("Initiating data extraction process.");

        // Step 1: Map LLM model identifiers to their corresponding API models
        var llmModelMapper = new Dictionary<string, string>
            {
                {"deepseek-r1", "deepseek-r1:7b"},
                {"phi4", "phi4:14b"},
                {"llama3.1", "llama3.1:8b"},
                {"llama3.2", "llama3.2:3b"},
                {"mistral", "mistral:7b"},
                {"gemma", "gemma:7b"},
            };

        try
        {
            // Step 2: Validate the input parameters
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

            // Step 3: Attempt to send the prompt and extracted text to the LLM API, with retries
            string llmResponse = string.Empty;
            for (int attempt = 1; attempt <= 3; attempt++)
            {
                _logger.LogInformation("Attempt {attempt} of 3 to process the LLM model.", attempt);

                using (HttpClient client = new HttpClient())
                {
                    // Add API key to the HTTP request
                    client.DefaultRequestHeaders.Add("API_KEY", _extractViaLLMConfig.OllamaAPIKey);

                    var requestDto = new
                    {
                        stream = false,
                        temperature = modelTemperature,
                        prompt = prompt,
                        model = llmModelMapper.GetValueOrDefault(llmModel),
                    };

                    var jsonRequest = System.Text.Json.JsonSerializer.Serialize(requestDto);
                    var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                    _logger.LogInformation("Sending request to LLM model: {model}", llmModelMapper.GetValueOrDefault(llmModel));
                    HttpResponseMessage response = await client.PostAsync(_extractViaLLMConfig.OllamaAPI, content);

                    // If the response is unsuccessful, log the error and retry
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("Failed to get a valid response from LLM model. Status Code: {statusCode}", response.StatusCode);
                        continue;
                    }

                    // Parse the LLM API response
                    var ollamaResponse = await response.Content.ReadAsStringAsync();

                    // Check if the response contains the expected field
                    if (!ollamaResponse.Contains("response"))
                    {
                        _logger.LogWarning("LLM response is missing the 'response' field.");
                        continue;
                    }

                    // Step 4: Process and clean the LLM-generated response
                    using JsonDocument doc = JsonDocument.Parse(ollamaResponse);
                    llmResponse = doc.RootElement.GetProperty("response").GetString() ?? "";

                    _logger.LogInformation("Raw LLM response received: {llmResponse}", llmResponse);

                    // Remove known debug or formatting tags from the response
                    if (llmResponse.Contains("</think>"))
                    {
                        llmResponse = llmResponse.Remove(llmResponse.IndexOf("<think>"), llmResponse.IndexOf("</think>") - llmResponse.IndexOf("<think>") + 8);
                        _logger.LogInformation("Removed <think> tag content from response.");
                    }

                    if (llmResponse.Contains("```json"))
                    {
                        llmResponse = llmResponse.Remove(llmResponse.IndexOf("```json"), 7);
                        _logger.LogInformation("Removed ```json tag from response.");
                    }

                    if (llmResponse.Contains("```"))
                    {
                        llmResponse = llmResponse.Remove(llmResponse.IndexOf("```"), 3);
                        _logger.LogInformation("Removed ``` tag from response.");
                    }

                    llmResponse = llmResponse.Trim();  // Clean up any excess whitespace
                    _logger.LogInformation("Final cleaned LLM response: {llmResponse}", llmResponse);

                    break; // Exit the retry loop if the extraction was successful
                }
            }

            // Step 5: Return a successful response
            serviceResponse.Data = llmResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data successfully extracted.";
            _logger.LogInformation("Data extraction completed successfully.");
        }
        catch (Exception ex)
        {
            // Step 6: Handle unexpected errors
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
                    pdf_url = fileUrl,
                    download = false
                };

                var jsonRequest = System.Text.Json.JsonSerializer.Serialize(requestDto);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                _logger.LogInformation("Requesting file text extraction from pipeline for file URL: {fileUrl}", fileUrl);
                HttpResponseMessage response = await client.PostAsync(_extractViaLLMConfig.LLMPipelineAPI, content);

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