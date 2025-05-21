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

    // Extracts structured data from a file by first extracting its text and then passing it to an LLM.
    public async Task<ServiceResponse<string>> ExtractDataAsync(string prompt, string llmModel, string fileUrl)
    {
        var serviceResponse = new ServiceResponse<string>()
        {
            Message = "Failed to extract data. Please try again"
        };

        _logger.LogInformation("Starting ExtractViaLLMAsync method.");

        // Step 1: Define supported LLM model mappings
        var llmModelMapper = new Dictionary<string, string>
        {
            {"deepseek-r1" , "deepseek-r1:7b"},
            {"phi4" , "phi4:14b"},
            {"llama3.1" , "llama3.1:8b"},
            {"llama3.2" , "llama3.2:3b"},
            {"mistral" , "mistral:7b"},
            {"gemma" , "gemma:7b"},
        };

        try
        {
            // Step 2: Validate required inputs
            if (string.IsNullOrEmpty(fileUrl))
            {
                serviceResponse.Message = "File URL is missing.";
                _logger.LogWarning("Validation failed: File URL is missing or null.");
                return serviceResponse;
            }

            if (string.IsNullOrEmpty(prompt))
            {
                serviceResponse.Message = "Prompt is missing.";
                _logger.LogWarning("Validation failed: Prompt is missing or null.");
                return serviceResponse;
            }

            if (string.IsNullOrEmpty(llmModel))
            {
                serviceResponse.Message = "LLM model is missing.";
                _logger.LogWarning("Validation failed: LLM model is missing or null.");
                return serviceResponse;
            }

            // Step 3: Extract plain text from PDF file
            string fileText = await GetFileTextAsync(fileUrl);
            if (string.IsNullOrWhiteSpace(fileText))
            {
                serviceResponse.Message = $"Failed to extract text from file at {fileUrl}.";
                return serviceResponse;
            }

            // Step 4: Send prompt + extracted text to the LLM API with retries
            string llmResponse = string.Empty;
            for (int i = 1; i <= 3; i++)
            {
                _logger.LogInformation("Attempt {attempt} to extract data via LLM model.", i);

                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("API_KEY", _extractViaLLMConfig.OllamaAPIKey);

                    var requestDto = new
                    {
                        stream = false,
                        prompt = $"{prompt}\n\nFile Text:\n{fileText}",
                        model = llmModelMapper.GetValueOrDefault(llmModel)
                    };

                    var jsonRequest = System.Text.Json.JsonSerializer.Serialize(requestDto);
                    var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                    _logger.LogInformation("Sending prompt to LLM model: {model}", llmModelMapper.GetValueOrDefault(llmModel));
                    HttpResponseMessage response = await client.PostAsync(_extractViaLLMConfig.OllamaAPI, content);

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("004: Failed to get response from LLM model for file URL: {fileUrl}. Status Code: {statusCode}", fileUrl, response.StatusCode);
                        continue;
                    }

                    var ollamaResponse = await response.Content.ReadAsStringAsync();

                    if (!ollamaResponse.Contains("response"))
                    {
                        _logger.LogWarning("005: LLM response does not contain expected 'response' field.");
                        continue;
                    }

                    // Step 5: Parse and clean LLM-generated response
                    using JsonDocument doc = JsonDocument.Parse(ollamaResponse);
                    llmResponse = doc.RootElement.GetProperty("response").GetString() ?? "";

                    _logger.LogInformation("Raw LLM response: {llmResponse}", llmResponse);

                    // Remove known debug/formatting tags
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

                    llmResponse = llmResponse.Trim();
                    _logger.LogInformation("Final cleaned LLM response: {llmResponse}", llmResponse);

                    break; // Exit retry loop on success
                }
            }

            // Step 6: Populate and return successful service response
            serviceResponse.Data = llmResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data extracted successfully";
            _logger.LogInformation("LLM data extraction completed successfully.");
        }
        catch (Exception ex)
        {
            // Step 7: Handle any unexpected exceptions
            _logger.LogError("An exception occurred during file extraction process: {ErrorMessage}.", ex.Message);
        }

        return serviceResponse;
    }

    // Retrieves the textual content of a PDF file via the external LLM pipeline API.
    private async Task<string> GetFileTextAsync(string fileUrl)
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

                _logger.LogInformation("Calling LLM pipeline to extract text from file URL: {fileUrl}", fileUrl);
                HttpResponseMessage response = await client.PostAsync(_extractViaLLMConfig.LLMPipelineAPI, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to retrieve file text from pipeline. StatusCode: {statusCode}, FileURL: {fileUrl}", response.StatusCode, fileUrl);
                    return string.Empty;
                }

                string fileText = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("File text extraction succeeded for file URL: {fileUrl}", fileUrl);
                return fileText;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Exception while retrieving file text: {error}", ex.Message);
            return string.Empty;
        }
    }
}
