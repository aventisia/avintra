using MLModelBuilderAPIs.Hubs;

namespace MLModelBuilderAPIs.Services;

public class ExtractViaLLMService : IExtractViaLLMService
{
    private readonly ILogger<ExtractViaLLMService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ExtractViaLLMConfig _extractViaLLMConfig;
    private readonly Guid _userId;
    private IHubContext<ExtractHub> _extractHub;

    public ExtractViaLLMService(
        ILogger<ExtractViaLLMService> logger,
        IUnitOfWork unitOfWork,
        ExtractViaLLMConfig extractViaLLMConfig,
        IHttpContextAccessor httpContextAccessor,
        IHubContext<ExtractHub> extractHub)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _extractViaLLMConfig = extractViaLLMConfig;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _extractHub = extractHub;
    }

    /// <inheritdoc/>
    public async Task<ServiceResponse<ExtractResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<ExtractResponseDto>
        {
            Data = null,
            Message = "Failed to extract data via LLM.",
        };

        // Create llm model mapper
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
            // Get Model
            var model = await _unitOfWork.MLModelRepo
                                           .GetByConditionAsync(w =>
                                                w.Id == extractRequestDto.ModelId)
                                           .SingleOrDefaultAsync();

            // Model not found
            if (model == null)
            {
                _logger.LogInformation("Model not found for model id: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Model not found";
                return serviceResponse;
            }

            if (string.IsNullOrEmpty(model.GeneratedPrompt))
            {
                _logger.LogInformation("Prompt not found for model id: {ModelId}.", extractRequestDto.ModelId);
                serviceResponse.Message = "Prompt not found for the model";
                return serviceResponse;
            }

            // Create the prompt instruction for the LLM model
            // TODO: We'll have define the context of the files first and the purpose of the extraction to set the right context for the LLM model. This should be set in the model record in the database.
            string context = string.Empty;

            // TODO: We'll have to have an entity to store the instructions for the extraction process which we should be able to update from admin panel for various types of files and extraction purposes.

            // Create a object for extracted data
            var extractedDataList = new List<FileExtractedData>();

            // Start the loop to extract data for each file
            foreach (var fileId in extractRequestDto.FileIds)
            {
                // Initialize the extracted data object
                var extractedData = new FileExtractedData
                {
                    ExtractedData = new ExtractionSetupData(),
                    FileId = fileId,
                    Remarks = $"001: Failed to extract data for file id: {fileId}."
                };

                // Get the file
                var file = await _unitOfWork.UploadedDocRepo
                                           .GetByConditionAsync(w =>
                                                w.Id == fileId)
                                           .SingleOrDefaultAsync();

                // File not found
                if (file == null)
                {
                    _logger.LogInformation("File not found for file id: {fileId}.", fileId);
                    extractedData.Remarks = $"002: Failed, file not found for file id: {fileId}.";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Initialize the variable to store the extracted text
                string fileText = "";

                // Convert file to text
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("API_KEY", _extractViaLLMConfig.LLMPipelineAPIKey);

                    var requestDto = new
                    {
                        pdf_url = file.Path,
                        download = false
                    };

                    var jsonRequest = JsonSerializer.Serialize(requestDto);
                    var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                    HttpResponseMessage response = await client.PostAsync(_extractViaLLMConfig.LLMPipelineAPI, content);

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("003: Failed to extract data for file id: {fileId}.", fileId);
                        extractedDataList.Add(extractedData);
                        continue;
                    }

                    fileText = await response.Content.ReadAsStringAsync();
                }

                // Try 3 times to to call the ollama if we don't get the response
                for (int i = 1; i <= 3; i++)
                {
                    // Send request to LLM model
                    using (HttpClient client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Add("API_KEY", _extractViaLLMConfig.OllamaAPIKey);

                        var requestDto = new
                        {
                            stream = false,
                            prompt = $"{model.GeneratedPrompt}\n\nFile Text:\n{fileText}",
                            model = llmModelMapper.GetValueOrDefault("gemma") // TODO: Change this LLMName
                        };

                        var jsonRequest = JsonSerializer.Serialize(requestDto);
                        var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                        HttpResponseMessage response = await client.PostAsync(_extractViaLLMConfig.OllamaAPI, content);

                        if (!response.IsSuccessStatusCode)
                        {
                            _logger.LogError("004: Failed to extract data for file id: {fileId}.", fileId);
                            continue;
                        }

                        var ollamaResponse = await response.Content.ReadAsStringAsync();

                        // ollamaResponse does not contain "response"
                        if (!ollamaResponse.Contains("response"))
                        {
                            _logger.LogError("005: Failed to extract data for file id: {fileId}.", fileId);
                            continue;
                        }

                        // Deserialize JSON and extract "response"
                        using JsonDocument doc = JsonDocument.Parse(ollamaResponse);
                        var llmResponse = doc.RootElement.GetProperty("response").GetString() ?? "";

                        _logger.LogInformation($"Prompt was: {model.GeneratedPrompt}\n\nFile Text:\n{fileText}");
                        _logger.LogInformation($"Model was: {llmModelMapper.GetValueOrDefault("gemma")}");
                        _logger.LogInformation($"LLM Response was: {llmResponse}");

                        // llmResponse contains <think> tag then remove the full tag content
                        if (llmResponse.Contains("</think>"))
                        {
                            // Remove the full tag content
                            llmResponse = llmResponse.Remove(llmResponse.IndexOf("<think>"), llmResponse.IndexOf("</think>") - llmResponse.IndexOf("<think>") + 8);
                        }

                        // llmResponse contains ```json then remove it
                        if (llmResponse.Contains("```json"))
                        {
                            // Remove the full tag content
                            llmResponse = llmResponse.Remove(llmResponse.IndexOf("```json"), 7);
                        }

                        // llmResponse contains ``` then remove it
                        if (llmResponse.Contains("```"))
                        {
                            // Remove the full tag content
                            llmResponse = llmResponse.Remove(llmResponse.IndexOf("```"), 3);
                        }

                        // Trim the response
                        llmResponse = llmResponse.Trim();

                        // llmResponse is does not contain [
                        if (!llmResponse.Contains("["))
                        {
                            _logger.LogError("005: Failed to extract data for file id: {fileId}.", fileId);
                            continue;
                        }

                        // Successfully extracted the data
                        extractedData = CreateExtractedDataByModel(model.Type, llmResponse, fileId);
                    }

                    // Break the loop
                    break;
                }

                // Add extracted data to the list
                extractedDataList.Add(extractedData);

                //Send extracted data to UI                
                await _extractHub.Clients.User(_userId.ToString()).SendAsync("GetExtractedData", extractedData);
            }

            // Create response object
            var extractResponseDto = new ExtractResponseDto
            {
                ModelId = extractRequestDto.ModelId,
                FilesExtractedData = extractedDataList
            };

            // Task completed successfully
            serviceResponse.Data = extractResponseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(w => w.Remarks.Contains("Failed")) ? "Failed to extract data for one or more files" : "Data extracted successfully";
            _logger.LogInformation(serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError("An exception occurred during file extraction process: {ErrorMessage}.", ex.Message);
        }

        return serviceResponse;
    }

    // Creates a strongly-typed extracted data object based on the specified model type and LLM response.
    private FileExtractedData CreateExtractedDataByModel(ModelTypesEnum model, string llmResponse, Guid fileId)
    {
        // Set up JSON deserialization options (case-insensitive for property names)
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        switch (model)
        {
            // case ModelTypesEnum.QuestionAnswer:
            //     // Deserialize LLM response into question-answer specific data
            //     var questionAnswerData = JsonSerializer.Deserialize<List<QuestionAnswerSetupData>>(llmResponse, options);
            //     return new QuestionAnswerSetupResult
            //     {
            //         FileId = fileId,
            //         // ExtractedData = questionAnswerData ?? new List<QuestionAnswerSetupData>(),
            //         Remarks = ""
            //     };

            case ModelTypesEnum.Classification:
                // Deserialize LLM response into classification data (reuses ExtractionSetupData structure)
                // var classificationData = JsonSerializer.Deserialize<ExtractionSetupData>(llmResponse, options);
                // return new ExtractionSetupResult
                // {
                //     FileId = fileId,
                //     ExtractedData = classificationData ?? new ExtractionSetupData(),
                //     Remarks = ""
                // };

            case ModelTypesEnum.Extraction:
                // Deserialize LLM response into generic extraction data
                var extractionData = JsonSerializer.Deserialize<ExtractionSetupData>(llmResponse, options);
                return new FileExtractedData
                {
                    FileId = fileId,
                    ExtractedData = extractionData ?? new ExtractionSetupData(),
                    Remarks = ""
                };

            default:
                // Handle unsupported model types
                throw new NotSupportedException($"Model type '{model}' is not supported.");
        }
    }
}