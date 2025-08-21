namespace AccountsAPIs.Services;

public class UserRegistrationService : IUserRegistrationService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly ILogger<UserRegistrationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;
    private readonly GeneralConfig _generalConfig;

    public UserRegistrationService(
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        ILogger<UserRegistrationService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        GeneralConfig generalConfig)
    {
        _userManager = userManager;
        _emailService = emailService;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authHelperService = authHelperService;
        _generalConfig = generalConfig;
    }

    // Registers a new user or employee account.
    public async Task<ServiceResponse<AccountUsersTableDto>> RegisterUserAsync(CreateUserAccountDto createUserAccountDto)
    {
        // Default failure response
        var serviceResponse = new ServiceResponse<AccountUsersTableDto>
        {
            Data = null,
            Message = "Account registration failed. Please try again later."
        };

        try
        {
            // Check if the user already exists
            var existingUser = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => EF.Functions.ILike(createUserAccountDto.Email, w.UserName))
                .AsNoTracking()
                .SingleOrDefaultAsync();

            if (existingUser != null)
            {
                _logger.LogInformation("Registration failed: User already exists for {Email}.", createUserAccountDto.Email);
                serviceResponse.Message = "An account with this email already exists.";
                return serviceResponse;
            }

            // Validate verification code
            var verificationCode = await _unitOfWork.VerificationCodeRepo
                .GetByConditionAsync(w => w.Id == createUserAccountDto.VerificationCodeId)
                .SingleOrDefaultAsync();

            if (verificationCode == null)
            {
                _logger.LogInformation("Registration failed: No verification code found for {Email}.", createUserAccountDto.Email);
                serviceResponse.Message = "Verification failed. Please check your code and try again.";
                return serviceResponse;
            }

            var verificationCodeMatches = verificationCode.SecretCode.Equals(createUserAccountDto.SecretCode)
                                          && DateTimeOffset.UtcNow < verificationCode.ExpiresOn;

            // Delete the code regardless of match
            _unitOfWork.VerificationCodeRepo.Delete(verificationCode);
            await _unitOfWork.SaveAsync();

            if (!verificationCodeMatches)
            {
                _logger.LogInformation("Registration failed: Invalid or expired code for {Email}.", createUserAccountDto.Email);
                serviceResponse.Message = "Verification failed. Please check your code and try again.";
                return serviceResponse;
            }

            // Create new user
            var newUserId = Guid.NewGuid();
            var newUser = new AccountUser
            {
                Id = newUserId,
                UserName = createUserAccountDto.Email.ToLower(),
                Email = createUserAccountDto.Email.ToLower(),
                EmailConfirmed = true,
                FirstName = string.Empty,
                LastName = string.Empty,
                CreatedByUserId = newUserId,
                LastModifiedByUserId = newUserId,
                IsDefault = false,
                IsEditable = true,
                // Add any other initial property setup here
            };

            var createUserResult = await _userManager.CreateAsync(newUser);

            if (!createUserResult.Succeeded)
            {
                foreach (var error in createUserResult.Errors)
                {
                    _logger.LogError("User creation failed. Code: {Code}, Description: {Description}", error.Code, error.Description);
                }

                serviceResponse.Message = "Account creation failed. Please try again later.";
                return serviceResponse;
            }

            // Send welcome email (non-blocking)
            var placeholderValues = new Dictionary<string, string>();

            var emailSent = await _emailService.SendEmailUsingTemplate(
                emailType: EmailTypesEnum.AccountCreated,
                toEmailAddress: createUserAccountDto.Email,
                placeholderValues: placeholderValues,
                bccEmailAddresses: _generalConfig.SalesEmails);

            if (!emailSent)
            {
                _logger.LogError("Account created, but failed to send confirmation email to {Email}.", createUserAccountDto.Email);
            }

            _logger.LogInformation("User registered successfully: {Email}", createUserAccountDto.Email);

            // Return final response
            serviceResponse.Data = newUser.Adapt<AccountUsersTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your account has been created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during registration for {Email}.", createUserAccountDto.Email);
        }

        return serviceResponse;
    }

    // Updates the tenant organization details for a specified user.
    public async Task<ServiceResponse<AccountUsersTableDto>> UpdateTenantOrganizationAsync(TenantOrganizationDto tenantOrganizationDto)
    {
        // Default failure response
        var serviceResponse = new ServiceResponse<AccountUsersTableDto>
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
            var user = await _userManager.FindByIdAsync(tenantOrganizationDto.UserId.ToString());
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
                        existingTenant.Name, tenantOrganizationDto.UserId);

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
                    // Optional initial properties
                    // Domain = cleanDomain,
                    // NumberOfEmployees = tenantOrganizationDto.EmployeeCount,
                    // Industry = tenantOrganizationDto.Industry,
                    // Country = tenantOrganizationDto.Country.ToString(),
                    CreatedByUserId = tenantOrganizationDto.UserId,
                    LastModifiedByUserId = tenantOrganizationDto.UserId
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
                    userTenant.Name, userTenant.Id, tenantOrganizationDto.UserId);
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

            // Prepare response
            serviceResponse.Data = user.Adapt<AccountUsersTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant organization updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating tenant for user {UserId}.", tenantOrganizationDto.UserId);
        }

        return serviceResponse;
    }

    // Updates a user's basic information such as first name, last name, and password.
    public async Task<ServiceResponse<AccountUser>> UpdateUserInformationAsync(UpdateUserInformationDto updateUserInformationDto)
    {
        // Default failure response
        var serviceResponse = new ServiceResponse<AccountUser>
        {
            Data = null,
            Message = "Failed to update user information. Please try again later."
        };

        try
        {
            // Get the user by ID
            var user = await _userManager.FindByIdAsync(updateUserInformationDto.UserId.ToString());

            if (user == null)
            {
                serviceResponse.Message = "User not found.";
                return serviceResponse;
            }

            // If user's name is already set, assume update was done before
            if (!string.IsNullOrEmpty(user.FirstName) || !string.IsNullOrEmpty(user.LastName))
            {
                serviceResponse.Message = "User already updated.";
                return serviceResponse;
            }

            // Update user details
            user.FirstName = updateUserInformationDto.FirstName;
            user.LastName = updateUserInformationDto.LastName;
            user.PwdSetOn = DateTimeOffset.UtcNow;
            user.LastModifiedByUserId = updateUserInformationDto.UserId;

            _unitOfWork.AccountUserRepo.Update(user);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Could not save updated details for user {UserId}.", user.Id);
                return serviceResponse;
            }

            _logger.LogInformation("User {UserId} details updated successfully.", user.Id);

            // Set password for the user
            var addPasswordResult = await _userManager.AddPasswordAsync(user, updateUserInformationDto.Pwd);

            if (!addPasswordResult.Succeeded)
            {
                foreach (var error in addPasswordResult.Errors)
                {
                    _logger.LogError("Error setting password for user {UserId}. Code: {ErrorCode}, Description: {ErrorDescription}",
                        user.Id, error.Code, error.Description);
                }

                serviceResponse.Message = "Failed to set password. Please try again.";
                return serviceResponse;
            }

            // Reload user with related roles and permissions
            user = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => EF.Functions.ILike(user.Email, w.UserName))
                .Include(i => i.UserRoles)
                    .ThenInclude(i1 => i1.Role)
                        .ThenInclude(i2 => i2.RolePermissions)
                            .ThenInclude(i3 => i3.Permission)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            serviceResponse.Data = user;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User information updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating user information for user {UserId}.", updateUserInformationDto.UserId);
        }

        return serviceResponse;
    }
}