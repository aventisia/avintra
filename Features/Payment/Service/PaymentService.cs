
namespace AccountsAPIs.Services;

public class PaymentService(UserManager<AccountUser> userManager,
    SignInManager<AccountUser> signInManager,
    IHttpContextAccessor httpContextAccessor,
    ILogger<AuthService> logger,
    IUnitOfWork unitOfWork,
    IAuthHelperService authHelperService,
    IAuthService authService,
    JwtConfig jwtConfig,
    IdentityConfig identityConfig,
    IEmailService emailService) : IPaymentService
{
    private readonly UserManager<AccountUser> _userManager = userManager;
    private readonly SignInManager<AccountUser> _signInManager = signInManager;
    private readonly HttpContext _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
    private readonly ILogger<AuthService> _logger = logger;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IAuthService _authService = authService;
    private readonly IAuthHelperService _authHelperService = authHelperService;
    private readonly IEmailService _emailService = emailService;
    private readonly IdentityConfig _identityConfig = identityConfig;
    private readonly JwtConfig _jwtConfig = jwtConfig;
    private readonly string _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
    private readonly Guid _sessionId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("sid") ?? Guid.Empty.ToString());
    private readonly Guid _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

            serviceResponse.Message = "An error occurs while inserting payment";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Update payment status
    public async Task<ServiceResponse<PaymentStatusDto>> UpdatePaymentStatusAsync(PaymentStatusDto paymentStatusDto)
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
            .GetByConditionAsync(w => w.Id == paymentStatusDto.Id)
            .FirstOrDefaultAsync();

            // if payment does not exist
            if (payment == null)
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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

            serviceResponse.Message = "An error occurs while updating payment status";
            return serviceResponse;
        }
        return serviceResponse;
    }
}