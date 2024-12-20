namespace AccountsAPIs.Services;

public class InvoiceService : IInvoiceService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly SignInManager<AccountUser> _signInManager;
    private readonly HttpContext _httpContext;
    private readonly ILogger<AuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;
    private readonly IAuthHelperService _authHelperService;
    private readonly IEmailService _emailService;
    private readonly IdentityConfig _identityConfig;
    private readonly JwtConfig _jwtConfig;
    private readonly string _userName;
    private readonly Guid _sessionId;
    private readonly Guid _userId;

    public InvoiceService(
        UserManager<AccountUser> userManager,
        SignInManager<AccountUser> signInManager,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuthService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        IAuthService authService,
        JwtConfig jwtConfig,
        IdentityConfig identityConfig,
        IEmailService emailService)
    {
        // Set _userName, _sessionId & _userId
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
        _sessionId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("sid") ?? Guid.Empty.ToString());
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _userManager = userManager;
        _signInManager = signInManager;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authService = authService;
        _authHelperService = authHelperService;
        _jwtConfig = jwtConfig;
        _identityConfig = identityConfig;
        _emailService = emailService;
    }

    // Retrive all Invoices list.
    public async Task<ServiceResponse<IEnumerable<InvoiceDto>>> GetAllInvoiceAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<InvoiceDto>>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to retrive all invoices, please try again"
        };

        try
        {
            // Try to get Invoice
            var invoice = await _unitOfWork.InvoiceRepo.GetAllAsync().ToListAsync();

            // Task Successful
            serviceResponse.Data = invoice.Adapt<IEnumerable<InvoiceDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Invoice list retrived successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while retriving list of invoice";
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Retrieves all invoices associated with a specific subscription.
    public async Task<ServiceResponse<IEnumerable<InvoiceDto>>> GetInvoiceBySubscriptionAsync (Guid subscriptionId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<InvoiceDto>>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to retrive all invoices subscription, please try again"
        };
        try
        {
            // Try to get invoice by subscriptionId
            var invoice = await _unitOfWork.InvoiceRepo
            .GetByConditionAsync(w => w.SubscriptionId == subscriptionId)
            .FirstOrDefaultAsync();

            if (invoice == null)
            {
                _logger.LogInformation($"Invoice by subscriptionId does not found");
                serviceResponse.Message = "Invoice by subscriptionId  not exist";
                return serviceResponse;
            }

             // Task Successful
            serviceResponse.Data = invoice.Adapt<IEnumerable<InvoiceDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Invoice list by subscriptionId retrived successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while retriving list of invoice by subscription";
            return serviceResponse;
        }
        return serviceResponse;
    }
    
    // Retrive Invoice by Id
    public async Task<ServiceResponse<InvoiceDto>> GetInvoiceAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<InvoiceDto>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to retrive invoice, please try again"
        };
        try
        {
            // Try to get invoice by Id
            var invoice = await _unitOfWork.InvoiceRepo
            .GetByConditionAsync(w => w.Id == id).FirstOrDefaultAsync();

            if (invoice == null)
            {
                _logger.LogInformation($"Invoice by Id does not found");
                serviceResponse.Message = "Invoice does not exist";
                return serviceResponse;
            }

            // Task Successful
            serviceResponse.Data = invoice.Adapt<InvoiceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Invoice retrived successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while retrive invoice by Id";
            return serviceResponse;
        }
        return serviceResponse;
    }
    
    // Insert a new Invoice
    public async Task<ServiceResponse<InvoiceDto>> InsertInvoiceAsync(InvoiceDto invoiceDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<InvoiceDto>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to insert invoice, please try again"
        };
        try
        {
            // Default mapping
            var newInvoice = invoiceDto.Adapt<Invoice>();
            newInvoice.CreatedByUserId = _userId;
            newInvoice.LastModifiedByUserId = _userId;
            // Insert Invoice
            await _unitOfWork.InvoiceRepo.InsertAsync(newInvoice);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new Invoice.");
                return serviceResponse;
            }

            // Task Successful
            serviceResponse.Data = newInvoice.Adapt<InvoiceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Invoice inserted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while inserting invoice";
            return serviceResponse;
        }
        return serviceResponse;

    }

    // Update Invoice
    public async Task<ServiceResponse<InvoiceDto>> UpdateInvoiceAsync(InvoiceDto invoiceDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<InvoiceDto>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to update invoice, please try again"
        };
        try
        {
            // validate Invoice existence
            var invoice = await _unitOfWork.InvoiceRepo
            .GetByConditionAsync(w => w.Id == invoiceDto.Id)
            .FirstOrDefaultAsync();

            // Invoice does not exist
            if (invoice != null)
            {
                _logger.LogInformation($"Invoice does not exist");
                serviceResponse.Message = "Invoice not exist";
                return serviceResponse;
            }

            // Default mapping
            var newInvoice = invoiceDto.Adapt(invoice);
            newInvoice.CreatedByUserId = _userId;
            newInvoice.LastModifiedByUserId = _userId;

            // update invoice
            _unitOfWork.InvoiceRepo.Update(newInvoice);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating Invoice.");
                return serviceResponse;
            }

            // Task Successful
            serviceResponse.Data = newInvoice.Adapt<InvoiceDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Invoice updated sucessfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while updating invoice";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Delete Invoice by Id
    public async Task<ServiceResponse<bool>> DeleteInvoiceAsync (Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400,
            Message = "Failed to delete invoice, please try again"
        };
        try
        {
             // validate Invoice existence
            var invoice = await _unitOfWork.InvoiceRepo
            .GetByConditionAsync(w => w.Id == id)
            .FirstOrDefaultAsync();

            // Invoice does not exist
            if (invoice != null)
            {
                _logger.LogInformation($"Invoice does not exist");
                serviceResponse.Message = "Invoice not exist";
                return serviceResponse;
            }

            // Delete Invoice
             _unitOfWork.InvoiceRepo.Delete(invoice);
            
            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting invoice.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Invoice deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while deleting invoice";
            return serviceResponse;
        }
        return serviceResponse;
    }

}