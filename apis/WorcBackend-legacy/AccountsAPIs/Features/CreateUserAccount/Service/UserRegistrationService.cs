namespace AccountsAPIs.Services;

public class UserRegistrationService : IUserRegistrationService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly ILogger<UserRegistrationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly AccountsDbContext _accountsDbContext;
    private readonly Guid _userId;
    private readonly Guid _tenantId;
    private readonly string _username;

    public UserRegistrationService(
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        ILogger<UserRegistrationService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        EnvironmentConfig environmentConfig,
        AccountsDbContext accountsDbContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _emailService = emailService;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authHelperService = authHelperService;
        _environmentConfig = environmentConfig;
        _accountsDbContext = accountsDbContext;

        // Extract user ID from the claims
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? string.Empty;
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
            // Check if the tenant is of type Enterprise
            if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString())
            {
                var appDomain = ExtractDomainFromEmailUtil.ExtractDomainFromUrl(_environmentConfig.AppBaseUrl);
                var emailDomain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(createAccountDto.Email);

                if (SsoConfigHelpers.IsConsumerEmailDomain(emailDomain))
                {
                    serviceResponse.StatusCode = 400;
                    serviceResponse.Message = "Public email domains cannot be used to join an organization tenant. Use your organization email address.";
                    return serviceResponse;
                }

                if (!appDomain.Equals(emailDomain, StringComparison.InvariantCultureIgnoreCase))
                {
                    serviceResponse.StatusCode = 400;
                    serviceResponse.Message = "Email domain does not match the platform's domain.";
                    return serviceResponse;
                }
            }

            // Check if authentication-related operations are globally disabled.
            // This can be due to maintenance, security incidents, or temporary administrative restrictions.
            if (_environmentConfig.OnPremLoginDisabled)
            {
                serviceResponse.StatusCode = 403;
                serviceResponse.Message = "Authentication is currently disabled. Please contact Aventisia Support for assistance.";
                return serviceResponse;
            }

            // Get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => EF.Functions.ILike(createAccountDto.Email, w.UserName))
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

            // User already exists
            if (user != null)
            {
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
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }

            // Create a new user object using the provided account details
            var newPwdSetOn = DateTimeOffset.UtcNow;
            var newUserId = Guid.NewGuid();
            var newUser = new AccountUser()
            {
                Id = newUserId,
                UserName = createAccountDto.Email.ToLower(),
                EmailConfirmed = true,
                Email = createAccountDto.Email.ToLower(),
                FirstName = string.Empty,
                LastName = string.Empty,
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

                // Return common error for both
                serviceResponse.Message = "Failed to create your account. Please try again later";
                return serviceResponse;
            }

            var tenantId = Guid.Empty;
            var userRoles = new List<string>();

            if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString())
            {
                userRoles = new List<string> { CustomRolesEnum.TD.ToString(), CustomRolesEnum.TU.ToString() };
                tenantId = Guid.Parse(_environmentConfig.OnPremTenantId);
            }
            else
            {
                // Create a new tenant entity for the newly created user
                var userTenant = new Tenant()
                {
                    Id = Guid.NewGuid(),
                    Name = newUser.Email,
                    ContainerName = TenantContainerUtil.GenerateName(newUser.Email),
                    Domain = string.Empty,
                    Type = TenantTypesEnum.Unspecified,
                    ResourceType = TenantResourceTypesEnum.Shared,
                    Currency = CurrencyTypesEnum.USD,
                    ExpiresOn = DateTimeOffset.MaxValue, // TODO: We need to remove or update it,
                    Role = string.Empty,
                    CreatedByUserId = newUser.Id,
                    LastModifiedByUserId = newUser.Id
                };

                // Insert the new tenant into the repository
                await _unitOfWork.TenantRepo.InsertAsync(userTenant);

                // Save changes and check if the tenant creation was successful
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save new tenant '{TenantName}' (ID: {TenantId}).", userTenant.Name, userTenant.Id);
                    return serviceResponse;
                }

                await DefaultSpaceHelpers.EnsureDefaultSpaceAsync(
                    _accountsDbContext, userTenant.Id, userTenant.CreatedByUserId, userTenant.LastModifiedByUserId, _logger);

                await CreateDefaultTenantSubscriptionAsync(userTenant.Id, newUser.Id);

                tenantId = userTenant.Id;
                userRoles = new List<string> { CustomRolesEnum.TA.ToString(), CustomRolesEnum.OM.ToString(), CustomRolesEnum.TD.ToString(), CustomRolesEnum.TU.ToString() };
            }

            // Link the new tenant to the user
            newUser.TenantId = tenantId;

            // Update the user with the new tenant details
            _unitOfWork.AccountUserRepo.Update(newUser);

            // Save changes to link the user and tenant in the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to update user with tenant details. User ID: {UserId}, Tenant ID: {TenantId}.", newUser.Id, tenantId);
                return serviceResponse;
            }

            // Assign roles to user
            var addToRolesResult = await _userManager.AddToRolesAsync(newUser, userRoles);

            // Log errors if role assignment fails
            if (!addToRolesResult.Succeeded)
            {
                foreach (var error in addToRolesResult.Errors)
                {
                    _logger.LogError("Role assignment failed for user ID {UserId}. Error Code: {Code}, Description: {Description}",
                        user.Id, error.Code, error.Description);
                }

                serviceResponse.Message = "Failed to assign roles to user. Please try again later.";
                return serviceResponse;
            }

            // Saving pwd (if available) in ObsoletePwd failed
            if (!await _authHelperService.SavePwdInObsoletePwdList(newUser, createAccountDto.Pwd, newPwdSetOn))
            {
                return serviceResponse;
            }

            // Create placeholder values for email template
            var placeholderValues = new Dictionary<string, string>() { { "{{userFirstName}}", GetGreetingNameUtil.GetGreetingName(newUser.FirstName, newUser.Email) } };

            // Failed to send AccountCreated email
            if (!await _emailService.SendEmailUsingTemplate(emailType: EmailTypesEnum.AccountCreated, toEmailAddress: createAccountDto.Email, placeholderValues: placeholderValues,
                bccEmailAddresses: _environmentConfig.SalesEmails))
            {
                /*Still moving forward as account is already saved in the database*/
            }


            // Fetch the newly created user with their tenant details
            var newlyAddedUser = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => EF.Functions.ILike(createAccountDto.Email, w.UserName))
                .AsSplitQuery()
                .Include(i => i.Tenant)
                .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Set the response data and success message
            serviceResponse.Data = newlyAddedUser;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "New user has been created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user account.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates the tenant organization details for a specified user.
    public async Task<ServiceResponse<AccountUser>> UpdateTenantOrganizationAsync(TenantOrganizationDto tenantOrganizationDto)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<AccountUser>
        {
            Data = null,
            Message = "Failed to update tenant organization. Please try again later."
        };

        try
        {
            // Validate required fields: Domain and OrganizationName must not be empty or whitespace if the tenant is an organization
            if (tenantOrganizationDto.Type == TenantTypesEnum.Organization &&
                (string.IsNullOrWhiteSpace(tenantOrganizationDto.Domain) ||
                 string.IsNullOrWhiteSpace(tenantOrganizationDto.OrganizationName)))
            {
                serviceResponse.Message = "Organization name and domain are required for organizations.";
                return serviceResponse;
            }

            // Check if the tenant type is NOT 'Individual'
            if (tenantOrganizationDto.Type != TenantTypesEnum.Individual)
            {

                // Retrieve any existing tenant with the same organization name (case-insensitive)
                var existingTenant = await _unitOfWork.TenantRepo
                    .GetByConditionAsync(w => w.Name.ToLower() == tenantOrganizationDto.OrganizationName.ToLower())
                    .FirstOrDefaultAsync();

                if (existingTenant != null)
                {
                    _logger.LogWarning("Organization name '{OrganizationName}' already exists for TenantId: {TenantId}",
                        tenantOrganizationDto.OrganizationName, existingTenant.Id);

                    serviceResponse.Message = $"Organization name '{tenantOrganizationDto.OrganizationName}' already exists.";
                    return serviceResponse;
                }
            }

            // Define regex pattern to validate domain format (e.g., example.com, www.example.org)
            var domainPattern = @"^(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$";

            // Normalize domain input to lowercase and trim whitespace
            var domain = tenantOrganizationDto.Domain.Trim().ToLower();

            // Check if the domain matches the required pattern
            if (!Regex.IsMatch(domain, domainPattern))
            {
                serviceResponse.Message = "Invalid domain format. Example: 'example.com' or 'www.example.org'.";
                return serviceResponse;
            }

            // Clean domain by removing 'www.' prefix if present
            var cleanDomain = domain.StartsWith("www.") ? domain.Substring(4) : domain;

            if (tenantOrganizationDto.Type == TenantTypesEnum.Organization && SsoConfigHelpers.IsConsumerEmailDomain(cleanDomain))
            {
                serviceResponse.Message = "Public email domains cannot be used for an organization. Choose Individual or use your organization email address.";
                return serviceResponse;
            }

            // Retrieve the tenant for this user (assuming tenantId is already associated with the user)
            var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstOrDefaultAsync();
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant not found for this user.";
                return serviceResponse;
            }

            // Check if the tenant type is individual or organization
            bool isIndividualUser = tenantOrganizationDto.Type == TenantTypesEnum.Individual;

            // Update tenant details
            tenant.Name = isIndividualUser ? _username : tenantOrganizationDto.OrganizationName;
            tenant.Domain = isIndividualUser ? _username : cleanDomain;
            tenant.Type = tenantOrganizationDto.Type;
            tenant.Role = tenantOrganizationDto.Role;
            tenant.NumberOfEmployees = tenantOrganizationDto.NumberOfEmployees;
            tenant.Industry = tenantOrganizationDto.Industry;
            tenant.Currency = tenantOrganizationDto.Country == CountriesEnum.India ? CurrencyTypesEnum.INR : CurrencyTypesEnum.USD;
            tenant.Country = tenantOrganizationDto.Country;
            tenant.LastModifiedByUserId = _userId;

            // Update the tenant in the repository
            _unitOfWork.TenantRepo.Update(tenant);

            // Save changes and verify tenant update success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to update tenant details for tenant ID {TenantId}.", tenant.Id);
                return serviceResponse;
            }


            // Retrieve the updated user with tenant details for the response
            var updatedUser = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => w.Id == _userId)
                .AsSplitQuery()
                .Include(i => i.Tenant)
                .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Prepare success response with updated user data
            serviceResponse.Data = updatedUser;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant organization details updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while updating tenant organization details for user ID {UserId}.", _userId);
        }

        return serviceResponse;
    }

    private async Task CreateDefaultTenantSubscriptionAsync(Guid tenantId, Guid userId)
    {
        var signupPlanUniqueName = EditionSubscriptionPlanHelpers.GetSignupPlan(_environmentConfig, userId).UniqueName;

        var subscriptionPlan = await _unitOfWork.SubscriptionPlanRepo
            .GetByConditionAsync(w => w.UniqueName == signupPlanUniqueName && w.IsDefault)
            .SingleOrDefaultAsync();

        if (subscriptionPlan == null)
        {
            _logger.LogError("Signup subscription plan not found while creating the subscription for TenantId: {TenantId}.", tenantId);
            return;
        }

        var isStarterPlan = subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter;

        var tenantSubscription = new TenantSubscription
        {
            TenantId = tenantId,
            PlanId = subscriptionPlan.Id,
            Frequency = subscriptionPlan.Frequency,
            IsActive = true,
            Status = SubscriptionStatusTypesEnum.Active,
            NextBillingDate = isStarterPlan
                ? DateTimeOffset.UtcNow.Date.AddMonths(1)
                : new DateTimeOffset(DateTimeOffset.MaxValue.Date, TimeSpan.Zero),
            MaxCredits = subscriptionPlan.MaxCredits,
            MaxPublishedItems = subscriptionPlan.MaxPublishedItems,
            MaxSpaces = subscriptionPlan.MaxSpaces,
            MaxUsers = subscriptionPlan.MaxUsers,
            StorageLimitMB = subscriptionPlan.StorageLimitMB,
            HistoryRetentionDays = subscriptionPlan.HistoryRetentionDays,
            CreatedByUserId = userId,
            LastModifiedByUserId = userId
        };

        await _unitOfWork.TenantSubscriptionRepo.InsertAsync(tenantSubscription);

        // IMPORTANT NOTE: TenantCreditAllocationJob only refills Starter credits once NextBillingDate is due, so the first month is granted here.
        if (isStarterPlan)
        {
            await _unitOfWork.TenantCreditRepo.InsertAsync(new TenantCredit
            {
                TenantId = tenantId,
                TenantSubscription = tenantSubscription,
                AvailableCredits = tenantSubscription.MaxCredits,
                CreditedOn = DateTimeOffset.UtcNow,
                ExpiredOn = tenantSubscription.NextBillingDate,
                Type = CreditTypesEnum.Subscription,
                CreatedByUserId = userId,
                LastModifiedByUserId = userId
            });
        }

        if (!await _unitOfWork.SaveAsync())
        {
            _logger.LogWarning("Failed to save the default tenant subscription for TenantId: {TenantId}.", tenantId);
        }
    }
}
