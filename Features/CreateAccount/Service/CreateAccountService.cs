namespace AccountsAPIs.Services;

public class CreateAccountService : ICreateAccountService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly ILogger<CreateAccountService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;
    private readonly GeneralConfig _generalConfig;

    public CreateAccountService(
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        ILogger<CreateAccountService> logger,
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

            // Decide user role basis "@aventisia.com"
            var userRole = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(createAccountDto.Email) == "aventisia.com"
                                ? CustomRolesEnum.AE.ToString()
                                : CustomRolesEnum.IU.ToString();

            // Decide tenant name basis "@aventisia.com"
            var tenantName = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(createAccountDto.Email) == "aventisia.com"
                                ? GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.Aventisia)
                                : GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers);

            // Get default Tenant 
            var defaultTenant = await _unitOfWork.TenantRepo
                                        .GetByConditionAsync(w => w.IsDefault == true && w.Name == tenantName)
                                        .SingleOrDefaultAsync();

            // Default Tenant not found
            if (defaultTenant == null)
            {
                _logger.LogInformation($"Default Tenant not found. Tried to create account for email {createAccountDto.Email}");
                serviceResponse.Message = "Failed to create your account. Please try again later";
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
                TenantId = defaultTenant.Id
            };

            // Create new user in AccountsDb
            var createUserResult = await _userManager.CreateAsync(newUser, createAccountDto.Pwd);
            var addToRoleResult = await _userManager.AddToRoleAsync(newUser, userRole);

            // New user creation failed
            if (!createUserResult.Succeeded || !addToRoleResult.Succeeded)
            {
                // Log create user errors
                foreach (var error in createUserResult.Errors)
                    _logger.LogError($"New user creation failed. ErrorCode: {error.Code}, Description: {error.Description}");

                // Log add-to-role errors
                foreach (var error in addToRoleResult.Errors)
                    _logger.LogError($"Adding roles for new user failed. ErrorCode: {error.Code}, Description: {error.Description}");

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
                .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                .AsNoTracking()
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
}