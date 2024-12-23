
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

    public PaymentService( UserManager<AccountUser> userManager,
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
    public async Task<ServiceResponse<PaymentDto>> InsertPaymentAsync(PaymentDto paymentDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PaymentDto>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to insert payment, please try again"
        };
        try
        {  // Default mapping
           var payment = paymentDto.Adapt<Payment>();
           
           // Insert payment
           await _unitOfWork.PaymentRepo.InsertAsync(payment);

           // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new Invoice.");
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
}