namespace AccountsAPIs.Services;

public class LicenseCreditService : ILicenseCreditService
{
    private readonly ILogger<LicenseCreditService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public LicenseCreditService(
        ILogger<LicenseCreditService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Parse the user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    /// Retrieves all license credits asynchronously.
    public async Task<ServiceResponse<IEnumerable<LicenseCreditDto>>> GetLicenseCreditsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<LicenseCreditDto>>
        {
            Data = null,
            Message = "Unable to retrieve license credits. Please try again."
        };

        try
        {
            // Fetch license credits, order them by creation date, and project to DTO
            var credits = await _unitOfWork.LicenseCreditRepo
                                            .GetAllAsync()
                                            .OrderByDescending(w => w.CreatedOn)
                                            .Include(a => a.CreatedByUser)
                                            .Include(a => a.LastModifiedByUser)
                                            .Include(a => a.PlanPricing)
                                                .ThenInclude(b => b.Tenant)
                                            .ProjectToType<LicenseCreditDto>()
                                            .ToListAsync();

            serviceResponse.Data = credits;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved license credits.";
            _logger.LogInformation("Retrieved {Count} license credits.", credits.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving license credits.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    /// Retrieves a license credit by its ID asynchronously.
    public async Task<ServiceResponse<LicenseCreditDto>> GetLicenseCreditByIdAsync(Guid creditId)
    {
        var serviceResponse = new ServiceResponse<LicenseCreditDto>
        {
            Data = null,
            Message = "Unable to retrieve license credit. Please try again."
        };

        try
        {
            // Find the license credit by ID and include plan pricing
            var credit = await _unitOfWork.LicenseCreditRepo
                            .GetByConditionAsync(w => w.Id == creditId)
                            .Include(a => a.CreatedByUser)
                            .Include(a => a.LastModifiedByUser)
                            .Include(a => a.PlanPricing)
                            .ThenInclude(b => b.Tenant)
                            .FirstOrDefaultAsync();

            if (credit == null)
            {
                _logger.LogInformation("No license credit found with ID: {CreditId}", creditId);
                return serviceResponse;
            }

            serviceResponse.Data = credit.Adapt<LicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved license credit.";
            _logger.LogInformation("Successfully retrieved license credit with ID: {CreditId}", creditId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the license credit with ID: {CreditId}", creditId);
            serviceResponse.StatusCode = 500;
        }

        return serviceResponse;
    }

    /// Inserts a new license credit asynchronously.
    public async Task<ServiceResponse<LicenseCreditDto>> InsertLicenseCreditAsync(LicenseCreditDto licenseCreditDto)
    {
        var serviceResponse = new ServiceResponse<LicenseCreditDto>
        {
            Data = null,
            Message = "Unable to insert license credit. Please try again."
        };

        try
        {
            // Check if a similar license credit already exists
            var existingCredit = await _unitOfWork.LicenseCreditRepo
                .GetByConditionAsync(w =>
                    w.PlanId == licenseCreditDto.PlanId &&
                    w.TenantId == licenseCreditDto.TenantId)
                .FirstOrDefaultAsync();

            if (existingCredit != null)
            {
                _logger.LogInformation("License credit '{AdditionalUnitsRequested}' already exists.", licenseCreditDto.AdditionalUnitsRequested);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A license credit with this configuration already exists. Please choose a unique name.";
                return serviceResponse;
            }

            // Trim string properties and create a new license credit
            licenseCreditDto = TrimDtoStringPropsUtil.TrimDtoStringProps(licenseCreditDto);
            var newCredit = licenseCreditDto.Adapt<LicenseCredit>();
            newCredit.CreatedByUserId = _userId;
            newCredit.LastModifiedByUserId = _userId;

            await _unitOfWork.LicenseCreditRepo.InsertAsync(newCredit);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new license credit.");
                return serviceResponse;
            }

            serviceResponse.Data = newCredit.Adapt<LicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit created successfully.";
            _logger.LogInformation("License credit with additional units requested '{AdditionalUnitsRequested}' was created successfully.", licenseCreditDto.AdditionalUnitsRequested);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting license credit.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Requests a new license credit.
    public async Task<ServiceResponse<LicenseCreditDto>> RequestLicenseCreditAsync(RequestLicenseCreditDto licenseCreditDto)
    {
        var serviceResponse = new ServiceResponse<LicenseCreditDto>
        {
            Data = null,
            Message = "Unable to insert or update license credit. Please try again."
        };

        try
        {
            // Check if a similar license credit already exists
            var existingCredit = await _unitOfWork.LicenseCreditRepo
                .GetByConditionAsync(w =>
                    w.PlanId == licenseCreditDto.PlanId)
                .FirstOrDefaultAsync();

            // Trim string properties
            licenseCreditDto = TrimDtoStringPropsUtil.TrimDtoStringProps(licenseCreditDto);

            if (existingCredit != null)
            {
                // Update the existing credit's AdditionalUnitsRequested
                existingCredit.AdditionalUnitsRequested = licenseCreditDto.AdditionalUnitsRequested;
                existingCredit.LastModifiedByUserId = _userId;

                _unitOfWork.LicenseCreditRepo.Update(existingCredit);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Failed to save changes while updating license credit.");
                    return serviceResponse;
                }

                serviceResponse.Data = existingCredit.Adapt<LicenseCreditDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "License credit updated successfully.";
                _logger.LogInformation("License credit updated successfully for PlanId: '{PlanId}'.", licenseCreditDto.PlanId);
            }
            else
            {
                // Create a new license credit
                var newCredit = licenseCreditDto.Adapt<LicenseCredit>();
                newCredit.CreatedByUserId = _userId;
                newCredit.LastModifiedByUserId = _userId;

                await _unitOfWork.LicenseCreditRepo.InsertAsync(newCredit);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Failed to save changes while inserting new license credit.");
                    return serviceResponse;
                }

                serviceResponse.Data = newCredit.Adapt<LicenseCreditDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "License credit created successfully.";
                _logger.LogInformation("License credit with additional units requested '{AdditionalUnitsRequested}' was created successfully.", licenseCreditDto.AdditionalUnitsRequested);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while processing license credit.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Approve exiting license credit request.
    public async Task<ServiceResponse<LicenseCreditDto>> ApproveLicenseCreditAsync(RequestLicenseCreditDto licenseCreditDto)
    {
        // Initialize the service response with a default message
        var serviceResponse = new ServiceResponse<LicenseCreditDto>
        {
            Data = null,
            Message = "Unable to insert or update license credit. Please try again."
        };

        try
        {
            // Check if a license credit with the specified ID and PlanId exists
            var existingCredit = await _unitOfWork.LicenseCreditRepo
                .GetByConditionAsync(w =>
                    w.Id == licenseCreditDto.Id &&
                    w.PlanId == licenseCreditDto.PlanId)
                .FirstOrDefaultAsync();

            // If no existing credit is found, log and return a message
            if (existingCredit == null)
            {
                _logger.LogInformation("License credit with ID '{CreditId}' does not exist.", licenseCreditDto.Id);
                serviceResponse.Message = "License credit not found.";
                return serviceResponse;
            }

            // Trim string properties of the incoming DTO for consistency
            licenseCreditDto = TrimDtoStringPropsUtil.TrimDtoStringProps(licenseCreditDto);

            // Update the available and allocated units based on the additional units requested
            existingCredit.Available += existingCredit.AdditionalUnitsRequested;
            existingCredit.Allocated += existingCredit.AdditionalUnitsRequested;
            existingCredit.AdditionalUnitsRequested = 0;
            existingCredit.LastModifiedByUserId = _userId;

            // Update the repository with the modified credit information
            _unitOfWork.LicenseCreditRepo.Update(existingCredit);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating license credit.");
                return serviceResponse;
            }

            // Populate the service response with the updated credit information
            serviceResponse.Data = existingCredit.Adapt<LicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit updated successfully.";
            _logger.LogInformation("License credit updated successfully for PlanId: '{PlanId}'.", licenseCreditDto.PlanId);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during processing
            _logger.LogError(ex, "An error occurred while processing license credit.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing license credit asynchronously.
    public async Task<ServiceResponse<LicenseCreditDto>> UpdateLicenseCreditAsync(LicenseCreditDto licenseCreditDto)
    {
        var serviceResponse = new ServiceResponse<LicenseCreditDto>
        {
            Data = null,
            Message = "Unable to update license credit. Please try again."
        };

        try
        {
            // Retrieve the existing license credit by ID
            var credit = await _unitOfWork.LicenseCreditRepo
                                           .GetByConditionAsync(w => w.Id == licenseCreditDto.Id)
                                           .SingleOrDefaultAsync();

            if (credit == null)
            {
                _logger.LogInformation("License credit with ID '{CreditId}' does not exist.", licenseCreditDto.Id);
                serviceResponse.Message = "License credit not found.";
                return serviceResponse;
            }

            // Check if another credit with the same name exists
            var existingCredit = await _unitOfWork.LicenseCreditRepo
                                                   .GetByConditionAsync(w =>
                                                      w.Id != licenseCreditDto.Id)
                                                   .FirstOrDefaultAsync();

            if (existingCredit != null)
            {
                _logger.LogInformation("License credit name is already in use.");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A license credit with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Update the license credit properties
            licenseCreditDto = TrimDtoStringPropsUtil.TrimDtoStringProps(licenseCreditDto);
            licenseCreditDto.Adapt(credit);
            credit.LastModifiedByUserId = _userId;

            _unitOfWork.LicenseCreditRepo.Update(credit);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating license credit.");
                return serviceResponse;
            }

            serviceResponse.Data = credit.Adapt<LicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit updated successfully.";
            _logger.LogInformation("License credit with additional units requested '{AdditionalUnitsRequested}' was updated successfully.", licenseCreditDto.AdditionalUnitsRequested);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating license credit.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a license credit by ID asynchronously.
    public async Task<ServiceResponse<bool>> DeleteLicenseCreditAsync(Guid creditId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Unable to delete license credit. Please try again."
        };

        try
        {
            // Retrieve the license credit to delete
            var credit = await _unitOfWork.LicenseCreditRepo
                                           .GetByConditionAsync(w => w.Id == creditId)
                                           .SingleOrDefaultAsync();

            if (credit == null)
            {
                _logger.LogInformation("License credit with ID '{CreditId}' does not exist.", creditId);
                serviceResponse.Message = "License credit not found.";
                return serviceResponse;
            }

            // Delete the license credit
            _unitOfWork.LicenseCreditRepo.Delete(credit);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting license credit.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit deleted successfully.";
            _logger.LogInformation("License credit with ID '{CreditId}' was deleted successfully.", creditId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting license credit.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple license credits asynchronously.
    public async Task<ServiceResponse<bool>> DeleteLicenseCreditsAsync(List<Guid> creditIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Unable to delete license credits. Please try again."
        };

        try
        {
            // Retrieve the license credits to delete
            var credits = await _unitOfWork.LicenseCreditRepo
                                            .GetByConditionAsync(w => creditIds.Contains(w.Id))
                                            .ToListAsync();

            if (credits.Count == 0)
            {
                _logger.LogInformation("No license credits found for deletion.");
                serviceResponse.Message = "No license credits found to delete.";
                return serviceResponse;
            }

            // Delete the retrieved license credits
            _unitOfWork.LicenseCreditRepo.Delete(credits);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting license credits.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{creditIds.Count} license credits deleted successfully.";
            _logger.LogInformation("{Count} license credits were successfully deleted.", creditIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple license credits.");
            return serviceResponse;
        }

        return serviceResponse;
    }
}