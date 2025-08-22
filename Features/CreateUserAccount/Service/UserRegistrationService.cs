namespace AccountsAPIs.Services;

public class UserRegistrationService : IUserRegistrationService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly ILogger<UserRegistrationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;
    private readonly GeneralConfig _generalConfig;
    private readonly Guid _userId;

    public UserRegistrationService(
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        ILogger<UserRegistrationService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        GeneralConfig generalConfig,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _emailService = emailService;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authHelperService = authHelperService;
        _generalConfig = generalConfig;

        // Extract user ID from the claims
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Creates a new account for an individual user (IU) or Aventisia employee.
    public async Task<ServiceResponse<AccountUser>> CreateAccountAsync(CreateAccountDto createAccountDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AccountUser>()
        {
            Data = null,
            Message = "Failed to create your account. Please try again later"
        };

        try
        {
            // Get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => EF.Functions.ILike(createAccountDto.Email, w.UserName))
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

            // User already exists
            if (user != null)
            {
                _logger.LogInformation($"User account already exists for email {createAccountDto.Email}");
                serviceResponse.Message = "User account already exists";
                return serviceResponse;
            }

            // Get Verification secret code
            var verificationCode = await _unitOfWork.VerificationCodeRepo
                       .GetByConditionAsync(w => w.Id == createAccountDto.VerificationCodeId)
                       .SingleOrDefaultAsync();

            // Verification secret code not found
            if (verificationCode == null)
            {
                _logger.LogInformation($"Verification code not found for email {createAccountDto.Email}");
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }

            // Match Verification secret code
            var verificationCodeMatches = verificationCode.SecretCode.Equals(createAccountDto.SecretCode)
                && DateTimeOffset.UtcNow < verificationCode.ExpiresOn;

            // Delete Verification secret Code
            _unitOfWork.VerificationCodeRepo.Delete(verificationCode);
            await _unitOfWork.SaveAsync();

            // Secret code did not match
            if (!verificationCodeMatches)
            {
                _logger.LogInformation($"Invalid verification code for email {createAccountDto.Email}");
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }

            // Create new User instacne
            var newPwdSetOn = DateTimeOffset.UtcNow;
            var newUserId = Guid.NewGuid();
            var newUser = new AccountUser()
            {
                Id = newUserId,
                UserName = createAccountDto.Email.ToLower(),
                EmailConfirmed = true,
                Email = createAccountDto.Email.ToLower(),
                FirstName = CapitalizeFirstLetterUtil.CapitalizeFirstLetter(createAccountDto.FirstName),
                LastName = CapitalizeFirstLetterUtil.CapitalizeFirstLetter(createAccountDto.LastName),
                CreatedByUserId = newUserId,
                LastModifiedByUserId = newUserId,
                PwdSetOn = newPwdSetOn,
                IsDefault = false, // DO NOT CHANGE THIS
                IsEditable = true, // DO NOT CHANGE THIS
            };

            // Create new user in AccountsDb
            var createUserResult = await _userManager.CreateAsync(newUser, createAccountDto.Pwd);

            // New user creation failed
            if (!createUserResult.Succeeded)
            {
                // Log create user errors
                foreach (var error in createUserResult.Errors)
                    _logger.LogError($"New user creation failed. ErrorCode: {error.Code}, Description: {error.Description}");

                // Return common error for both
                serviceResponse.Message = "Failed to create your account. Please try again later";
                return serviceResponse;
            }

            // Saving pwd (if available) in ObsoletePwd failed
            if (!await _authHelperService.SavePwdInObsoletePwdList(newUser, createAccountDto.Pwd, newPwdSetOn))
            {
                _logger.LogInformation($"Not able to save new pwd in ObsoletePwd list. Tried to create account for email {createAccountDto.Email}");
                return serviceResponse;
            }

            // Create placeholder values for email template
            var placeholderValues = new Dictionary<string, string>() { { "{{userFirstName}}", newUser.FirstName } };

            // Failed to send AccountCreated email
            if (!await _emailService.SendEmailUsingTemplate(emailType: EmailTypesEnum.AccountCreated, toEmailAddress: createAccountDto.Email, placeholderValues: placeholderValues,
                bccEmailAddresses: _generalConfig.SalesEmails))
            {
                _logger.LogError($"Error occurred while sending account creation confirmation email to {createAccountDto.Email}");
                /*Still moving forward as account is already saved in the database*/
            }

            // New user created
            _logger.LogInformation($"{createAccountDto.Email} account has been created successfully");

            /*Fetching again to get newUser with Tenant and Roles details*/
            var newlyAddedUser = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => EF.Functions.ILike(createAccountDto.Email, w.UserName))
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Task successful
            serviceResponse.Data = newlyAddedUser;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "New user has been created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates the tenant organization details for a specified user.
    public async Task<ServiceResponse<AccountUser>> UpdateTenantOrganizationAsync(TenantOrganizationDto tenantOrganizationDto)
    {
        // Default failure response
        var serviceResponse = new ServiceResponse<AccountUser>
        {
            Data = null,
            Message = "Failed to update tenant organization. Please try again later."
        };

        try
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(tenantOrganizationDto.Domain) ||
                string.IsNullOrWhiteSpace(tenantOrganizationDto.OrganizationName))
            {
                serviceResponse.Message = "Organization name and domain are required.";
                return serviceResponse;
            }

            // Validate domain format using regex
            var domainPattern = @"^(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$";
            var domain = tenantOrganizationDto.Domain.Trim().ToLower();

            if (!Regex.IsMatch(domain, domainPattern))
            {
                serviceResponse.Message = "Invalid domain format. Example: 'example.com' or 'www.example.org'.";
                return serviceResponse;
            }

            // Remove 'www.' if present
            var cleanDomain = domain.StartsWith("www.") ? domain.Substring(4) : domain;

            // Get the user by ID
            var user = await _userManager.FindByIdAsync(_userId.ToString());
            if (user == null)
            {
                serviceResponse.Message = "User not found.";
                return serviceResponse;
            }

            if (user.TenantId != null)
            {
                serviceResponse.Message = "This user is already assigned to an organization and cannot be reassigned.";
                return serviceResponse;
            }

            Tenant? userTenant = null;
            List<string> userRoles = new();

            // Case: Individual Users tenant
            var isIndividualUser = tenantOrganizationDto.OrganizationName.Equals(
                GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers),
                StringComparison.InvariantCultureIgnoreCase) ||
            tenantOrganizationDto.OrganizationName.Equals(
                GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.Aventisia),
                StringComparison.InvariantCultureIgnoreCase);
            if (isIndividualUser)
            {
                // Assign existing 'Individual Users' tenant
                userTenant = await _unitOfWork.TenantRepo
                    .GetByConditionAsync(w => w.Name.ToLower() == tenantOrganizationDto.OrganizationName.ToLower())
                    .SingleOrDefaultAsync();

                // Assign AE or IU role based on domain
                userRoles.Add(domain.Equals("aventisia.com", StringComparison.OrdinalIgnoreCase)
                    ? CustomRolesEnum.AE.ToString()
                    : CustomRolesEnum.IU.ToString());
            }
            else
            {
                // Check if tenant name already exists
                var existingTenant = await _unitOfWork.TenantRepo
                    .GetByConditionAsync(w => w.Name.ToLower() == tenantOrganizationDto.OrganizationName.ToLower())
                    .SingleOrDefaultAsync();

                if (existingTenant != null)
                {
                    _logger.LogInformation("Tenant update blocked: '{TenantName}' already exists. Requested by user {UserId}.",
                        existingTenant.Name, _userId);

                    serviceResponse.Message = $"Tenant '{existingTenant.Name}' already exists. Please contact support.";
                    return serviceResponse;
                }

                // Create a new tenant
                userTenant = new Tenant
                {
                    Id = Guid.NewGuid(),
                    Name = tenantOrganizationDto.OrganizationName,
                    Type = TenantTypesEnum.Shared,
                    Currency = CurrencyTypesEnum.USD,
                    ExpiresOn = DateTimeOffset.UtcNow.AddYears(1),
                    // Optional initial properties
                    // Domain = cleanDomain,
                    // Role = tenantOrganizationDto.Role,
                    // NumberOfEmployees = tenantOrganizationDto.EmployeeCount,
                    // Industry = tenantOrganizationDto.Industry,
                    // Country = tenantOrganizationDto.Country.ToString(),
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                };

                await _unitOfWork.TenantRepo.InsertAsync(userTenant);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Tenant creation failed for '{TenantName}' (ID: {TenantId}).", userTenant.Name, userTenant.Id);
                    return serviceResponse;
                }

                // Assign TA role to tenant admin
                userRoles.Add(CustomRolesEnum.TA.ToString());

                _logger.LogInformation("New tenant '{TenantName}' (ID: {TenantId}) created by user {UserId}.",
                    userTenant.Name, userTenant.Id, _userId);
            }

            // Assign roles to user
            var addToRolesResult = await _userManager.AddToRolesAsync(user, userRoles);

            if (!addToRolesResult.Succeeded)
            {
                foreach (var error in addToRolesResult.Errors)
                {
                    _logger.LogError("Role assignment failed for user {UserId}. Code: {Code}, Description: {Description}",
                        user.Id, error.Code, error.Description);
                }

                serviceResponse.Message = "Failed to assign user roles. Please try again later.";
                return serviceResponse;
            }

            // Link tenant to user and update
            user.TenantId = userTenant.Id;
            user.LastModifiedByUserId = user.Id;

            _unitOfWork.AccountUserRepo.Update(user);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to update user {UserId} with new tenant ID {TenantId}.", user.Id, userTenant.Id);
                return serviceResponse;
            }

            _logger.LogInformation("User {UserId} successfully updated with tenant '{TenantName}' (ID: {TenantId}).",
                user.Id, userTenant.Name, userTenant.Id);

            /*Fetching again to get newUser with Tenant and Roles details*/
            var newlyAddedUser = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => EF.Functions.ILike(user.Email, w.UserName))
                .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Prepare response
            serviceResponse.Data = user;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant organization updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating tenant for user {UserId}.", _userId);
        }

        return serviceResponse;
    }
}