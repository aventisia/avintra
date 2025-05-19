
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
        // Initialize a StringBuilder to build the default prompt string
        var defaultPrompt = new StringBuilder();

        // Add the base instruction or use the provided NodePrompt from the setup object
        // If mlModelSetupDto.SetupObject.Prompt is not null or empty, it will be used. Otherwise, a default message is added.
        defaultPrompt.AppendLine(!string.IsNullOrEmpty(mlModelSetupDto.SetupObject?.Prompt)
            ? mlModelSetupDto.SetupObject.Prompt.Trim()
            : "You are an expert data extraction algorithm. Your task is to accurately extract relevant data from the provided document.");

        // Initialize a StringBuilder for storing field extraction instructions
        var fieldInstruction = new StringBuilder();

        // Section: Field extraction instructions
        if (mlModelSetupDto.SetupObject?.FieldSetups != null && mlModelSetupDto.SetupObject.FieldSetups.Any())
        {
            // Iterate through the list of field setups in the model setup object
            for (int i = 0; i < mlModelSetupDto.SetupObject.FieldSetups.Count; i++)
            {
                var field = mlModelSetupDto.SetupObject.FieldSetups[i];

                // If there are specific instructions for the field, append them, otherwise leave it blank
                var instructions = string.IsNullOrEmpty(field.Instructions) ? "" : $", - {field.Instructions}";

                // Append each field's details, including its name, type, and instructions if available
                fieldInstruction.AppendLine($"- {i + 1}. {field.Name} (type: {field.Type}){instructions}");
            }
        }

        // Initialize a StringBuilder for storing table extraction instructions
        var tableInstruction = new StringBuilder();

        // Section: Table extraction instructions
        if (mlModelSetupDto.SetupObject?.TableMetadata != null && mlModelSetupDto.SetupObject.TableMetadata.Any())
        {
            // Iterate through the list of table metadata in the model setup object
            foreach (var table in mlModelSetupDto.SetupObject.TableMetadata)
            {
                // Add a new line and display table name with optional context if available
                tableInstruction.AppendLine();
                tableInstruction.AppendLine($"Table name: {table.Name}{(string.IsNullOrEmpty(table.Context) ? "" : $", context - {table.Context}")}");
                tableInstruction.AppendLine("Please extract following columns:");

                // Check if table headers exist and loop through them to extract column info
                if (table.TableHeaders != null)
                {
                    for (int i = 0; i < table.TableHeaders.Count; i++)
                    {
                        var column = table.TableHeaders[i];

                        // Append instructions for the column, if any
                        var instructions = string.IsNullOrEmpty(column.Instructions) ? "" : $", - {column.Instructions}";

                        // Append each column's details, including its name, type, and instructions if available
                        tableInstruction.AppendLine($"{i + 1}. {column.Name} (type: {column.Type}){instructions}");
                    }
                }
            }
        }

        // Load a template file and replace placeholders with the generated prompt sections
        var generatedPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("ExtractionSetup.txt", new Dictionary<string, string>()
                    {
                        // Replace the placeholders {{Prompt}}, {{Fields}}, and {{Tables}} in the template with the respective sections
                        {"{{Prompt}}", defaultPrompt.Replace("\n","").ToString()  },
                        {"{{Fields}}", fieldInstruction.Replace("\n","").ToString() },
                        {"{{Tables}}", tableInstruction.Replace("\n","").ToString() }
                    }
                );

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
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
