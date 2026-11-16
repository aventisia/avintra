namespace AccountsAPIs.Helpers;

/// <summary>
/// Tenant, subscription, role and welcome-email provisioning shared by the email and social sign-up paths.
/// </summary>
public static class AccountProvisioningHelpers
{
    /// <summary>
    /// Creates the account's tenant (or joins the Enterprise tenant), its default space, the sign-up
    /// subscription and the account roles, then records the tenant on the user.
    /// </summary>
    public static async Task<bool> ProvisionNewAccountAsync(
        UserManager<AccountUser> userManager,
        IUnitOfWork unitOfWork,
        EnvironmentConfig environmentConfig,
        AccountsDbContext accountsDbContext,
        ILogger logger,
        AccountUser user)
    {
        Guid tenantId;
        List<string> userRoles;

        if (environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString())
        {
            userRoles = new List<string> { CustomRolesEnum.TD.ToString(), CustomRolesEnum.TU.ToString() };
            tenantId = Guid.Parse(environmentConfig.OnPremTenantId);
        }
        else
        {
            var userTenant = new Tenant()
            {
                Id = Guid.NewGuid(),
                Name = user.Email,
                ContainerName = TenantContainerUtil.GenerateName(user.Email),
                Domain = string.Empty,
                Type = TenantTypesEnum.Organization,
                ResourceType = TenantResourceTypesEnum.Shared,
                Currency = CurrencyTypesEnum.USD,
                ExpiresOn = DateTimeOffset.MaxValue,
                Role = string.Empty,
                CreatedByUserId = user.Id,
                LastModifiedByUserId = user.Id
            };

            await unitOfWork.TenantRepo.InsertAsync(userTenant);

            if (!await unitOfWork.SaveAsync())
            {
                logger.LogWarning("Failed to save new tenant '{TenantName}' (ID: {TenantId}).", userTenant.Name, userTenant.Id);
                return false;
            }

            await DefaultSpaceHelpers.EnsureDefaultSpaceAsync(
                accountsDbContext, userTenant.Id, userTenant.CreatedByUserId, userTenant.LastModifiedByUserId, logger);

            await CreateDefaultTenantSubscriptionAsync(unitOfWork, environmentConfig, logger, userTenant.Id, user.Id);

            tenantId = userTenant.Id;
            userRoles = new List<string>
            {
                CustomRolesEnum.TA.ToString(),
                CustomRolesEnum.OM.ToString(),
                CustomRolesEnum.TD.ToString(),
                CustomRolesEnum.TU.ToString()
            };
        }

        user.TenantId = tenantId;
        unitOfWork.AccountUserRepo.Update(user);

        if (!await unitOfWork.SaveAsync())
        {
            logger.LogWarning("Failed to update user with tenant details. User ID: {UserId}, Tenant ID: {TenantId}.", user.Id, tenantId);
            return false;
        }

        var addToRolesResult = await userManager.AddToRolesAsync(user, userRoles);

        if (!addToRolesResult.Succeeded)
        {
            foreach (var error in addToRolesResult.Errors)
            {
                logger.LogError("Role assignment failed for user ID {UserId}. Error Code: {Code}, Description: {Description}",
                    user.Id, error.Code, error.Description);
            }

            return false;
        }

        return true;
    }

    /// <summary>
    /// Sends the welcome email of a newly created account. Failures are logged and never block sign-up.
    /// </summary>
    public static async Task SendAccountCreatedEmailAsync(
        IEmailService emailService,
        EnvironmentConfig environmentConfig,
        ILogger logger,
        AccountUser user)
    {
        var placeholderValues = new Dictionary<string, string>()
        {
            { "{{userFirstName}}", GetGreetingNameUtil.GetGreetingName(user.FirstName, user.Email) }
        };

        if (!await emailService.SendEmailUsingTemplate(
            emailType: EmailTypesEnum.AccountCreated,
            toEmailAddress: user.Email,
            placeholderValues: placeholderValues,
            bccEmailAddresses: environmentConfig.SalesEmails))
        {
            logger.LogError("Failed to send the account creation email. UserId={UserId}", user.Id);
        }
    }

    private static async Task CreateDefaultTenantSubscriptionAsync(
        IUnitOfWork unitOfWork,
        EnvironmentConfig environmentConfig,
        ILogger logger,
        Guid tenantId,
        Guid userId)
    {
        var signupPlanUniqueName = EditionSubscriptionPlanHelpers.GetSignupPlan(environmentConfig, userId).UniqueName;

        var subscriptionPlan = await unitOfWork.SubscriptionPlanRepo
            .GetByConditionAsync(w => w.UniqueName == signupPlanUniqueName && w.IsDefault)
            .SingleOrDefaultAsync();

        if (subscriptionPlan == null)
        {
            logger.LogError("Signup subscription plan not found while creating the subscription for TenantId: {TenantId}.", tenantId);
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
                ? DateTime.UtcNow.Date.AddMonths(1)
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

        await unitOfWork.TenantSubscriptionRepo.InsertAsync(tenantSubscription);

        // IMPORTANT NOTE: TenantCreditAllocationJob only refills Starter credits once NextBillingDate is due, so the first month is granted here.
        if (isStarterPlan)
        {
            await unitOfWork.TenantCreditRepo.InsertAsync(new TenantCredit
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

        if (!await unitOfWork.SaveAsync())
        {
            logger.LogWarning("Failed to save the default tenant subscription for TenantId: {TenantId}.", tenantId);
        }
    }
}
