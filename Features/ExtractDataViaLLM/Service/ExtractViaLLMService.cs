namespace MLModelBuilderAPIs.Services;

public class ExtractViaLLMService : IExtractViaLLMService
{
    private readonly ILogger<ExtractViaLLMService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ExtractViaLLMConfig _extractViaLLMConfig;
    private readonly Guid _userId;

    public ExtractViaLLMService(
        ILogger<ExtractViaLLMService> logger,
        IUnitOfWork unitOfWork,
        ExtractViaLLMConfig extractViaLLMConfig,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _extractViaLLMConfig = extractViaLLMConfig;
        _logger = logger;
        _unitOfWork = unitOfWork;
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

            // Get data fields to be extracted
            var dataFields = await _unitOfWork.DataFieldRepo
                                                .GetByConditionAsync(w =>
                                                    w.MLModelId == extractRequestDto.ModelId)
                                                .Select(s => s.Name)
                                                .ToListAsync();

            // Data fields not found
            if (dataFields == null || !dataFields.Any())
            {
                _logger.LogInformation("Data fields not found for model id: {ModelId}.", extractRequestDto.ModelId);
                serviceResponse.Message = "Fields not found for the model";
                return serviceResponse;
            }

            // Create the prompt instruction for the LLM model
            // TODO: We'll have define the context of the files first and the purpose of the extraction to set the right context for the LLM model. This should be set in the model record in the database.
            string context = "";

            // TODO: We'll have to have an entity to store the instructions for the extraction process which we should be able to update from admin panel for various types of files and extraction purposes.
            string instructions = "Extract the following fields from the file text:";
            string fieldNames = string.Join(", ", dataFields);
            string format = "Please provide the final output strictly in JSON format. Use the structure: [{\"fieldName\": \"field_name\", \"fieldValue\": \"field_value\"}]. Do not include any additional text or information beyond the JSON data.";

            // Create a object for extracted data
            var extractedDataList = new List<FileExtractedData>();

            // Start the loop to extract data for each file
            foreach (var fileId in extractRequestDto.FileIds)
            {
                // Initialize the extracted data object
                var extractedData = new FileExtractedData
                {
                    FileId = fileId,
                    ExtractedData = new List<FieldValueSchema>(),
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
                        //pdf_url = file.Path,
                        pdf_url = @"C:\My Space\PLAYGROUND\test.pdf",
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

                // Send request to LLM model
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("API_KEY", _extractViaLLMConfig.OllamaAPIKey);

                    var requestDto = new
                    {
                        stream = false,
                        prompt = $"{instructions}\n\nFields: {fieldNames}\n\nFormat: {format}\n\nFile Text:\n{fileText}",
                        model = llmModelMapper.GetValueOrDefault(model.LLM) // TODO: Change this LLMName
                    };

                    var jsonRequest = JsonSerializer.Serialize(requestDto);
                    var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                    HttpResponseMessage response = await client.PostAsync(_extractViaLLMConfig.OllamaAPI, content);

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("004: Failed to extract data for file id: {fileId}.", fileId);
                        extractedDataList.Add(extractedData);
                        continue;
                    }

                    var ollamaResponse = await response.Content.ReadAsStringAsync();

                    // ollamaResponse does not contain "response"
                    if (!ollamaResponse.Contains("response"))
                    {
                        _logger.LogError("005: Failed to extract data for file id: {fileId}.", fileId);
                        extractedDataList.Add(extractedData);
                        continue;
                    }

                    // Deserialize JSON and extract "response"
                    using JsonDocument doc = JsonDocument.Parse(ollamaResponse);
                    var llmResponse = doc.RootElement.GetProperty("response").GetString() ?? "";

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
                        extractedDataList.Add(extractedData);
                        continue;
                    }
                    
                    // Deserialize JSON and extract "response"
                    var extractedDataListTemp = JsonSerializer.Deserialize<List<FieldValueSchema>>(llmResponse) ?? new List<FieldValueSchema>();

                    // Check if extractedDataListTemp is empty
                    if (extractedDataListTemp.Count == 0)
                    {
                        _logger.LogError("006: Failed to extract data for file id: {fileId}.", fileId);
                        extractedDataList.Add(extractedData);
                        continue;
                    }

                    extractedData.ExtractedData = extractedDataListTemp;
                }

                // Add extracted data to the list
                extractedDataList.Add(extractedData);
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
}
