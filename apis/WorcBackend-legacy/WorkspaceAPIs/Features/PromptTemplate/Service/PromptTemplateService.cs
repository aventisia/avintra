namespace WorkspaceAPIs.Services;

public class PromptTemplateService : IPromptTemplateService
{
    private readonly ILogger<PromptTemplateService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    public PromptTemplateService(
        ILogger<PromptTemplateService> logger,
        IUnitOfWork unitOfWork,
        ICurrentTenantService currentTenantService,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Method to check if the prompt template name is available
    public async Task<ServiceResponse<TrueFalseResultDto>> IsPromptTemplateNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check prompt template name availability. Please try again."
        };

        try
        {
            // Validate input: ensure template name is not null or empty
            if (string.IsNullOrEmpty(checkAvailabilityDto.UserInput))
            {
                _logger.LogError($"Invalid prompt template name: '{checkAvailabilityDto.UserInput}'. It must start with a letter or underscore and cannot contain spaces or symbols.");
                serviceResponse.Message = $"The name '{checkAvailabilityDto.UserInput}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Check database for existing template with same name (case-insensitive)
            var existingPromptTemplate = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower() &&
                    w.CreatedByUserId == _userId
                )
                .FirstOrDefaultAsync();

            // If duplicate exists → mark as unavailable
            if (existingPromptTemplate != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A prompt template with the same name already exists. Please enter a unique name.";

                _logger.LogWarning("A prompt template with the name '{TemplateName}' already exists for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
                return serviceResponse;
            }

            // If no duplicate → mark as available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Prompt template name is available.";
        }
        catch (Exception ex)
        {
            // Log unexpected errors
            _logger.LogError(ex, "An error occurred while checking the availability of prompt template name '{TemplateName}' for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
        }

        return serviceResponse;
    }

    // Method to retrieve all prompt templates
    public async Task<ServiceResponse<IEnumerable<PromptTemplateTableDto>>> GetAllPromptTemplatesAsync()
    {
        // Initialize response with failure message
        var serviceResponse = new ServiceResponse<IEnumerable<PromptTemplateTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve prompt templates. Please try again later."
        };

        try
        {
            // Fetch templates created by current user, including audit fields
            var promptTemplates = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    (w.AccessType == PromptTemplateAccessTypeEnum.Tenant && w.TenantId == _currentTenantService.CurrentTenantId) ||
                    (w.AccessType == PromptTemplateAccessTypeEnum.Self && w.CreatedByUserId == _currentTenantService.CurrentUserId) ||
                    w.AccessType == PromptTemplateAccessTypeEnum.Public
                )
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Map entities to DTOs
            serviceResponse.Data = promptTemplates.Adapt<IEnumerable<PromptTemplateTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Prompt templates retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching prompt templates for user {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Method to retrieve a specific prompt template by its ID.
    public async Task<ServiceResponse<PromptTemplateTableDto>> GetPromptTemplateAsync(Guid promptTemplateId)
    {
        // Initialize failure response
        var serviceResponse = new ServiceResponse<PromptTemplateTableDto>
        {
            Data = null,
            Message = "Failed to retrieve prompt template. Please try again later."
        };

        try
        {
            // Fetch template by ID including audit users
            var promptTemplate = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    w.Id == promptTemplateId &&
                    (
                        (w.AccessType == PromptTemplateAccessTypeEnum.Tenant && w.TenantId == _currentTenantService.CurrentTenantId) ||
                        (w.AccessType == PromptTemplateAccessTypeEnum.Self && w.CreatedByUserId == _currentTenantService.CurrentUserId) ||
                        w.AccessType == PromptTemplateAccessTypeEnum.Public
                    )
                )
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            // Handle not found case
            if (promptTemplate == null)
            {
                _logger.LogWarning("Prompt template with ID {PromptTemplateId} not found.", promptTemplateId);
                serviceResponse.Message = "Prompt template not found.";
                return serviceResponse;
            }

            // Map to DTO
            serviceResponse.Data = promptTemplate.Adapt<PromptTemplateTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Prompt template retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching prompt template with ID {PromptTemplateId}.", promptTemplateId);
        }

        return serviceResponse;
    }

    // Method to create a new prompt template
    public async Task<ServiceResponse<PromptTemplateTableDto>> InsertPromptTemplateAsync(PromptTemplateTableDto promptTemplateDto)
    {
        // Initialize failure response
        var serviceResponse = new ServiceResponse<PromptTemplateTableDto>
        {
            Data = null,
            Message = "Failed to insert prompt template. Please try again."
        };

        try
        {
            // Check for duplicate template name
            var existingTemplate = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == promptTemplateDto.Name.ToLower() &&
                    w.CreatedByUserId == _userId
                )
                .FirstOrDefaultAsync();

            if (existingTemplate != null)
            {
                _logger.LogWarning("Attempt to insert duplicate prompt template with name {TemplateName}.", promptTemplateDto.Name);

                serviceResponse.Message = "A prompt template with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim all string properties to clean input
            promptTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(promptTemplateDto);

            // Map DTO to entity
            var newPromptTemplate = promptTemplateDto.Adapt<PromptTemplate>();

            // Set audit fields
            newPromptTemplate.CreatedByUserId = _userId;
            newPromptTemplate.LastModifiedByUserId = _userId;

            // Insert into repository
            await _unitOfWork.PromptTemplateRepo.InsertAsync(newPromptTemplate);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("SaveChanges failed when inserting prompt template with name {TemplateName}.", promptTemplateDto.Name);
                return serviceResponse;
            }

            // Map saved entity back to DTO
            serviceResponse.Data = newPromptTemplate.Adapt<PromptTemplateTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Prompt template inserted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting prompt template with name {TemplateName}.", promptTemplateDto.Name);
        }

        return serviceResponse;
    }

