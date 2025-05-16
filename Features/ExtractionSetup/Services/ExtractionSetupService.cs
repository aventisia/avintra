
namespace MLModelBuilderAPIs.Services;

public class ExtractionSetupService : IExtractionSetupService
{
    private readonly ILogger<ExtractionSetupService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ExtractionSetupService(
        ILogger<ExtractionSetupService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieve the user ID from the HTTP context and initialize the logger and unit of work
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Initialize a new extraction setup record
    public string CreateSerializedExtractionSetup()
    {
        // Define the default prompt for extraction logic
        var defaultPrompt = "You are an expert extraction algorithm.\n" +
                           "Only extract relevant information from the text.\n" +
                           "If you do not know the value of an attribute asked to extract, you may omit the attribute's value.";

        // Construct a default extraction setup
        var defaultExtractionSetup = new ExtractionSetupDto
        {
            DocumentContext = string.Empty,
            NodePrompt = defaultPrompt,
            TableMetadata = null,
            FieldSetups = new List<FieldSetupDto>
            {
                new FieldSetupDto
                {
                    Name = string.Empty,
                    Type = string.Empty,
                    Instructions = string.Empty
                }
            }
        };

        // Serialize the setup to a JSON string
        return JsonSerializer.Serialize(defaultExtractionSetup);
    }

    // Method to update an existing extraction setup record
    public async Task<ServiceResponse<MLModelSetupDto>> UpdateExtractionSetupAsync(MLModelSetupDto mLModelSetupDto)
    {
        // Initialize the service response with a failure state and default message
        var serviceResponse = new ServiceResponse<MLModelSetupDto>
        {
            Data = null,
            Message = "Failed to update extraction setup. Please try again later."
        };

        try
        {
            // Log the start of the update operation, including the relevant identifiers
            _logger.LogInformation("Update process initiated | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);

            // Retrieve the existing extraction setup from the database by ID
            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mLModelSetupDto.Id)
                .SingleOrDefaultAsync();

            // Check if the setup was not found and return an appropriate message
            if (mLModel == null)
            {
                _logger.LogWarning("Extraction setup not found | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
                serviceResponse.Message = "Extraction setup not found. The provided setup ID does not exist.";
                return serviceResponse;
            }

            // Trim any unnecessary spaces or formatting from string fields in the DTO
            mLModelSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mLModelSetupDto);

            // Log the mapping process from DTO to entity
            mLModelSetupDto.Adapt(mLModel);
            mLModel.GeneratedPrompt = GenerateExtractionModelPrompt(mLModelSetupDto);
            mLModel.LastModifiedByUserId = _userId;

            // Log the action of saving changes to the database
            _logger.LogInformation("Saving the updated extraction setup to the database | ML Model Setup ID: {Id}", mLModelSetupDto.Id);
            _unitOfWork.MLModelRepo.Update(mLModel);

            // Attempt to persist the changes and check for success
            if (!await _unitOfWork.SaveAsync())
            {
                // Log an error if the database save operation fails
                _logger.LogError("Failed to save changes to the database | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
                return serviceResponse;
            }

            // Log success upon successful update
            _logger.LogInformation("Extraction setup update completed successfully | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);

            // Set the response data with the updated DTO and indicate successful completion
            serviceResponse.Data = mLModel.Adapt<MLModelSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup updated successfully.";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the process
            _logger.LogError(ex, "Exception occurred during extraction setup update | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Generates a prompt string used to guide the ML model for extracting data from documents, based on the provided model setup.
    private string? GenerateExtractionModelPrompt(MLModelSetupDto mlModelSetupDto)
    {
        // Extract field names for reference (optional use)
        string fieldNames = string.Join(", ", mlModelSetupDto.SetupObject?.FieldSetups?.Select(f => f.Name) ?? Enumerable.Empty<string>());

        var promptBuilder = new StringBuilder();

        // Add the base instruction or use the provided NodePrompt
        promptBuilder.AppendLine(!string.IsNullOrEmpty(mlModelSetupDto.SetupObject?.NodePrompt)
            ? mlModelSetupDto.SetupObject.NodePrompt.Trim()
            : "You are an expert data extraction algorithm. Your task is to accurately extract relevant data from the provided document.");

        // Section: Field extraction instructions
        if (mlModelSetupDto.SetupObject?.FieldSetups != null && mlModelSetupDto.SetupObject.FieldSetups.Any())
        {
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Fields (Single-value attributes):");
            promptBuilder.AppendLine("The following fields need to be extracted:");

            for (int i = 0; i < mlModelSetupDto.SetupObject.FieldSetups.Count; i++)
            {
                var field = mlModelSetupDto.SetupObject.FieldSetups[i];
                var instructions = string.IsNullOrEmpty(field.Instructions) ? "" : $", - {field.Instructions}";

                promptBuilder.AppendLine($"- {i + 1}. {field.Name} (type: {field.Type}){instructions}");
            }
        }

        // Section: Table extraction instructions
        if (mlModelSetupDto.SetupObject?.TableMetadata != null && mlModelSetupDto.SetupObject.TableMetadata.Any())
        {
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Tables:");
            promptBuilder.AppendLine("For each table, extract the relevant column data as per the instructions provided.");

            foreach (var table in mlModelSetupDto.SetupObject.TableMetadata)
            {
                promptBuilder.AppendLine();
                promptBuilder.AppendLine($"Table name: {table.Name}{(string.IsNullOrEmpty(table.Context) ? "" : $", context - {table.Context}")}");
                promptBuilder.AppendLine("Following columns need to be extracted:");

                if (table.TableHeaders != null)
                {
                    if (table.TableHeaders != null)
                    {
                        for (int i = 0; i < table.TableHeaders.Count; i++)
                        {
                            var column = table.TableHeaders[i];
                            var instructions = string.IsNullOrEmpty(column.Instructions) ? "" : $", - {column.Instructions}";
                            promptBuilder.AppendLine($"{i + 1}. {column.Name} (type: {column.Type}){instructions}");
                        }
                    }
                }
            }
        }

        // Future enhancement placeholder
        // TODO: Add extraction rules if any

        // Section: Output format specification
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("Expected Output Format:");
        promptBuilder.AppendLine("The output must be formatted as a JSON object with two primary sections:");
        promptBuilder.AppendLine("{");
        promptBuilder.AppendLine("  \"fields\": [");
        promptBuilder.AppendLine("    {\"fieldName\": \"field_name\", \"fieldValue\": \"field_value\"},");
        promptBuilder.AppendLine("    {\"fieldName\": \"another_field\", \"fieldValue\": \"another_value\"}");
        promptBuilder.AppendLine("  ],");
        promptBuilder.AppendLine("  \"tables\": [");
        promptBuilder.AppendLine("    {");
        promptBuilder.AppendLine("      \"tableName\": \"table_name\",");
        promptBuilder.AppendLine("      \"rows\": [");
        promptBuilder.AppendLine("        [\"col1_value\", \"col2_value\", \"col3_value\"],");
        promptBuilder.AppendLine("        [\"col1_value_2\", \"col2_value_2\", \"col3_value_2\"]");
        promptBuilder.AppendLine("      ]");
        promptBuilder.AppendLine("    }");
        promptBuilder.AppendLine("  ]");
        promptBuilder.AppendLine("}");

        // Notes and final instruction
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("Important Notes:");
        promptBuilder.AppendLine("- Ensure there are no additional comments or text outside of the JSON structure.");
        promptBuilder.AppendLine("- If a field or table cannot be extracted, omit it from the output entirely.");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("Remember, the key is accuracy and precision. Only extract what is explicitly stated in the document text.");

        // Convert to single-line format by replacing line breaks
        return promptBuilder.ToString().Replace("\n", " ");
    }

    public async Task<ServiceResponse<MLModelSetupDto>> GetExtractionSetupByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<MLModelSetupDto>
        {
            Data = null,
            Message = "Failed to retrieve the extraction setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process
            _logger.LogInformation("Attempting to retrieve extraction setup for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the extraction setup based on the provided ML model ID and map it to the DTO
            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If no setup is found, log a warning and return a message
            if (mLModel == null)
            {
                _logger.LogWarning("No extraction setup found for ML model with ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No extraction setup exists for the provided ML model ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the setup
            _logger.LogInformation("Successfully retrieved extraction setup for ML model with ID: {MLModelId}", mlModelId);

            // Set the successful response data
            serviceResponse.Data = mLModel.Adapt<MLModelSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while retrieving extraction setup for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        return serviceResponse;
    }
}
