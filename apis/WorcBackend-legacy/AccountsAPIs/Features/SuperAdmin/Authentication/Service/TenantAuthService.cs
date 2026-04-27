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
    public async Task<ServiceResponse<UserSessionDto>> CreateSessionAsync()
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

            // Determine if the request is accessing a different tenant than the user's primary tenant
            var isCrossTenantAccess = user.Tenant.Id != _currentTenantService.CurrentTenantId;

            // Resolve tenant based on context
            Tenant? tenant = isCrossTenantAccess
                ? await _unitOfWork.TenantRepo
                    .GetByConditionAsync(w => w.Id == _currentTenantService.CurrentTenantId)
                    .SingleOrDefaultAsync()
                : user.Tenant;

            // Mark session as read-only when accessing a different tenant
            var isReadOnly = isCrossTenantAccess;

            // Validate tenant existence
            if (tenant == null)
            {
                _logger.LogError($"Tenant not found for user {user.UserName}");
                return serviceResponse;
            }

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
            var jwt = CreateJwt(user, jwtExpiresOn, false, sessionId, currentPlan, tenant.Id, isReadOnly);
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

    // Refreshes the user's session for the requested device.
    public async Task<ServiceResponse<UserSessionDto>> RefreshSessionAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<UserSessionDto>
        {
            Data = null,
            StatusCode = 401,
            Message = "Unable to refresh the session. Please try again."
        };

        try
        {
            // Get SessionId, Username, RefreshToken and User-Agent
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.SessionId.ToString(), out var sessionIdString);
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.UserName.ToString(), out var userName);
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.RefreshToken.ToString(), out var refreshToken);
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();

            // Set all cookies to blank
            _authHelperService.RemoveCookie(CookieNamesEnum.SessionId.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.AccessToken.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.RefreshToken.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.UserName.ToString());

            // Something is missing
            if (sessionIdString == null || userName == null || userAgent == null)
            {
                _logger.LogInformation("{SessionId} or {UserName} or User-Agent not found", CookieNamesEnum.SessionId, CookieNamesEnum.UserName);
                serviceResponse.Message = "Unable to refresh the session";
                return serviceResponse;
            }

            // RefreshToken not found
            if (refreshToken == null)
            {
                _logger.LogInformation("Log:3 RefreshToken not found for sessionId {SessionIdString} and user {UserName}", sessionIdString, userName);

                // Expired sessions will be deleted once user try to create new session via logging in
                _logger.LogInformation($"Session has expired for {sessionIdString} because {CookieNamesEnum.RefreshToken} not found");
                serviceResponse.Message = "Session has expired";
                return serviceResponse;
            }

            // Get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => EF.Functions.ILike(userName, w.UserName))
                .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                    .AsNoTracking()
                    .AsSplitQuery()
                    .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation("Log:4 User {UserName} not found in database", userName);
                _logger.LogInformation("{UserName} account not found", userName);
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // Determine if the request is accessing a different tenant than the user's primary tenant
            var isCrossTenantAccess = user.Tenant.Id != _currentTenantService.CurrentTenantId;

            // Resolve tenant based on context
            Tenant? tenant = isCrossTenantAccess
                ? await _unitOfWork.TenantRepo
                    .GetByConditionAsync(w => w.Id == _currentTenantService.CurrentTenantId)
                    .SingleOrDefaultAsync()
                : user.Tenant;

            // Mark session as read-only when accessing a different tenant
            var isReadOnly = isCrossTenantAccess;

            // // Tenant is null/disabled/expired
            // if (!_authHelperService.IsUserTenantValid(tenant, user.UserName))
            // {
            //     serviceResponse.Message = "Not able to retrieve your tenant's details. Please contact support administrator";
            //     return serviceResponse;
            // }

            // // Account is locked
            // if (user.LockoutEnd > DateTimeOffset.UtcNow)
            // {
            //     _logger.LogInformation("{UserName} account is locked", userName);
            //     serviceResponse.Message = "Your account is locked. Please contact support administrator";
            //     return serviceResponse;
            // }

            // // Account is disabled
            // if (user.IsDisabled)
            // {
            //     _logger.LogInformation("{UserName} account is disabled", userName);
            //     serviceResponse.Message = "Your account is disabled. Please contact support administrator";
            //     return serviceResponse;
            // }

            // // Password has expired
            // if (!tenant.IsPwdNeverExpiresEnabled && (DateTimeOffset.UtcNow - user.PwdSetOn)?.Days > tenant.DaysBeforePwdExpires)
            // {
            //     _logger.LogInformation("{UserName} account's password has been expired", userName);
            //     /********IMPORTANCT NOTE********
            //     DO NOT CHANGE the message's part "Your password has
            //     been expired" as it has to match on frontend side
            //     ********IMPORTANCT NOTE********/
            //     serviceResponse.Message = "Your password has been expired. Please reset it to use your account";
            //     return serviceResponse;
            // }

            // Get session
            var sessionId = new Guid(sessionIdString);
            var activeSession = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.Id == sessionId && w.UserId == user.Id)
                .SingleOrDefaultAsync();

            // Session not found
            if (activeSession == null)
            {
                _logger.LogInformation($"Active session not found for account {userName}");
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // TODO: Uncomment the DeviceId mismatch check when needed
            // // DeviceId did not match
            // if (activeSession.DeviceId != userAgent)
            // {
            //     _logger.LogInformation($"DeviceId did not match for session {activeSession.Id} and account {userName}");
            //     serviceResponse.Message = "Invalid credentials";
            //     return serviceResponse;
            // }

            // // RefreshToken did not match
            // if (activeSession.RefreshToken != refreshToken)
            // {
            //     _logger.LogInformation($"RefreshToken did not match for session {activeSession.Id} and account {userName}");
            //     serviceResponse.Message = "Invalid credentials";
            //     return serviceResponse;
            // }

            /*No need to check refreshToken expiry bcz 
            cookie won't exist if refreshToken is expired*/

            // Get Jwt and RefreshToken validity config
            var jwtExpiresOn = DateTimeOffset.UtcNow.AddMinutes(_environmentConfig.JwtValidityInMinutes);
            var refreshTokenExpiresOn = DateTimeOffset.UtcNow.AddDays(_environmentConfig.JwtRefreshTokenValidityInDays);

            // Retrieve the tenant's subscription along with the associated plan details.
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                 .GetByConditionAsync(w => w.TenantId == tenant.Id && w.IsActive)
                 .Include(i => i.Plan)
                 .FirstOrDefaultAsync();

            // Extract the current plan type from the subscription, if available.
            string? currentPlan = tenantSubscription?.Plan?.Type.ToString();

            // Create new Jwt string
            var jwt = CreateJwt(user, jwtExpiresOn, false, sessionId, currentPlan, tenant.Id, isReadOnly);

            // Create new RefreshToken
            var newRefreshToken = _authHelperService.CreateRefreshToken();

            // Update info of activeSession instance
            activeSession.RefreshToken = newRefreshToken;
            activeSession.SessionExpiresOn = refreshTokenExpiresOn;
            activeSession.LastRefreshOn = DateTimeOffset.UtcNow;

            // Update ActiveSession with concurrency handling
            // This handles React Strict Mode causing duplicate refresh requests
            try
            {
                _unitOfWork.ActiveSessionRepo.Update(activeSession);

                // Update ActiveSession failed
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation($"Context SaveChanges failed while refreshing active session for {user.UserName} and sessionId {sessionIdString}");
                    return serviceResponse;
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                // Another concurrent request already refreshed this session (e.g., React Strict Mode double-call)
                // Re-fetch the updated session and use its tokens

                // Re-fetch the session that was updated by the concurrent request
                activeSession = await _unitOfWork.ActiveSessionRepo
                    .GetByConditionAsync(w => w.Id == sessionId && w.UserId == user.Id)
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

                if (activeSession == null)
                {
                    serviceResponse.Message = "Invalid credentials";
                    return serviceResponse;
                }

                // Use the tokens from the already-refreshed session
                newRefreshToken = activeSession.RefreshToken;
                refreshTokenExpiresOn = activeSession.SessionExpiresOn;
            }

            // Append SessionId, Jwt/AccessToken, RefreshToken, and Username to cookies
            _authHelperService.SetCookie(CookieNamesEnum.SessionId.ToString(), activeSession.Id.ToString(), refreshTokenExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.AccessToken.ToString(), jwt, jwtExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.RefreshToken.ToString(), newRefreshToken, refreshTokenExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.UserName.ToString(), user.UserName, refreshTokenExpiresOn);


            // Create UserSessionDto
            var userSessionDto = new UserSessionDto()
            {
                TenantName = tenant.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserInitials = GetUserInitialsUtil.GetUserInitials(user.FirstName, user.LastName),
                AccessToken = jwt,
                RefreshToken = refreshToken,
                RTExpiresOn = refreshTokenExpiresOn,
                Country = tenant != null ? tenant.Country.ToString() : "NA",
                PlatformVersion = _appDefaultConfig.PlatformVersion
            };

            serviceResponse.Message = "Session has been refreshed successfully.";
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }

        return serviceResponse;
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
        bool isReadOnly = false)
    {
        // Initialize base claims required for all tokens
        var claims = new Dictionary<string, object>
        {
            ["tntid"] = tenantId,
            ["uid"] = user.Id.ToString(),
            ["uname"] = user.UserName,
            [JwtRegisteredClaimNames.Jti] = Guid.NewGuid().ToString(),
            ["access_mode"] = isReadOnly ? "read_only" : "read_write"
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