namespace AccountsAPIs.Services;

public class InvoiceService : IInvoiceService
{
    private readonly ILogger<AuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public InvoiceService(
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuthService> logger,
        IUnitOfWork unitOfWork)
    {
        // Extract the current user's ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieve all invoices
    public async Task<ServiceResponse<IEnumerable<InvoiceDto>>> GetAllInvoicesAsync()
    {
        var response = new ServiceResponse<IEnumerable<InvoiceDto>>
        {
            StatusCode = 400,
            Message = "Failed to retrieve invoices, please try again."
        };

        try
        {
            // Fetch all invoice entities from the database
            var invoices = await _unitOfWork.InvoiceRepo
                            .GetAllAsync()
                            .Include(i => i.LicenseCredit)
                            .ToListAsync();

            // Map to DTO and return success
            response.Data = invoices.Adapt<IEnumerable<InvoiceDto>>();
            response.StatusCode = 200;
            response.Message = "Invoices retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all invoices.");
        }

        return response;
    }

    // Retrieve invoices by subscription (or pricing plan) ID
    public async Task<ServiceResponse<IEnumerable<InvoiceDto>>> GetInvoicesByPricingPlanAsync(Guid pricingPlanId)
    {
        var response = new ServiceResponse<IEnumerable<InvoiceDto>>
        {
            StatusCode = 400,
            Message = "Unable to retrieve invoices by pricing plan. Please try again."
        };

        try
        {
            // Retrieve the pricing plan and its associated license credits
            var pricingPlan = await _unitOfWork.PricingPlanRepo
                .GetByConditionAsync(w => w.Id == pricingPlanId)
                .Include(i => i.LicenseCredits)
                .FirstOrDefaultAsync();

            if (pricingPlan == null)
            {
                _logger.LogInformation("Pricing plan with the provided ID not found.");
                response.Message = "Pricing plan not found.";
                return response;
            }

            // Retrieve invoices associated with the pricing plan's license credits
            var invoices = await _unitOfWork.InvoiceRepo
                .GetByConditionAsync(w => pricingPlan.LicenseCredits.Select(s => s.Id).Contains(w.LicenseCreditId))
                .Include(i => i.LicenseCredit)
                .ToListAsync();

            // Check if any invoices were found
            if (invoices == null || !invoices.Any())
            {
                _logger.LogInformation("No invoices found for the given pricing plan.");
                response.Message = "No invoices found for the provided pricing plan.";
                return response;
            }

            // Map invoices to DTOs and return success response
            response.Data = invoices.Adapt<IEnumerable<InvoiceDto>>();
            response.StatusCode = 200;
            response.Message = "Invoices retrieved successfully for the provided pricing plan.";
        }
        catch (Exception ex)
        {
            // Log the exception in case of an error
            _logger.LogError(ex, "Error occurred while retrieving invoices for pricing plan.");
        }

        return response;
    }

    // Retrieve a specific invoice by ID
    public async Task<ServiceResponse<InvoiceDto>> GetInvoiceByIdAsync(Guid invoiceId)
    {
        var response = new ServiceResponse<InvoiceDto>
        {
            StatusCode = 400,
            Message = "Failed to retrieve invoice, please try again."
        };

        try
        {
            // Fetch invoice entity by ID
            var invoice = await _unitOfWork.InvoiceRepo
                .GetByConditionAsync(i => i.Id == invoiceId)
                .Include(i => i.LicenseCredit)
                .FirstOrDefaultAsync();

            // Handle not found case
            if (invoice == null)
            {
                _logger.LogInformation("Invoice not found.");
                response.Message = "Invoice not found.";
                return response;
            }

            response.Data = invoice.Adapt<InvoiceDto>();
            response.StatusCode = 200;
            response.Message = "Invoice retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving invoice by ID.");
        }

