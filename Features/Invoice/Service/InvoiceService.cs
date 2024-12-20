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
  
    // Update 
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
}