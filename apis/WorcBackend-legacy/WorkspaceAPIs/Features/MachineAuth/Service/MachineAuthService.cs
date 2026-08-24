namespace WorkspaceAPIs.Services;

public class MachineAuthService : IMachineAuthService
{
    private readonly ILogger<MachineAuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly WorkspaceDbContext _workspaceDbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly EnvironmentConfig _environmentConfig;

    public MachineAuthService(
        ILogger<MachineAuthService> logger,
        IUnitOfWork unitOfWork,
        WorkspaceDbContext workspaceDbContext,
        IHttpContextAccessor httpContextAccessor,
        EnvironmentConfig environmentConfig)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _workspaceDbContext = workspaceDbContext;
        _httpContextAccessor = httpContextAccessor;
        _environmentConfig = environmentConfig;
    }

    // Registers a machine and returns a JWT for its linked user account.
    public async Task<ServiceResponse<MachineAuthResDto>> RegisterMachineAsync(MachineAuthReqDto machineAuthReqDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = ServiceResponse<MachineAuthResDto>.Create("Failed to register machine", 500);

        try
        {
            // Resolve the tenant and linked user account for the request
            var tenantId = ResolveTenantId();
            var (linkedUser, jwtMismatch) = await ResolveLinkedUserAsync(machineAuthReqDto, tenantId);

            // JWT identity mismatch, return
            if (jwtMismatch)
                return serviceResponse.Update("Linked user account does not match the authenticated user.", 403);

            // Linked user not found, return
            if (linkedUser == null)
                return serviceResponse.Update("Linked user account not found.", 404);

            // Trim and normalize the machine identity fields
            var osId = machineAuthReqDto.OsID.Trim().ToLowerInvariant();
            var username = machineAuthReqDto.Username.Trim().ToLowerInvariant();
            var hostname = machineAuthReqDto.Hostname.Trim().ToLowerInvariant();
            var serviceAccountUsername = string.IsNullOrWhiteSpace(machineAuthReqDto.ServiceAccountUsername)
                ? username
                : machineAuthReqDto.ServiceAccountUsername.Trim().ToLowerInvariant();

            var machineName = MachinesTableHelpers.BuildMachineName(machineAuthReqDto.OperatingSystem, osId, serviceAccountUsername);

            // Look for an existing machine by its unique stable name first. This handles the
            // common case where the same physical machine re-registers with a different
            // username (e.g. desktop app vs. Windows service running as LocalSystem).
            var machine = await _workspaceDbContext.Machines
                .FirstOrDefaultAsync(m =>
                    m.TenantId == tenantId &&
                    m.Name.ToLower() == machineName.ToLower());

            // Fallback to the legacy (OsID, Username) lookup for records created before
            // the unique-name upsert behavior was introduced.
            machine ??= await _workspaceDbContext.Machines
                .FirstOrDefaultAsync(m =>
                    m.TenantId == tenantId &&
                    m.OsID.ToLower() == osId &&
                    m.Username.ToLower() == username);

            // Create the machine if it does not exist yet
            if (machine == null)
            {
                machine = new Machine
                {
                    Name = machineName,
                    OperatingSystem = machineAuthReqDto.OperatingSystem,
                    OsID = osId,
                    Username = username,
                    Hostname = hostname,
                    UserId = linkedUser.Id,
                    TenantId = tenantId,
                    LastCheckedIn = DateTime.UtcNow,
                    IsDisabled = false
                };

                await _workspaceDbContext.Machines.AddAsync(machine);
            }
            else
            {
                // Refresh the mutable identity fields of the existing machine
                machine.Name = machineName;
                machine.OperatingSystem = machineAuthReqDto.OperatingSystem;
                machine.OsID = osId;
                machine.Username = username;
                machine.Hostname = hostname;
                machine.UserId = linkedUser.Id;
                machine.LastCheckedIn = DateTime.UtcNow;
                machine.IsDisabled = false;
            }

            // Persist changes; an unchanged machine (idempotent re-registration) is still a success
            await _workspaceDbContext.SaveChangesAsync();

            // Mint the JWT for the linked user account
            var (jwt, expiresOn) = MachineAuthTokenHelper.CreateMachineJwt(_environmentConfig, tenantId, linkedUser.Id, linkedUser.UserName);

            // Task successful
            return serviceResponse.Update("Machine registered", 200, new MachineAuthResDto
            {
                Jwt = jwt,
                ExpiresOn = expiresOn,
                MachineId = machine.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while registering machine with OS ID {OsID} and Username {Username}", machineAuthReqDto.OsID, machineAuthReqDto.Username);
            return serviceResponse;
        }
    }

    // Validates a registered machine and returns a JWT for its linked user account.
    public async Task<ServiceResponse<MachineAuthResDto>> ValidateMachineAsync(MachineAuthReqDto machineAuthReqDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = ServiceResponse<MachineAuthResDto>.Create("Failed to validate machine", 500);

        try
        {
            // Resolve the tenant for the request
            var tenantId = ResolveTenantId();

            // Trim and normalize the machine identity fields
            var osId = machineAuthReqDto.OsID.Trim().ToLowerInvariant();
            var username = machineAuthReqDto.Username.Trim().ToLowerInvariant();

            // Look for a registered machine with the same OS ID and username in the tenant
            var machine = await _workspaceDbContext.Machines
                .FirstOrDefaultAsync(m =>
                    m.TenantId == tenantId &&
                    m.OsID.ToLower() == osId &&
                    m.Username.ToLower() == username);

            // Machine not found, return
            if (machine == null)
                return serviceResponse.Update("Machine not found.", 404);

            // Disabled machine cannot authenticate, return
            if (machine.IsDisabled)
                return serviceResponse.Update("Machine is disabled.", 403);

            // Refresh the last checked-in timestamp
            machine.LastCheckedIn = DateTime.UtcNow;
            await _workspaceDbContext.SaveChangesAsync();

            // Resolve the linked user account of the machine
            var linkedUser = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(u => u.Id == machine.UserId && u.TenantId == tenantId)
                .FirstOrDefaultAsync();

            // Linked user not found, return
            if (linkedUser == null)
                return serviceResponse.Update("Linked user account not found.", 404);

            // Mint the JWT for the linked user account
            var (jwt, expiresOn) = MachineAuthTokenHelper.CreateMachineJwt(_environmentConfig, tenantId, linkedUser.Id, linkedUser.UserName);

            // Task successful
            return serviceResponse.Update(null, 200, new MachineAuthResDto
            {
                Jwt = jwt,
                ExpiresOn = expiresOn,
                MachineId = machine.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while validating machine with OS ID {OsID} and Username {Username}", machineAuthReqDto.OsID, machineAuthReqDto.Username);
            return serviceResponse;
        }
    }

    // Resolves the tenant ID from the JWT claims or the X-TENANT-ID header.
    private Guid ResolveTenantId()
    {
        // Prefer the tenant from the JWT claims when the caller is authenticated
        var tenantClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid");
        if (Guid.TryParse(tenantClaim, out var tenantId) && tenantId != Guid.Empty)
            return tenantId;

        // Fall back to the X-TENANT-ID header for API-key authenticated callers
        if (_httpContextAccessor.HttpContext?.Request.Headers.TryGetValue("X-TENANT-ID", out var headerTenantId) == true &&
            Guid.TryParse(headerTenantId, out var headerTenant) && headerTenant != Guid.Empty)
        {
            return headerTenant;
        }

        return Guid.Empty;
    }

    // Resolves the linked workspace user from the payload's linked user account identifier.
    // When the caller is JWT authenticated, the linked account must match the JWT's uid.
    // Returns a tuple of the resolved user and whether a JWT identity mismatch was detected.
    private async Task<(WorkspaceUser? User, bool JwtMismatch)> ResolveLinkedUserAsync(MachineAuthReqDto machineAuthReqDto, Guid tenantId)
    {
        // Try to parse the identifier as a user GUID first
        if (Guid.TryParse(machineAuthReqDto.LinkedUserAccountId, out var userId))
        {
            var user = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(u => u.Id == userId && u.TenantId == tenantId)
                .FirstOrDefaultAsync();

            // Flag the JWT identity mismatch when an authenticated caller requests another account
            if (user != null && !IsJwtIdentityMatching(user.Id))
                return (null, true);

            return (user, false);
        }

        // Otherwise treat the identifier as a unique username
        var userByUserName = await _unitOfWork.WorkspaceUserRepo
            .GetByConditionAsync(u => u.UserName.ToLower() == machineAuthReqDto.LinkedUserAccountId.Trim().ToLower() && u.TenantId == tenantId)
            .FirstOrDefaultAsync();

        // Flag the JWT identity mismatch when an authenticated caller requests another account
        if (userByUserName != null && !IsJwtIdentityMatching(userByUserName.Id))
            return (null, true);

        return (userByUserName, false);
    }

    // Returns true when the caller is not JWT authenticated or when the JWT uid matches the given user id.
    private bool IsJwtIdentityMatching(Guid userId)
    {
        // Anonymous (API-key) callers are not constrained to a specific identity
        if (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated != true)
            return true;

        // Authenticated callers must match the linked account they request
        var uidClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("uid");
        return Guid.TryParse(uidClaim, out var uid) && uid == userId;
    }
}
