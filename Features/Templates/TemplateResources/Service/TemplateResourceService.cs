namespace WorkspaceAPIs.Services;

public class TemplateResourceService : ITemplateResourceService
{
    private readonly ILogger<TemplateResourceService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public TemplateResourceService(
        ILogger<TemplateResourceService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract user ID from JWT claims in the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of template resources based on the specified project template ID.
    public async Task<ServiceResponse<IEnumerable<TemplateResourceDto>>> GetTemplateResourcesByProjectTemplateIdAsync(Guid projectTemplateId)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<TemplateResourceDto>>
        {
            Data = null,
            Message = "Failed to retrieve template resources. Please try again."
        };

        try
        {
            // Fetch template resources based on the provided project template ID
            var templateResources = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w =>
                    w.ProjectTemplateId == projectTemplateId &&
                    w.TenantId == _tenantId
                )
                .Include(i => i.ProjectTemplate)
                .ProjectToType<TemplateResourceDto>()
                .ToListAsync();

            // Set success response
            serviceResponse.Data = templateResources;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template resources retrieved successfully.";

            // Log success
            _logger.LogInformation($"Successfully retrieved {templateResources.Count} template resource(s) for ProjectTemplateId: {projectTemplateId}.");
        }
        catch (Exception ex)
        {
            // Log error
            _logger.LogError(ex, $"Error occurred while retrieving template resources for ProjectTemplateId: {projectTemplateId}.");
        }

