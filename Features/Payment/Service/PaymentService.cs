
namespace AccountsAPIs.Services;

public class PaymentService : IPaymentService
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

    public PaymentService(UserManager<AccountUser> userManager,
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

    // retrive payment by Id
    public async Task<ServiceResponse<PaymentDto>> GetPaymentAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PaymentDto>
        {
            Data = null,
            Message = "Failed to retrive payment, please try again"
        };
        try
        {
            // try to get payment record by Id
            var payment = await _unitOfWork.PaymentRepo
            .GetByConditionAsync(w => w.Id == id)
            .FirstOrDefaultAsync();

            // payment not found
            if (payment == null)
            {
                _logger.LogInformation($"payment by Id does not found {id}");
                serviceResponse.Message = "payment does not exist";
                return serviceResponse;
            }

            // Task Successful
            serviceResponse.Data = payment.Adapt<PaymentDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment retrived successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while retriving payment";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // retrive payment list by InvoiceId
    public async Task<ServiceResponse<IEnumerable<PaymentDto>>> GetPaymentInvoiceAsync(Guid invoiceId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<PaymentDto>>
        {
            Data = null,
            Message = "Failed to retrive payment list by invoice, please try again"
        };
        try
        {
            // Try to retrive data by invoiceId
            var paymentInvoice = await _unitOfWork.PaymentRepo
            .GetByConditionAsync(w => w.InvoiceId == invoiceId).ToListAsync();

            if (paymentInvoice == null)
            {
                _logger.LogInformation($"payment list by invoiceId does not found {invoiceId}");
                serviceResponse.Message = "payment list for invoiceId does not exist";
                return serviceResponse;
            }

            // Task Succesful
            serviceResponse.Data = paymentInvoice.Adapt<IEnumerable<PaymentDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment list by invoicId retrived successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while retriving payment list by invoiceId";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Create a new Payment  
    public async Task<ServiceResponse<PaymentDto>> InsertPaymentAsync(PaymentDto paymentDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PaymentDto>
        {
            Data = null,
            Message = "Failed to insert payment, please try again"
        };
        try
        {  
            // Trim dto' string props
            paymentDto = TrimDtoStringPropsUtil.TrimDtoStringProps(paymentDto);

            // Default mapping
            var payment = paymentDto.Adapt<Payment>();
            payment.CreatedByUserId = _userId;
            payment.LastModifiedByUserId = _userId;

            // Insert payment
            await _unitOfWork.PaymentRepo.InsertAsync(payment);

            // Insert-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting payment");
                return serviceResponse;
            }

            // Task sucessful
            serviceResponse.Data = payment.Adapt<PaymentDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Payment added succesfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while inserting payment";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Update payment status
    public async Task<ServiceResponse<PaymentStatusDto>> UpdatePaymentStatusAsync (PaymentStatusDto paymentStatusDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PaymentStatusDto>
        {
            Data = null,
            Message = "Failed to update payment status, please try again"
        };
        try
        {
            // Trim dto' string props
            paymentStatusDto = TrimDtoStringPropsUtil.TrimDtoStringProps(paymentStatusDto);

            // Validate existence payment
            var payment = await _unitOfWork.PaymentRepo
            .GetByConditionAsync(w => w.Id == paymentStatusDto.Id )
            .FirstOrDefaultAsync();

            // if payment does not exist
            if(payment == null)
            {
                _logger.LogInformation($"payment does not exist");
                serviceResponse.Message = "payment not exist";
                return serviceResponse;
            }

            // Default mapping
            var updatePayment = paymentStatusDto.Adapt(payment);

            // Update payment status
            _unitOfWork.PaymentRepo.Update(updatePayment);
            updatePayment.CreatedByUserId = _userId;
            updatePayment.LastModifiedByUserId = _userId;

            // Insert-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while update payment");
                return serviceResponse;
            }
            //Task successful
            serviceResponse.Data = updatePayment.Adapt<PaymentStatusDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan updated successfully";
        }
        catch (Exception ex)
        {
           _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while updating payment status";
            return serviceResponse; 
        }
        return serviceResponse;
    }
}