    // Method to retrieve a specific prompt template by its name.
    public async Task<ServiceResponse<PromptTemplateTableDto>> GetPromptTemplateByNameAsync(string promptTemplateName)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<PromptTemplateTableDto>
        {
            Data = null,
            Message = "Failed to retrieve prompt template. Please try again later."
        };

        try
        {
            // Fetch template by name (case-insensitive) including audit info
            var promptTemplate = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == promptTemplateName.ToLower() &&
                    w.CreatedByUserId == _userId
                )
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            // Handle not found scenario
            if (promptTemplate == null)
            {
                _logger.LogWarning("Prompt template with name {PromptTemplateName} not found.", promptTemplateName);
                serviceResponse.Message = "Prompt template not found.";
                return serviceResponse;
            }

            // Map entity to DTO
            serviceResponse.Data = promptTemplate.Adapt<PromptTemplateTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Prompt template retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected errors
            _logger.LogError(ex, "Error occurred while fetching prompt template with name {PromptTemplateName}.", promptTemplateName);
        }

        return serviceResponse;
    }


    // Method to update an existing prompt template
    public async Task<ServiceResponse<PromptTemplateTableDto>> UpdatePromptTemplateAsync(PromptTemplateTableDto promptTemplateDto)
    {
        // Initialize failure response
        var serviceResponse = new ServiceResponse<PromptTemplateTableDto>
        {
            Data = null,
            Message = "Failed to update prompt template. Please try again."
        };

        try
        {
            // Fetch existing template by ID (no tracking for update scenario)
            var existingPromptTemplate = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    w.Id == promptTemplateDto.Id &&
                    w.CreatedByUserId == _userId
                )
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // Validate existence
            if (existingPromptTemplate == null)
            {
                _logger.LogWarning("Prompt template with ID {PromptTemplateId} not found for update.", promptTemplateDto.Id);
                serviceResponse.Message = "Prompt template not found.";
                return serviceResponse;
            }

            // Check for duplicate name (excluding current record)
            var duplicatePromptTemplate = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    w.Id != promptTemplateDto.Id &&
                    w.Name.ToLower() == promptTemplateDto.Name.ToLower() &&
                    w.CreatedByUserId == _userId
                )
                .FirstOrDefaultAsync();

            if (duplicatePromptTemplate != null)
            {
                _logger.LogWarning(
                    "Attempt to update prompt template with duplicate name {TemplateName}. User {UserId} tried to update an existing template with the same name.",
                    promptTemplateDto.Name, _userId);

                serviceResponse.Message = "A prompt template with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim string inputs before update
            promptTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(promptTemplateDto);

            // Map updated values onto existing entity
            promptTemplateDto.Adapt(existingPromptTemplate);

            // Update audit fields
            existingPromptTemplate.LastModifiedByUserId = _userId;
            existingPromptTemplate.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update entity in repository
            _unitOfWork.PromptTemplateRepo.Update(existingPromptTemplate);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("SaveChanges failed when updating prompt template with ID {PromptTemplateId}.", promptTemplateDto.Id);
                return serviceResponse;
            }

            // Map updated entity to DTO
            serviceResponse.Data = existingPromptTemplate.Adapt<PromptTemplateTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Prompt template updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating prompt template with ID {PromptTemplateId}.", promptTemplateDto.Id);
        }

        return serviceResponse;
    }


    // Method to delete a prompt template by its ID
    public async Task<ServiceResponse<bool>> DeletePromptTemplateAsync(Guid promptTemplateId)
    {
        // Initialize failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete prompt template. Please try again."
        };

        try
        {
            // Fetch template to delete
            var existingPromptTemplate = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    w.Id == promptTemplateId &&
                    w.CreatedByUserId == _userId
                )
                .SingleOrDefaultAsync();

            // Validate existence
            if (existingPromptTemplate == null)
            {
                _logger.LogWarning("Prompt template with ID {PromptTemplateId} not found for deletion.", promptTemplateId);
                serviceResponse.Message = "Prompt template not found.";
                return serviceResponse;
            }

            // Delete entity
            _unitOfWork.PromptTemplateRepo.Delete(existingPromptTemplate);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("SaveChanges failed when deleting prompt template with ID {PromptTemplateId}.", promptTemplateId);
                return serviceResponse;
            }

            // Success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Prompt template deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting prompt template with ID {PromptTemplateId}.", promptTemplateId);
        }

        return serviceResponse;
    }


    // Deletes multiple prompt templates
    public async Task<ServiceResponse<bool>> DeleteMultiplePromptTemplatesAsync(IEnumerable<Guid> promptTemplateIds)
    {
        // Initialize failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete templates. Please try again."
        };

        try
        {
            // Fetch all templates matching provided IDs
            var templatesToDelete = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    promptTemplateIds.Contains(w.Id) &&
                    w.CreatedByUserId == _userId
                )
                .AsNoTracking()
                .ToListAsync();

            // Validate if any templates exist
            if (templatesToDelete == null || !templatesToDelete.Any())
            {
                _logger.LogWarning(
                    "No prompt templates found for deletion for user {UserId} with template IDs {PromptTemplateIds}.",
                    _userId, string.Join(", ", promptTemplateIds));

                serviceResponse.Message = "No prompt templates found for deletion.";
                return serviceResponse;
            }

            // Delete multiple entities
            _unitOfWork.PromptTemplateRepo.Delete(templatesToDelete);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "Failed to delete templates for user {UserId} with template IDs {PromptTemplateIds}. SaveChanges failed.",
                    _userId, string.Join(", ", promptTemplateIds));

                return serviceResponse;
            }

            // Success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Successfully deleted {templatesToDelete.Count} prompt templates.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "An error occurred while deleting multiple prompt templates for user {UserId} with template IDs {PromptTemplateIds}.",
                _userId, string.Join(", ", promptTemplateIds));
        }

        return serviceResponse;
    }


    // Method to search prompt templates by name
    public async Task<ServiceResponse<IEnumerable<PromptTemplateTableDto>>> SearchPromptTemplatesByNameAsync(string templateName)
    {
        // Initialize failure response
        var serviceResponse = new ServiceResponse<IEnumerable<PromptTemplateTableDto>>
        {
            Data = null,
            Message = "Failed to search prompt templates. Please try again."
        };

        try
        {
            // Validate search input
            if (string.IsNullOrWhiteSpace(templateName))
            {
                _logger.LogWarning("The provided search term is empty or only contains whitespace.");
                serviceResponse.Message = "Search keyword cannot be empty or whitespace.";
                return serviceResponse;
            }

            // Perform case-insensitive search
            var matchedPromptTemplates = await _unitOfWork.PromptTemplateRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower().Contains(templateName.Trim().ToLower()) &&
                    w.CreatedByUserId == _userId
                )
                .ToListAsync();

            // Handle no results
            if (matchedPromptTemplates == null || !matchedPromptTemplates.Any())
            {
                _logger.LogInformation(
                    "No prompt templates found for search term '{TemplateName}' for user {UserId}.",
                    templateName, _userId);

                serviceResponse.Message = "No prompt templates found matching the provided search term.";
                return serviceResponse;
            }

            // Map results to DTO
            serviceResponse.Data = matchedPromptTemplates.Adapt<IEnumerable<PromptTemplateTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{matchedPromptTemplates.Count} prompt template(s) found matching the search term '{templateName}'.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "An error occurred while searching for prompt templates with the search term '{TemplateName}' for user {UserId}.",
                templateName, _userId);
        }

        return serviceResponse;
    }
}