        // Return final response
        return serviceResponse;
    }


    // Retrieves a template resource by its unique identifier.
    public async Task<ServiceResponse<TemplateResourceDto>> GetTemplateResourceByIdAsync(Guid templateResourceId)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<TemplateResourceDto>
        {
            Data = null,
            Message = "Failed to retrieve template resource. Please try again."
        };

        try
        {
            // Fetch the template resource based on the provided ID
            var resource = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w =>
                    w.Id == templateResourceId &&
                    w.TenantId == _tenantId
                )
                .Include(i => i.ProjectTemplate)
                .SingleOrDefaultAsync();

            // If the resource does not exist, log the info and return
            if (resource == null)
            {
                _logger.LogInformation($"Template resource with Id {templateResourceId} not found.");
                serviceResponse.Message = "Template resource not found.";
                return serviceResponse;
            }

            // Map the entity to DTO
            serviceResponse.Data = resource.Adapt<TemplateResourceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template resource retrieved successfully.";

            _logger.LogInformation($"Successfully retrieved template resource with Id {templateResourceId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving template resource with Id {templateResourceId}");
        }

        return serviceResponse;
    }

    // Inserts a new template resource into the database.
    public async Task<ServiceResponse<TemplateResourceDto>> InsertTemplateResourceAsync(TemplateResourceDto templateResourceDto)
    {
        var serviceResponse = new ServiceResponse<TemplateResourceDto>
        {
            Data = null,
            Message = "Failed to insert template resource. Please try again."
        };

        try
        {
            // Attempt to retrieve the project template based on ID, tenant, and user access
            var projectTemplate = await _unitOfWork.ProjectTemplateRepo
                .GetByConditionAsync(w =>
                    w.Id == templateResourceDto.ProjectTemplateId &&
                    w.TenantId == _tenantId &&
                    w.CreatedByUserId == _userId
                )
                .FirstOrDefaultAsync();

            // If the project template was not found or the user has no access, handle gracefully
            if (projectTemplate == null)
            {
                _logger.LogWarning($"ProjectTemplate not found or access denied. ProjectTemplateId: {templateResourceDto.ProjectTemplateId}, TenantId: {_tenantId}, UserId: {_userId}");
                serviceResponse.Message = "Project template not found or you do not have permission to access it. Please verify the project ID and try again.";
                return serviceResponse;
            }

            // Check if a template resource with the same name already exists for the project template
            var existingResource = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w =>
                    w.ProjectTemplateId == templateResourceDto.ProjectTemplateId &&
                    w.TenantId == _tenantId &&
                    w.CreatedByUserId == _userId &&
                    w.Name.ToLower() == templateResourceDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existingResource != null)
            {
                _logger.LogError($"A template resource with ProjectTemplateId {templateResourceDto.ProjectTemplateId} and name '{templateResourceDto.Name}' already exists.");
                serviceResponse.Message = "A template resource with the given name already exists in the project template.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim string properties
            templateResourceDto = TrimDtoStringPropsUtil.TrimDtoStringProps(templateResourceDto);

            // Map DTO to entity
            var newResourceTemplate = templateResourceDto.Adapt<TemplateResource>();

            // Set audit fields
            newResourceTemplate.TenantId = _tenantId;
            newResourceTemplate.CreatedByUserId = _userId;
            newResourceTemplate.LastModifiedByUserId = _userId;

            // Insert into repository
            await _unitOfWork.TemplateResourceRepo.InsertAsync(newResourceTemplate);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save new template resource.");
                return serviceResponse;
            }

            // Success response
            serviceResponse.Data = newResourceTemplate.Adapt<TemplateResourceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template resource added successfully.";

            _logger.LogInformation($"Template resource added successfully to ProjectTemplateId {newResourceTemplate.ProjectTemplateId} by UserId {newResourceTemplate.CreatedByUserId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while inserting a new template resource.");
        }

        return serviceResponse;
    }

    // Updates the properties of an existing template resource in the database.
    public async Task<ServiceResponse<TemplateResourceDto>> UpdateTemplateResourceAsync(TemplateResourceDto templateResourceDto)
    {
        // Initialize the response object with the default failure state
        var serviceResponse = new ServiceResponse<TemplateResourceDto>
        {
            Data = null,
            Message = "Failed to update template resource. Please try again."
        };

        try
        {
            // Retrieve the existing template resource entity using its Id and ensure it belongs to the current user
            var existingResource = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w => w.Id == templateResourceDto.Id &&
                    w.TenantId == _tenantId &&
                    w.CreatedByUserId == _userId
                )
                .FirstOrDefaultAsync();

            // If the resource doesn't exist, log and return appropriate response
            if (existingResource == null)
            {
                _logger.LogInformation($"Template resource with Id {templateResourceDto.Id} not found.");
                serviceResponse.Message = "Template resource not found.";
                return serviceResponse;
            }

            // Check for uniqueness of resource name under the same template by the same user (excluding current one)
            var resourceWithSameName = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == templateResourceDto.Name.ToLower() &&
                    w.ProjectTemplateId == templateResourceDto.ProjectTemplateId &&
                    w.CreatedByUserId == _userId &&
                    w.Id != templateResourceDto.Id)
                .SingleOrDefaultAsync();

            if (resourceWithSameName != null)
            {
                _logger.LogInformation("Template resource name already exists.");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A template resource with the same name already exists. Please choose a unique name.";
                return serviceResponse;
            }

            // Trim any unnecessary whitespace in string properties
            templateResourceDto = TrimDtoStringPropsUtil.TrimDtoStringProps(templateResourceDto);

            // Update the properties from the DTO
            existingResource.Name = templateResourceDto.Name;
            existingResource.Extension = templateResourceDto.Extension;
            existingResource.Path = templateResourceDto.Path;
            existingResource.Size = templateResourceDto.Size;
            existingResource.LastModifiedByUserId = _userId;

            // Mark entity as updated
            _unitOfWork.TemplateResourceRepo.Update(existingResource);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to update template resource with Id {existingResource.Id}");
                return serviceResponse;
            }

            // Return success response with updated data
            serviceResponse.Data = existingResource.Adapt<TemplateResourceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template resource updated successfully.";

            // Log success
            _logger.LogInformation($"Template resource with Id {existingResource.Id} updated successfully.");
        }
        catch (Exception ex)
        {
            // Log any unexpected exception
            _logger.LogError(ex, $"Exception occurred while updating template resource with Id {templateResourceDto.Id}");
        }

        // Return the final response
        return serviceResponse;
    }

    // Deletes a template resource from the database by its unique identifier.
    public async Task<ServiceResponse<bool>> DeleteTemplateResourceAsync(Guid templateResourceId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete template resource. Please try again."
        };

        try
        {
            var templateResource = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w =>
                    w.Id == templateResourceId &&
                    w.TenantId == _tenantId &&
                    w.CreatedByUserId == _userId
                )
                .SingleOrDefaultAsync();

            if (templateResource == null)
            {
                _logger.LogInformation($"Template resource with Id {templateResourceId} not found.");
                serviceResponse.Message = "Template resource not found.";
                return serviceResponse;
            }

            _unitOfWork.TemplateResourceRepo.Delete(templateResource);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save deletion of template resource with Id {templateResourceId}");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template resource deleted successfully.";
            _logger.LogInformation($"Template resource with Id {templateResourceId} deleted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting template resource with Id {templateResourceId}");
        }

        return serviceResponse;
    }

    // Deletes multiple template resources from the database by their unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteMultipleTemplateResourcesAsync(IEnumerable<Guid> templateResourceIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete template resources. Please try again."
        };

        try
        {
            var templateResources = await _unitOfWork.TemplateResourceRepo
                .GetByConditionAsync(w =>
                    templateResourceIds.Contains(w.Id) &&
                    w.TenantId == _tenantId &&
                    w.CreatedByUserId == _userId
                )
                .ToListAsync();

            if (!templateResources.Any())
            {
                _logger.LogInformation("No template resources found for the provided IDs.");
                serviceResponse.Message = "No template resources found to delete.";
                return serviceResponse;
            }

            _unitOfWork.TemplateResourceRepo.Delete(templateResources);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save multiple template resource deletions.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template resources deleted successfully.";
            _logger.LogInformation($"Deleted {templateResources.Count} template resource(s).");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while deleting multiple template resources.");
        }

        return serviceResponse;
    }
}
