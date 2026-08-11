namespace AccountsAPIs.Services;

public class AuthHelperService : IAuthHelperService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly HttpContext _httpContext;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ILogger<AuthHelperService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public AuthHelperService(
        UserManager<AccountUser> userManager,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuthHelperService> logger,
        IUnitOfWork unitOfWork,
        EnvironmentConfig environmentConfig)
    {
        _userManager = userManager;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _environmentConfig = environmentConfig;
    }

    // Validates the null, disabled, and expired status of a tenant.
    public bool IsUserTenantValid(Tenant tenant, string userName)
    {
        try
        {
            // Tenant is null
            if (tenant == null)
            {
                _logger.LogInformation($"Tenant account not found, while trying to fetch tenant info for email {userName}");
                return false;
            }

            // Tenant is disabled. This does not apply to default Tenant (Individual Users)
            if (tenant.IsDisabled && tenant.IsDefault == false)
            {
                _logger.LogInformation($"Tenant account is disabled, while trying to fetch tenant info for email {userName}");
                return false;
            }

            // Tenant account has expired. This does not apply to default Tenant (Individual Users)
            if (tenant.ExpiresOn < DateTimeOffset.UtcNow && tenant.IsDefault == false)
            {
                _logger.LogInformation($"Tenant account has been expired, while trying to fetch tenant info for email {userName}");
                return false;
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"IsUserTenantValid Error: {ex.Message} for username {userName}");
            return false;
        }
    }

    // Checks if the new password passes the obsolete password policy.
    public async Task<bool> DoesNewPwdPassObsoletePwdPolicy(string newPwd, AccountUser user)
    {
        try
        {
            // Get ObsoletePwd list of user
            var userObsoletePwdList = await _unitOfWork.ObsoletePwdRepo
                    .GetByConditionAsync(w => w.UserId == user.Id)
                    .ToListAsync();

            // If obsoletePwds are zero
            if (userObsoletePwdList.Count() == 0)
                return true;

            // loop
            foreach (var obsoletePwd in userObsoletePwdList)
            {
                if (_userManager.PasswordHasher.VerifyHashedPassword(
                        user, obsoletePwd.PwdHash, newPwd) == PasswordVerificationResult.Success)
                {
                    return false;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }

        return true;
    }

    // Saves the password in the obsolete password list.
    public async Task<bool> SavePwdInObsoletePwdList(AccountUser user, string pwdToBeSaved, DateTimeOffset pwdSetOn)
    {
        try
        {
            // Create ObsoletePwd instance
            var obsoletePwd = new ObsoletePwd()
            {
                PwdHash = _userManager.PasswordHasher.HashPassword(user, pwdToBeSaved),
                PwdSetOn = pwdSetOn,
                UserId = user.Id,
            };

            // Insert-ObsoletePwd
            await _unitOfWork.ObsoletePwdRepo.InsertAsync(obsoletePwd);

            // Keep ObsoletePwd upto retain limit and delete reset
            _unitOfWork.ObsoletePwdRepo.Delete(await _unitOfWork.ObsoletePwdRepo
                    .GetByConditionAsync(w => w.UserId == user.Id)
                    .OrderByDescending(o => o.PwdSetOn)
                    .Skip(_environmentConfig.ObsoletePwdRetainLimit)
                    .ToListAsync());

            // Context SaveChanges job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Context SaveChanges failed. " +
                    $"While inserting ObsoletePwd " +
                    $"for username - {user.Email}");
                return false;
            }

            // Pass
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"SavePwdInObsoletePwdList Error: {ex.Message} for username {user.UserName}");
            return false;
        }
    }

    // Deletes all expired and active verification codes for the provided username and user agent.
    public async Task<bool> DeleteVerificationCodes(string userName, string userAgent)
    {
        try
        {
            // Get codes (expired + active for current tenant and userName and userAgent)
            var verificaitonCodeList = await _unitOfWork.VerificationCodeRepo
                                        .GetByConditionAsync(w =>
                                            (w.ExpiresOn <= DateTimeOffset.UtcNow) ||
                                            (
                                                //  w.DeviceId == userAgent && // TODO: Uncomment to check for DeviceId mismatch when needed
                                                w.Email == userName
                                            )
                                        )
                                        .ToListAsync();

            // No codes found
            if (verificaitonCodeList.Count() == 0)
            {
                // No need to log "No expired verification code found" as it is unnecessary
                return true;
            }

            // Delete verificaitonCodeList
            _unitOfWork.VerificationCodeRepo.Delete(verificaitonCodeList);

            // Delete-verificaitonCodeList job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting " +
                    $"verification codes for username - {userName} and device Id - {userAgent}");
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }

        return true;
    }

    // Creates a JSON Web Token (JWT) for a user session or a single user.
    public string CreateJwt(AccountUser user, DateTimeOffset jwtExpiresOn, bool isSingleUseJwt = false, Guid? sessionId = null, string? currentPlan = null)
    {
        // Base claims
        var claims = new Dictionary<string, object>
        {
            ["tntid"] = user.Tenant?.Id.ToString(),
            ["uid"] = user.Id.ToString(),
            ["uname"] = user.UserName,
            ["name"] = $"{user.FirstName} {user.LastName}".Trim(),
            [JwtRegisteredClaimNames.Jti] = Guid.NewGuid().ToString(),
        };

        // If Jwt is a single use Jwt. (in case of pwd reset Jwt. Roles and session id are not required)
        if (!isSingleUseJwt)
        {
            // Add Role claims (Note: ASP.NET Core expects roles to be provided in a claim of type ClaimTypes.Role.)
            claims.Add(ClaimTypes.Role, user.UserRoles.OrderBy(o => o.Role?.Seq).Select(s => s.Role?.Name).ToList());

            // Add session id
            claims.Add("sid", sessionId.ToString());

            // Add tenant type (Enterprise or other)
            claims.Add("type", _environmentConfig.OnPremTenantType);

            // Add subscription plan information, if applicable
            claims.Add("plan", _environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString()
                ? (_environmentConfig.OnPremExecutionDisabled ? "Inactive" : "Active")
                : currentPlan);

            // Add permission access
            claims["permissions"] = user.UserRoles
                .Where(w => w.Role != null && w.Role.RolePermissions != null)
                .SelectMany(s => s.Role.RolePermissions)
                .Where(w => w.Permission != null)
                .GroupBy(g => g.Permission.Name)
                .ToDictionary(
                    td => (int)Enum.Parse(typeof(PermissionTypesEnum), td.Key),
                    td => JsonSerializer.Serialize(td.Select(a => (int)a.Access).ToList()));
        }

        // SigningCredentials
        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_environmentConfig.JwtSecretKey)),
            SecurityAlgorithms.HmacSha512);

        // TokenOptions
        var securityTokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = $"https://{_environmentConfig.AppBaseUrl}",
            Audience = $"https://{_environmentConfig.AppBaseUrl}",
            Claims = claims,
            IssuedAt = DateTime.UtcNow,
            Expires = jwtExpiresOn.UtcDateTime,
            SigningCredentials = signingCredentials
        };

        var jsonWebTokenHandler = new Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler();
        jsonWebTokenHandler.SetDefaultTimesOnTokenCreation = false;

        // Return Jwt
        return jsonWebTokenHandler.CreateToken(securityTokenDescriptor);
    }

    // Creates a random refresh token.
    public string CreateRefreshToken()
    {
        var randomNo = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNo);
            return Convert.ToBase64String(randomNo);
        }
    }

    // Sets a cookie with the specified name, value, expiry, and subpath.
    public void SetCookie(string name, string value, DateTimeOffset? expiry = null, string? subPath = null)
    {
        /*HttpOnly=true, Secure=true, Domain, SameSite already set in 
        builder.Services.ConfigureCookiePolicyOptions(config)*/

        // If expiry and subPath are null
        if (!expiry.HasValue && string.IsNullOrWhiteSpace(subPath))
        {
            _httpContext.Response.Cookies.Append(name, value);
            return;
        }

        // Create cookieOptions
        var cookieOptions = new CookieOptions();

        // Set domain
        cookieOptions.Domain = _environmentConfig.AppBaseUrl;

        // Set expiry
        if (expiry.HasValue) cookieOptions.Expires = expiry;

        // Set sub path
        if (!string.IsNullOrWhiteSpace(subPath)) cookieOptions.Path = subPath;

        // Append cookie
        _httpContext.Response.Cookies.Append(name, value, cookieOptions);
    }

    // Removes a cookie with the specified name.
    public void RemoveCookie(string name, string? subPath = null)
    {
        _httpContext.Response.Cookies.Delete(name, new CookieOptions
        {
            Domain = _environmentConfig.AppBaseUrl,
            Path = string.IsNullOrWhiteSpace(subPath) ? "/" : subPath
        });

    }

    // Creates or updates a user in other databases asynchronously.
    public async Task<bool> CreateOrUpdateUserInOtherDbsAsync(AccountUser accountUser, CrudTypesEnum crudType, string jwt)
    {
        // Create AppUser dto object to post or put
        var user = new AppUserBaseDto()
        {
            Id = accountUser.Id,
            UserName = accountUser.UserName ?? "username-not-found",
            FirstName = accountUser.FirstName,
            LastName = accountUser.LastName,
            AvatarSrc = accountUser.AvatarSrc,
        };

        // Create or Update user in WorkspaceDb database
        HttpResponseMessage response = await RequestExternalAPIUtil.RequestExternalAPI(crudType, $"{_environmentConfig.WorkspaceApiBaseUrl}/api/user", jwt, user);

        // Failed to Create or Update user in Workspace database
        if (!response.IsSuccessStatusCode)
        {
            string errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError($"Failed to {crudType} user in Workspace database for {user.UserName}. Response: {response.StatusCode} - {errorContent}");
            return false;
        }

        return true;
    }

    // Deletes a user from other databases asynchronously.
    public async Task<bool> DeleteUserInOtherDbsAsync(Guid userId, string jwt)
    {
        // Delete user in WorkspaceDb database
        HttpResponseMessage response = await RequestExternalAPIUtil.RequestExternalAPI(CrudTypesEnum.Delete, $"{_environmentConfig.WorkspaceApiBaseUrl}/api/user/{userId}", jwt);
        // Failed to Delete user in Workspace database
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogInformation($"Failed to delete user in Workspace database for user Id: {userId}");
            return false;
        }

        return true;
    }
}