        return response;
    }

    // Create a new invoice into the database
    public async Task<ServiceResponse<InvoiceDto>> CreateInvoiceAsync(InvoiceDto invoiceDto)
    {
        var response = new ServiceResponse<InvoiceDto>
        {
            StatusCode = 400,
            Message = "Failed to insert invoice, please try again."
        };

        try
        {
            // Map DTO to entity and set audit fields
            var invoice = invoiceDto.Adapt<Invoice>();
            invoice.CreatedByUserId = _userId;
            invoice.LastModifiedByUserId = _userId;

            await _unitOfWork.InvoiceRepo.InsertAsync(invoice);

            // Save changes and validate success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save new invoice to database.");
                return response;
            }

            response.Data = invoice.Adapt<InvoiceDto>();
            response.StatusCode = 200;
            response.Message = "Invoice inserted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inserting invoice.");
        }

        return response;
    }

    // Update an existing invoice
    public async Task<ServiceResponse<GenerateInvoiceDto>> UpdateInvoiceAsync(GenerateInvoiceDto invoiceDto)
    {
        var response = new ServiceResponse<GenerateInvoiceDto>
        {
            StatusCode = 400,
            Message = "Failed to update invoice, please try again."
        };

        try
        {
            // Get the existing invoice
            var existingInvoice = await _unitOfWork.InvoiceRepo
                .GetByConditionAsync(i => i.Id == invoiceDto.Id)
                .FirstOrDefaultAsync();

            if (existingInvoice == null)
            {
                _logger.LogInformation("Invoice not found for update.");
                response.Message = "Invoice not found.";
                return response;
            }

            // Calculate tax and total
            decimal tax = invoiceDto.Amount * 0.10m;
            decimal total = (invoiceDto.Amount + tax) - invoiceDto.Discount;
            string invoiceNumber = GenerateInvoiceNumber(invoiceDto.TenantId);

            // Update invoice fields
            var updatedInvoice = invoiceDto.Adapt(existingInvoice);
            updatedInvoice.InvoiceNumber = invoiceNumber;
            updatedInvoice.CreatedByUserId = _userId;
            updatedInvoice.LastModifiedByUserId = _userId;

            _unitOfWork.InvoiceRepo.Update(updatedInvoice);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save invoice update to database.");
                return response;
            }

            response.Data = updatedInvoice.Adapt<GenerateInvoiceDto>();
            response.StatusCode = 200;
            response.Message = "Invoice updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating invoice.");
        }

        return response;
    }

    // Delete an invoice by ID
    public async Task<ServiceResponse<bool>> DeleteInvoiceAsync(Guid invoiceId)
    {
        var response = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400,
            Message = "Failed to delete invoice, please try again."
        };

        try
        {
            // Fetch invoice for deletion
            var invoice = await _unitOfWork.InvoiceRepo
                .GetByConditionAsync(i => i.Id == invoiceId)
                .FirstOrDefaultAsync();

            if (invoice == null)
            {
                _logger.LogInformation("Invoice not found for deletion.");
                response.Message = "Invoice not found.";
                return response;
            }

            _unitOfWork.InvoiceRepo.Delete(invoice);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save invoice deletion to database.");
                return response;
            }

            response.Data = true;
            response.StatusCode = 200;
            response.Message = "Invoice deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting invoice.");
        }

        return response;
    }

    // Generate a new invoice based on business rules
    public async Task<ServiceResponse<GenerateInvoiceDto>> GenerateInvoiceAsync(GenerateInvoiceDto invoiceDto)
    {
        var response = new ServiceResponse<GenerateInvoiceDto>
        {
            StatusCode = 400,
            Message = "Failed to generate invoice, please try again."
        };

        try
        {
            // Calculate total cost
            decimal tax = invoiceDto.Amount * 0.10m;
            decimal total = (invoiceDto.Amount + tax) - invoiceDto.Discount;

            // Generate unique invoice number
            string invoiceNumber = GenerateInvoiceNumber(invoiceDto.TenantId);

            // Create invoice entity
            var invoice = invoiceDto.Adapt<Invoice>();
            invoice.InvoiceNumber = invoiceNumber;
            invoice.CreatedByUserId = _userId;
            invoice.LastModifiedByUserId = _userId;

            // Save to database
            await _unitOfWork.InvoiceRepo.InsertAsync(invoice);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save generated invoice to database.");
                return response;
            }

            response.Data = invoice.Adapt<GenerateInvoiceDto>();
            response.StatusCode = 200;
            response.Message = "Invoice generated and saved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite?.Name);
        }

        return response;
    }

    // Generate a unique invoice number for the tenant
    private string GenerateInvoiceNumber(Guid tenantId)
    {
        var lastInvoice = _unitOfWork.InvoiceRepo
            .GetByConditionAsync(i => i.TenantId == tenantId)
            .OrderByDescending(i => i.CreatedOn)
            .FirstOrDefault();

        // Increment the last number or start from 1
        int nextNumber = lastInvoice == null ? 1 : int.Parse(lastInvoice.InvoiceNumber.Split('-').Last()) + 1;

        return $"INV-{DateTime.UtcNow.Year}-{nextNumber:D3}";
    }
}
