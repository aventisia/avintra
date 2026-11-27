using Microsoft.Extensions.Caching.Distributed;

namespace AccountsAPIs.Services;

public class DesktopSignInService : IDesktopSignInService
{
    private const string DesktopSignInCachePrefix = "desktop-auth:";
    private const string InvalidCodeMessage = "Invalid or expired desktop sign-in code.";
    private const string InvalidAttemptMessage = "Invalid desktop sign-in request.";
    private static readonly TimeSpan DesktopSignInCodeTtl = TimeSpan.FromMinutes(5);
    private static readonly object DesktopSignInCodeConsumeLock = new();

    private readonly ILogger<DesktopSignInService> _logger;
    private readonly IDistributedCache _desktopSignInCache;
    private readonly IAuthHelperService _authHelperService;
    private readonly IAuthService _authService;
    private readonly ISessionValidationService _sessionValidationService;
    private readonly AccountsDbContext _accountsDbContext;

    public DesktopSignInService(
        ILogger<DesktopSignInService> logger,
        IDistributedCache desktopSignInCache,
        IAuthHelperService authHelperService,
        IAuthService authService,
        ISessionValidationService sessionValidationService,
        AccountsDbContext accountsDbContext)
    {
        _logger = logger;
        _desktopSignInCache = desktopSignInCache;
        _authHelperService = authHelperService;
        _authService = authService;
        _sessionValidationService = sessionValidationService;
        _accountsDbContext = accountsDbContext;
    }

    public async Task<ServiceResponse<DesktopSignInMintResultDto>> MintDesktopSignInCodeAsync(
        Guid userId, Guid sessionId, DesktopSignInMintDto desktopSignInMintDto)
    {
        var serviceResponse = ServiceResponse<DesktopSignInMintResultDto>.Create(
            "Failed to start desktop sign-in. Please try again.", 500);

        if (!DesktopSignInHelpers.IsLoopbackRedirectUri(desktopSignInMintDto.RedirectUri))
            return serviceResponse.Update("Only a loopback return address is allowed.", 400);

        if (string.IsNullOrWhiteSpace(desktopSignInMintDto.State)
            || !DesktopSignInHelpers.IsValidCodeChallenge(desktopSignInMintDto.CodeChallenge))
            return serviceResponse.Update(InvalidAttemptMessage, 400);

        if (!await _sessionValidationService.IsSessionValidAsync(sessionId))
            return serviceResponse.Update("Session expired.", 401);

        var user = await LoadUserForSignInAsync(userId);
        if (user == null)
            return serviceResponse.Update("Failed to sign you in. Please try again.", 401);

        var signInBlockMessage = _authHelperService.GetSignInBlockMessage(user);
        if (signInBlockMessage != null)
        {
            _logger.LogWarning("Desktop sign-in mint rejected for a disabled, deleted or tenant-invalid account. UserId={UserId}", userId);
            return serviceResponse.Update(signInBlockMessage, 401);
        }

        // IMPORTANT NOTE: the cache is process memory, so read-and-delete is only single use on a single replica or with sticky sessions.
        var code = SocialAuthHelpers.GenerateOpaqueValue();
        await _desktopSignInCache.SetStringAsync(
            BuildDesktopSignInCacheKey(code),
            JsonSerializer.Serialize(new DesktopSignInCodeDto
            {
                UserId = userId,
                StateHash = DesktopSignInHelpers.GenerateHash(desktopSignInMintDto.State),
                ChallengeHash = DesktopSignInHelpers.GenerateHash(desktopSignInMintDto.CodeChallenge)
            }),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = DesktopSignInCodeTtl });

        return serviceResponse.Update("Desktop sign-in code created.", 200, new DesktopSignInMintResultDto { Code = code });
    }

    public async Task<ServiceResponse<UserSessionDto>> ExchangeDesktopSignInCodeAsync(
        DesktopSignInExchangeDto desktopSignInExchangeDto)
    {
        var serviceResponse = ServiceResponse<UserSessionDto>.Create(
            "Failed to sign you in. Please try again.", 500);

        if (string.IsNullOrWhiteSpace(desktopSignInExchangeDto.Code)
            || string.IsNullOrWhiteSpace(desktopSignInExchangeDto.State)
            || !DesktopSignInHelpers.IsValidCodeVerifier(desktopSignInExchangeDto.CodeVerifier))
            return serviceResponse.Update(InvalidCodeMessage, 400);

        var desktopSignInCode = ConsumeDesktopSignInCode(desktopSignInExchangeDto.Code);
        if (desktopSignInCode == null)
            return serviceResponse.Update(InvalidCodeMessage, 400);

        var codeChallenge = SocialAuthHelpers.GenerateCodeChallenge(desktopSignInExchangeDto.CodeVerifier);
        if (!DesktopSignInHelpers.IsHashMatch(desktopSignInCode.StateHash, desktopSignInExchangeDto.State)
            || !DesktopSignInHelpers.IsHashMatch(desktopSignInCode.ChallengeHash, codeChallenge))
        {
            _logger.LogWarning("Desktop sign-in exchange rejected because the state or code verifier did not match. UserId={UserId}", desktopSignInCode.UserId);
            return serviceResponse.Update(InvalidCodeMessage, 400);
        }

        var user = await LoadUserForSignInAsync(desktopSignInCode.UserId);
        if (user == null)
            return serviceResponse.Update("Failed to sign you in. Please try again.", 401);

        var signInBlockMessage = _authHelperService.GetSignInBlockMessage(user);
        if (signInBlockMessage != null)
        {
            _logger.LogWarning("Desktop sign-in exchange rejected for a disabled, deleted or tenant-invalid account. UserId={UserId}", desktopSignInCode.UserId);
            return serviceResponse.Update(signInBlockMessage, 401);
        }

        return await _authService.CreateUserSessionAsync(user);
    }

    private DesktopSignInCodeDto? ConsumeDesktopSignInCode(string code)
    {
        var cacheKey = BuildDesktopSignInCacheKey(code);

        string? stored;
        lock (DesktopSignInCodeConsumeLock)
        {
            stored = _desktopSignInCache.GetString(cacheKey);
            if (stored == null) return null;

            _desktopSignInCache.Remove(cacheKey);
        }

        try
        {
            return JsonSerializer.Deserialize<DesktopSignInCodeDto>(stored);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private async Task<AccountUser?> LoadUserForSignInAsync(Guid userId)
    {
        return await _accountsDbContext.Users
            .Where(w => w.Id == userId)
            .AsSplitQuery()
            .AsNoTracking()
            .Include(i => i.Tenant)
            .Include(i => i.UserRoles)
                .ThenInclude(i1 => i1.Role)
                    .ThenInclude(i2 => i2.RolePermissions)
                        .ThenInclude(i3 => i3.Permission)
            .SingleOrDefaultAsync();
    }

    private static string BuildDesktopSignInCacheKey(string code) => $"{DesktopSignInCachePrefix}{code}";
}
