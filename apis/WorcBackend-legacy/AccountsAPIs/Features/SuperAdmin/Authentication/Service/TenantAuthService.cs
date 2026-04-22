namespace AccountsAPIs.Services;

public class TenantAuthService : ITenantAuthService
{
    private readonly ILogger<TenantAuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly HttpContext _httpContext;
    private readonly IAuthHelperService _authHelperService;

    public TenantAuthService(
       ILogger<TenantAuthService> logger,
       IUnitOfWork unitOfWork,
       IHttpContextAccessor httpContextAccessor,
       ICurrentTenantService currentTenantService,
       EnvironmentConfig environmentConfig,
       AppDefaultConfig appDefaultConfig,
       IAuthHelperService authHelperService)
    {
        _httpContext = httpContextAccessor.HttpContext
            ?? throw new ArgumentNullException(nameof(httpContextAccessor.HttpContext));

        _userId = Guid.Parse(_httpContext.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _environmentConfig = environmentConfig;
        _appDefaultConfig = appDefaultConfig;
        _authHelperService = authHelperService;
    }

    // Creates a session for the user and returns JWT + refresh token. Validates user, tenant, request data, and session limits before creating a session.
    public async Task<ServiceResponse<UserSessionDto>> GenerateTenantTokenAsync(TenantTokenDto tenantTokenDto)
    {
        // Default failure response
        var serviceResponse = new ServiceResponse<UserSessionDto>
        {
            Data = null,
            Message = "Session creation failed. Please try again."
        };

        try
        {
            // Fetch user with tenant, roles, and permissions
            var user = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => w.Id == _userId)
                .AsSplitQuery()
                .Include(i => i.Tenant)
                .Include(i => i.UserRoles)
                    .ThenInclude(r => r.Role)
                        .ThenInclude(rp => rp.RolePermissions)
                            .ThenInclude(p => p.Permission)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Validate user existence
            if (user == null)
            {
                _logger.LogError($"User not found: {_userId}");
                serviceResponse.Message = "User not found";
                return serviceResponse;
            }

            // Resolve tenant based on request type
            Tenant? tenant = tenantTokenDto.IsTenantToken
                ? await _unitOfWork.TenantRepo
                    .GetByConditionAsync(w => w.Id == _currentTenantService.CurrentTenantId)
                    .SingleOrDefaultAsync()
                : user.Tenant;

            // Validate tenant existence
            if (tenant == null)
            {
                _logger.LogError($"Tenant not found for user {user.UserName}");
                return serviceResponse;
            }
            _logger.LogError($"Tenant Name {tenant.Name}");


            // Read user-agent from request
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();

            // Count current active sessions
            var activeSessionCount = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.UserId == user.Id)
                .AsNoTracking()
                .CountAsync();

            // Enforce max session limit
            if (activeSessionCount >= _environmentConfig.MaxActiveSessionAllowed)
            {
                _logger.LogError($"Session limit reached for {user.UserName}");
                serviceResponse.Message = "Session limit reached";
                return serviceResponse;
            }

            // Set token expiration times
            var jwtExpiresOn = DateTimeOffset.UtcNow.AddMinutes(_environmentConfig.JwtValidityInMinutes);
            var refreshTokenExpiresOn = DateTimeOffset.UtcNow.AddDays(_environmentConfig.JwtRefreshTokenValidityInDays);

            // Fetch active subscription and plan
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.TenantId == tenant.Id && w.IsActive)
                .Include(i => i.Plan)
                .FirstOrDefaultAsync();

            // Extract plan type if available
            string? currentPlan = tenantSubscription?.Plan?.Type.ToString();

            // Generate session identifiers and tokens
            var sessionId = Guid.NewGuid();
            var jwt = CreateJwt(user, jwtExpiresOn, false, sessionId, currentPlan, tenant.Id, tenantTokenDto.IsTenantToken);
            var refreshToken = _authHelperService.CreateRefreshToken();

            // Extract client device and network details
            var clientInfo = GetClientBrowserAndOs(_httpContext);

            // Create active session entity
            var activeSession = new ActiveSession
            {
                Id = sessionId,
                DeviceId = userAgent,
                IPAddress = clientInfo.ipAddress,
                BrowserType = clientInfo.Browser,
                OperatingSystem = clientInfo.OS,
                Location = "NA",
                RefreshToken = refreshToken,
                SessionExpiresOn = refreshTokenExpiresOn,
                LoggedInOn = DateTimeOffset.UtcNow,
                LastRefreshOn = DateTimeOffset.UtcNow,
                UserId = user.Id
            };

            // Persist session to database
            await _unitOfWork.ActiveSessionRepo.InsertAsync(activeSession);

