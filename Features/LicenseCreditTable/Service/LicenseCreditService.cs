namespace AccountsAPIs.Services;

public class LicenseCreditService : ILicenseCreditService
{
    private readonly ILogger<LicenseCreditService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public LicenseCreditService(
        ILogger<LicenseCreditService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Parse the user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all license credits asynchronously.
    public async Task<ServiceResponse<IEnumerable<LicenseCreditDto>>> GetLicenseCreditsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<LicenseCreditDto>>
        {
            Data = null,
            Message = "Unable to retrieve license credits. Please try again."
        };

        try
        {
            // Fetch my license credits, order them by creation date, and project to DTO
            var licenseCredits = await _unitOfWork.LicenseCreditRepo
                                            .GetByConditionAsync(w => w.TenantId == _tenantId)
                                            .OrderByDescending(w => w.CreatedOn)
                                            .Include(i => i.CreatedByUser)
                                            .Include(i => i.LastModifiedByUser)
                                            .Include(i => i.Invoices)
                                            .Include(i => i.Tenant)
                                            .Include(i => i.PlanPricing)
                                                .ThenInclude(i1 => i1.Tenant)
                                            .ToListAsync();

            serviceResponse.Data = licenseCredits.Adapt<IEnumerable<LicenseCreditDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved license credits.";
            _logger.LogInformation("Retrieved {Count} license credits.", licenseCredits.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving my license credits.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a list of license credit options for the current user.
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetLicenseCreditOptionListAsync()
    {
        var response = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Unable to retrieve license credits. Please try again."
        };

        try
        {
            // Fetch and order license credits by creation date, then project to DTO
            var licenseCredits = await _unitOfWork.LicenseCreditRepo
                                            .GetByConditionAsync(a => a.CreatedByUserId == _userId || a.TenantId == _tenantId)
                                            .OrderByDescending(w => w.CreatedOn)
                                            .Include(a => a.PlanPricing)
                                            .ProjectToType<SelectOptionDto>()
                                            .ToListAsync();

            response.Data = licenseCredits;
            response.StatusCode = 200;
            response.Message = "License credits retrieved successfully.";
            _logger.LogInformation("Retrieved {Count} license credits.", licenseCredits.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving license credits.");
            return response;
        }

        return response;
    }

    /// Retrieves all my license credits asynchronously.

    /// Retrieves a license credit by its ID asynchronously.
    public async Task<ServiceResponse<LicenseCreditDto>> GetLicenseCreditByIdAsync(Guid licenseCreditId)
    {
        var serviceResponse = new ServiceResponse<LicenseCreditDto>
        {
            Data = null,
            Message = "Unable to retrieve license credit. Please try again."
        };

        try
        {
            // Find the license credit by ID and include plan pricing
            var licenseCredit = await _unitOfWork.LicenseCreditRepo
                            .GetByConditionAsync(w => w.Id == licenseCreditId)
                            .Include(a => a.CreatedByUser)
                            .Include(a => a.LastModifiedByUser)
                            .Include(a => a.PlanPricing)
                            .ThenInclude(b => b.Tenant)
                            .Include(a => a.Tenant)
                            .FirstOrDefaultAsync();

            if (licenseCredit == null)
            {
                _logger.LogInformation("No license credit found with ID: {CreditId}", licenseCreditId);
                return serviceResponse;
            }

            serviceResponse.Data = licenseCredit.Adapt<LicenseCreditDto>();
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

    // Requests a new license credit.
    public async Task<ServiceResponse<LicenseCreditDto>> RequestLicenseCreditAsync(AddRequestLicenseCreditDto licenseCreditDto)
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
                    w.PlanId == licenseCreditDto.PlanId &&
                    w.TenantId == _tenantId)
                .Include(a => a.PlanPricing)
                .FirstOrDefaultAsync();

            if (existingCredit != null)
            {
                existingCredit.Allocated += licenseCreditDto.AdditionalUnitsRequested;
                existingCredit.Available += licenseCreditDto.AdditionalUnitsRequested;
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

                serviceResponse.Data = existingCredit.Adapt<LicenseCreditDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "License credit updated successfully.";
                _logger.LogInformation("License credit updated successfully for PlanId: '{PlanId}'.", licenseCreditDto.PlanId);
                return serviceResponse;
            }

            // Trim string properties
            licenseCreditDto = TrimDtoStringPropsUtil.TrimDtoStringProps(licenseCreditDto);

            var newLicenseCredit = licenseCreditDto.Adapt<LicenseCredit>();
            newLicenseCredit.Allocated = licenseCreditDto.AdditionalUnitsRequested;
            newLicenseCredit.Available = licenseCreditDto.AdditionalUnitsRequested;
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

            serviceResponse.Data = newLicenseCredit.Adapt<LicenseCreditDto>();
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

    // Records a license credit request and updates the existing license credit details.
    public async Task<ServiceResponse<LicenseCreditDto>> RecordLicenseCreditAsync(RecordLicenseCreditDto licenseCreditDto)
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

    // Create an invoice for the specified license credit, including calculated amounts and default settings.
    public async Task<bool> CreateInvoiceAsync(LicenseCredit existingCredit, int additionalUnitsRequested)
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

            // Calculate the amount and total a
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