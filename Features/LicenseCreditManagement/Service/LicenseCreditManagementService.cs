namespace AccountsAPIs.Services;

public class LicenseCreditManagementService : ILicenseCreditManagementService
{
    private readonly ILogger<LicenseCreditManagementService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public LicenseCreditManagementService(
        ILogger<LicenseCreditManagementService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Parse the user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all license credits asynchronously.
    public async Task<ServiceResponse<IEnumerable<ManageLicenseCreditDto>>> GetAllLicenseCreditsAsync(Guid? tenantId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ManageLicenseCreditDto>>
        {
            Data = null,
            Message = "Unable to retrieve license credits. Please try again."
        };

        try
        {
            // Fetch license credits, order them by creation date, and project to DTO
            var licenseCredits = await _unitOfWork.LicenseCreditRepo
                                            .GetAllAsync()
                                            .OrderByDescending(w => w.CreatedOn)
                                            .Include(a => a.CreatedByUser)
                                            .Include(a => a.LastModifiedByUser)
                                            .Include(a => a.Invoices)
                                            .Include(a => a.Tenant)
                                            .Include(a => a.PlanPricing)
                                                .ThenInclude(b => b.Tenant)
                                            .ToListAsync();
            if (tenantId.HasValue)
            {
                licenseCredits.Where(w => w.TenantId == tenantId.Value).ToList();
            }
            serviceResponse.Data = licenseCredits.Adapt<IEnumerable<ManageLicenseCreditDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved license credits.";
            _logger.LogInformation("Retrieved {Count} license credits.", licenseCredits.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving license credits.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a list of license credit options for the current user.
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetLicenseCreditOptionsAsync(Guid tenantId)
    {
        var response = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Unable to retrieve license credits. Please try again."
        };

        try
        {
            // Fetch and order license credits by creation date, then project to DTO
            var licenseCreditOptions = await _unitOfWork.LicenseCreditRepo
                                            .GetByConditionAsync(w => w.TenantId == tenantId)
                                            .OrderByDescending(w => w.CreatedOn)
                                            .Include(a => a.PlanPricing)
                                            .ProjectToType<SelectOptionDto>()
                                            .ToListAsync();

            response.Data = licenseCreditOptions;
            response.StatusCode = 200;
            response.Message = "License credits retrieved successfully.";
            _logger.LogInformation("Retrieved {Count} license credits.", licenseCreditOptions.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving license credits.");
            return response;
        }

        return response;
    }

    /// Retrieves a license credit by its ID asynchronously.
    public async Task<ServiceResponse<ManageLicenseCreditDto>> GetLicenseCreditByIdAsync(Guid licenseCreditId)
    {
        var serviceResponse = new ServiceResponse<ManageLicenseCreditDto>
        {
            Data = null,
            Message = "Unable to retrieve license credit. Please try again."
        };

        try
        {
            // Find the license credit by ID and include plan pricing
            var licenseCredit = await _unitOfWork.LicenseCreditRepo
                            .GetByConditionAsync(w => w.Id == licenseCreditId)
                            .Include(i => i.CreatedByUser)
                            .Include(i => i.LastModifiedByUser)
                            .Include(i => i.Invoices)
                            .Include(i => i.PlanPricing)
                            .ThenInclude(b => b.Tenant)
                            .Include(i => i.Tenant)
                            .FirstOrDefaultAsync();

            if (licenseCredit == null)
            {
                _logger.LogInformation("No license credit found with ID: {LicenseCreditId}", licenseCreditId);
                return serviceResponse;
            }

            serviceResponse.Data = licenseCredit.Adapt<ManageLicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved license credit.";
            _logger.LogInformation("Successfully retrieved license credit with ID: {LicenseCreditId}", licenseCreditId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the license credit with ID: {LicenseCreditId}", licenseCreditId);
        }

        return serviceResponse;
    }

    /// Inserts a new license credit asynchronously.
    public async Task<ServiceResponse<ManageLicenseCreditDto>> CreateLicenseCreditAsync(ManageLicenseCreditDto licenseCreditDto)
    {
        var serviceResponse = new ServiceResponse<ManageLicenseCreditDto>
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

            serviceResponse.Data = newCredit.Adapt<ManageLicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit created successfully.";
            _logger.LogInformation("License credit with additional units requested '{AdditionalUnitsRequested}' was created successfully.", licenseCreditDto.AdditionalUnitsRequested);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting license credit.");
        }

        return serviceResponse;
    }

    // Requests a new license credit.
    public async Task<ServiceResponse<ManageLicenseCreditDto>> SubmitLicenseCreditRequestAsync(RequestLicenseCreditDto licenseCreditDto)
    {
        var serviceResponse = new ServiceResponse<ManageLicenseCreditDto>
        {
            Data = null,
            Message = "Unable to insert or update license credit. Please try again."
        };

        try
        {
            // Check if a similar license credit already exists
            var existingCredit = await _unitOfWork.LicenseCreditRepo
                .GetByConditionAsync(w =>
                    w.PlanId == licenseCreditDto.PlanId &&
                    w.TenantId == licenseCreditDto.TenantId)
                .Include(a => a.PlanPricing)
                .FirstOrDefaultAsync();

            if (existingCredit != null)
            {
                existingCredit.AdditionalUnitsRequested += licenseCreditDto.AdditionalUnitsRequested;
                existingCredit.LastModifiedByUserId = _userId;

                _unitOfWork.LicenseCreditRepo.Update(existingCredit);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Failed to save changes while updating license credit.");
                    return serviceResponse;
                }

                var invoice = await _unitOfWork.InvoiceRepo
                            .GetByConditionAsync(a => a.LicenseCreditId == existingCredit.Id)
                            .FirstOrDefaultAsync();
                if (invoice != null)
                {
                    // Update the invoice totals
                    invoice.Amount += CalculateProRataAmount(existingCredit.PlanPricing.UnitPrice, licenseCreditDto.AdditionalUnitsRequested, existingCredit.NextBillingDate);
                    invoice.LastModifiedByUserId = _userId;

                    _unitOfWork.InvoiceRepo.Update(invoice);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogInformation("Failed to save updated invoice.");
                        return serviceResponse;
                    }
                }

                serviceResponse.Data = existingCredit.Adapt<ManageLicenseCreditDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "License credit updated successfully.";
                _logger.LogInformation("License credit updated successfully for PlanId: '{PlanId}'.", licenseCreditDto.PlanId);
                return serviceResponse;
            }

            // Trim string properties
            licenseCreditDto = TrimDtoStringPropsUtil.TrimDtoStringProps(licenseCreditDto);

            var newLicenseCredit = licenseCreditDto.Adapt<LicenseCredit>();
            newLicenseCredit.Available = licenseCreditDto.AdditionalUnitsRequested;
            newLicenseCredit.Allocated = licenseCreditDto.AdditionalUnitsRequested;
            newLicenseCredit.NextBillingDate = DateTime.UtcNow.AddMonths(1);
            newLicenseCredit.Status = LicenseCreditStatusesEnum.Approved;
            newLicenseCredit.CreatedByUserId = _userId;
            newLicenseCredit.LastModifiedByUserId = _userId;

            await _unitOfWork.LicenseCreditRepo.InsertAsync(newLicenseCredit);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating license credit.");
                return serviceResponse;
            }

            // Create invoice with default values
            var isCreated = await CreateInvoiceAsync(newLicenseCredit, licenseCreditDto.AdditionalUnitsRequested);

            if (!isCreated)
            {
                _logger.LogInformation("Failed to save changes while creating invoice for license credit.");
            }

            serviceResponse.Data = newLicenseCredit.Adapt<ManageLicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit updated successfully.";
            _logger.LogInformation("License credit updated successfully for PlanId: '{PlanId}'.", licenseCreditDto.PlanId);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while processing license credit.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Approve exiting license credit request.
    public async Task<ServiceResponse<ManageLicenseCreditDto>> ApproveLicenseCreditRequestAsync(RequestLicenseCreditDto licenseCreditDto)
    {
        // Initialize the service response with a default message
        var serviceResponse = new ServiceResponse<ManageLicenseCreditDto>
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
            existingCredit.Status = LicenseCreditStatusesEnum.Approved;
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
            serviceResponse.Data = existingCredit.Adapt<ManageLicenseCreditDto>();
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

    // Records a license credit request and updates the existing license credit details.
    public async Task<ServiceResponse<ManageLicenseCreditDto>> RecordLicenseCreditTransactionAsync(RecordLicenseCreditDto licenseCreditDto)
    {
        // Initialize the service response with a default message
        var serviceResponse = new ServiceResponse<ManageLicenseCreditDto>
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
            existingCredit.Status = LicenseCreditStatusesEnum.Approved;
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
            // Retrieve the invoice associated with the given license credit
            var invoice = await _unitOfWork.InvoiceRepo
                .GetByConditionAsync(a => a.LicenseCreditId == existingCredit.Id)
                .FirstOrDefaultAsync();

            // Check if the invoice was found
            if (invoice != null)
            {
                // Mark the invoice as paid
                invoice.IsPaid = true;
                invoice.Status = "Paid";
                invoice.AmountReceived = licenseCreditDto.AmountReceived;
                invoice.AmountReceivedOn = licenseCreditDto.DateReceived;
                invoice.LastModifiedByUserId = _userId;

                // Update the invoice in the repository
                _unitOfWork.InvoiceRepo.Update(invoice);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Failed to save changes while invoicing license credit.");
                }
            }
            else
            {
                _logger.LogWarning("No invoice found for LicenseCreditId: {LicenseCreditId}", existingCredit.Id);
                // Handle case where invoice is not found
            }

            // Populate the service response with the updated credit information
            serviceResponse.Data = existingCredit.Adapt<ManageLicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit updated successfully.";
            _logger.LogInformation("License credit updated successfully for PlanId: '{PlanId}'.", licenseCreditDto.PlanId);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during processing
            _logger.LogError(ex, "An error occurred while processing license credit.");
        }

        return serviceResponse;
    }

    // Updates an existing license credit asynchronously.
    public async Task<ServiceResponse<ManageLicenseCreditDto>> UpdateLicenseCreditAsync(ManageLicenseCreditDto licenseCreditDto)
    {
        var serviceResponse = new ServiceResponse<ManageLicenseCreditDto>
        {
            Data = null,
            Message = "Unable to update license credit. Please try again."
        };

        try
        {
            // Retrieve the existing license credit by ID
            var licenseCredit = await _unitOfWork.LicenseCreditRepo
                                           .GetByConditionAsync(w => w.Id == licenseCreditDto.Id)
                                           .SingleOrDefaultAsync();

            if (licenseCredit == null)
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
            licenseCreditDto.Adapt(licenseCredit);
            licenseCredit.LastModifiedByUserId = _userId;

            _unitOfWork.LicenseCreditRepo.Update(licenseCredit);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating license credit.");
                return serviceResponse;
            }

            serviceResponse.Data = licenseCredit.Adapt<ManageLicenseCreditDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit updated successfully.";
            _logger.LogInformation("License credit with additional units requested '{AdditionalUnitsRequested}' was updated successfully.", licenseCreditDto.AdditionalUnitsRequested);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating license credit.");
        }

        return serviceResponse;
    }

    // Deletes a license credit by ID asynchronously.
    public async Task<ServiceResponse<bool>> DeleteLicenseCreditByIdAsync(Guid licenseCreditId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Unable to delete license credit. Please try again."
        };

        try
        {
            // Retrieve the license credit to delete
            var licenseCredit = await _unitOfWork.LicenseCreditRepo
                                           .GetByConditionAsync(w => w.Id == licenseCreditId)
                                           .SingleOrDefaultAsync();

            if (licenseCredit == null)
            {
                _logger.LogInformation("License credit with ID '{CreditId}' does not exist.", licenseCreditId);
                serviceResponse.Message = "License credit not found.";
                return serviceResponse;
            }

            // Delete the license credit
            _unitOfWork.LicenseCreditRepo.Delete(licenseCredit);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting license credit.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "License credit deleted successfully.";
            _logger.LogInformation("License credit with ID '{LicenseCreditId}' was deleted successfully.", licenseCreditId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting license credit.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple license credits asynchronously.
    public async Task<ServiceResponse<bool>> DeleteMultipleLicenseCreditsAsync(List<Guid> licenseCreditIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Unable to delete license credits. Please try again."
        };

        try
        {
            // Retrieve the license credits to delete
            var licenseCredits = await _unitOfWork.LicenseCreditRepo
                                            .GetByConditionAsync(w => licenseCreditIds.Contains(w.Id))
                                            .ToListAsync();

            if (licenseCredits.Count == 0)
            {
                _logger.LogInformation("No license credits found for deletion.");
                serviceResponse.Message = "No license credits found to delete.";
                return serviceResponse;
            }

            // Delete the retrieved license credits
            _unitOfWork.LicenseCreditRepo.Delete(licenseCredits);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting license credits.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{licenseCreditIds.Count} license credits deleted successfully.";
            _logger.LogInformation("{Count} license credits were successfully deleted.", licenseCreditIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple license credits.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Create an invoice for the specified license credit, including calculated amounts and default settings.
    private async Task<bool> CreateInvoiceAsync(LicenseCredit existingCredit, int additionalUnitsRequested)
    {
        try
        {
            var planPricing = await _unitOfWork.PricingPlanRepo
                            .GetByConditionAsync(a => a.Id == existingCredit.PlanId)
                            .FirstOrDefaultAsync();

            // Ensure the necessary properties are available
            if (planPricing == null)
            {
                _logger.LogWarning("Invalid LicenseCredit: PlanPricing is null for PlanId: {PlanId}", existingCredit?.PlanId);
                return false;
            }

            // Create the invoice object
            var invoice = new Invoice()
            {
                LicenseCreditId = existingCredit.Id,
                IsPaid = false,
                Tax = 0,
                Discount = 0,
                Amount = CalculateProRataAmount(planPricing.UnitPrice, additionalUnitsRequested, existingCredit.NextBillingDate),
                DueDate = DateTime.UtcNow.AddDays(3),
                Status = "UnPaid",
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            };

            // Insert the invoice into the repository
            await _unitOfWork.InvoiceRepo.InsertAsync(invoice);

            // Save changes and return the result
            await _unitOfWork.SaveAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating the invoice for PlanId: {PlanId}", existingCredit.PlanId);
            return false;
        }
        return true;
    }

    // Calculates the pro-rata amount based on the unit price, number of units, and the next billing date.
    private decimal CalculateProRataAmount(double unitPerPrice, int newUnits, DateTime? nextBillingDate)
    {
        decimal unitPrice = Convert.ToDecimal(unitPerPrice);

        // Use today's date
        DateTime today = DateTime.UtcNow.Date;

        // Default to the 1st of next month if no billing date is provided
        DateTime effectiveBillingDate = nextBillingDate ?? new DateTime(today.Year, today.Month, 1).AddMonths(1);

        // Calculate full price for the new units
        decimal fullPrice = unitPrice * newUnits;

        // Total number of days in the current month
        int totalDaysInMonth = DateTime.DaysInMonth(today.Year, today.Month);

        // Remaining days until next billing cycle
        int remainingDays = (effectiveBillingDate - today).Days;

        // Calculate pro-rata based on time left in the billing cycle
        decimal proRataFactor = (decimal)remainingDays / totalDaysInMonth;
        decimal proRataAmount = Math.Ceiling(fullPrice * proRataFactor);

        return proRataAmount;
    }
}