            // Validate database save
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save session for {user.UserName}");
                return serviceResponse;
            }

            // Store session data in cookies
            _authHelperService.SetCookie("SessionId", activeSession.Id.ToString(), refreshTokenExpiresOn);
            _authHelperService.SetCookie("AccessToken", jwt, jwtExpiresOn);
            _authHelperService.SetCookie("RefreshToken", refreshToken, refreshTokenExpiresOn);
            _authHelperService.SetCookie("UserName", user.UserName, refreshTokenExpiresOn);

            // Prepare response DTO
            var userSessionDto = new UserSessionDto
            {
                TenantName = tenant?.Name ?? "NA",
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserInitials = GetUserInitialsUtil.GetUserInitials(user.FirstName, user.LastName),
                AccessToken = jwt,
                RefreshToken = refreshToken,
                RTExpiresOn = refreshTokenExpiresOn,
                Country = user.Tenant?.Country.ToString() ?? "NA",
                PlatformVersion = _appDefaultConfig.PlatformVersion
            };

            // Set success response
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Session created successfully";
            return serviceResponse;
        }
        catch (Exception ex)
        {
            // Log unexpected failure
            _logger.LogError(ex, $"Session creation failed for user {_userId}");
            return serviceResponse;
        }
    }

    // Extracts client IP address, browser, and operating system from the request.
    static (string? ipAddress, string Browser, string OS) GetClientBrowserAndOs(HttpContext context)
    {
        // Get IP address from connection
        var ipAddress = context.Connection.RemoteIpAddress;

        // Override IP if request passed through proxy/load balancer
        if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            ipAddress = System.Net.IPAddress.Parse(
                context.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0]);
        }

        // TODO: Replace with real parsing using UAParser for browser and OS detection
        // var userAgent = context.Request.Headers["User-Agent"].ToString();
        // var clientInfo = Parser.GetDefault().Parse(userAgent);

        // Return extracted (or fallback) client details
        return (ipAddress?.ToString(), "Chrome", "Windows 10");
    }

    // Generates a JWT token with user identity, roles, session, and permission claims. Supports both session-based and single-use tokens.
    public string CreateJwt(
        AccountUser user,
        DateTimeOffset jwtExpiresOn,
        bool isSingleUseJwt = false,
        Guid? sessionId = null,
        string? currentPlan = null,
        Guid? tenantId = null,
        bool isTemporary = false)
    {
        // Initialize base claims required for all tokens
        var claims = new Dictionary<string, object>
        {
            ["tntid"] = tenantId,
            ["uid"] = user.Id.ToString(),
            ["uname"] = user.UserName,
            [JwtRegisteredClaimNames.Jti] = Guid.NewGuid().ToString(),
            ["is_temp"] = isTemporary
        };

        // Add extended claims only for session-based tokens
        if (!isSingleUseJwt)
        {
            // Add user roles (ordered by role sequence)
            claims.Add(
                ClaimTypes.Role,
                user.UserRoles
                    .OrderBy(o => o.Role?.Seq)
                    .Select(s => s.Role?.Name)
                    .ToList());

            // Add session identifier
            claims.Add("sid", sessionId?.ToString());

            // Add tenant type (e.g., Enterprise, SaaS)
            claims.Add("type", _environmentConfig.OnPremTenantType);

            // Add plan status or subscription type
            claims.Add(
                "plan",
                _environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString()
                    ? (_environmentConfig.OnPremExecutionDisabled ? "Inactive" : "Active")
                    : currentPlan);

            // Add permission mapping grouped by permission type
            claims["permissions"] = user.UserRoles
                .Where(r => r.Role != null && r.Role.RolePermissions != null)
                .SelectMany(r => r.Role.RolePermissions)
                .Where(p => p.Permission != null)
                .GroupBy(p => p.Permission.Name)
                .ToDictionary(
                    g => (int)Enum.Parse(typeof(PermissionTypesEnum), g.Key),
                    g => JsonSerializer.Serialize(g.Select(x => (int)x.Access).ToList()));
        }

        // Create signing credentials using secret key
        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_environmentConfig.JwtSecretKey)),
            SecurityAlgorithms.HmacSha512);

        // Configure token descriptor
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = $"https://{_environmentConfig.AppBaseUrl}",
            Audience = $"https://{_environmentConfig.AppBaseUrl}",
            Claims = claims,
            IssuedAt = DateTime.UtcNow,
            Expires = jwtExpiresOn.UtcDateTime,
            SigningCredentials = signingCredentials
        };

        // Generate JWT token
        var tokenHandler = new Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler
        {
            SetDefaultTimesOnTokenCreation = false
        };

        return tokenHandler.CreateToken(tokenDescriptor);
    }
}