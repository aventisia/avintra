// For more info on How to seed data, watch YT video: https://www.youtube.com/watch?v=0B7QjRSvcGI
namespace AccountsAPIs.Data;

public static class AccountsDbInitialSeed
{
    public async static Task<WebApplication> SeedInitialData(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            // Get environment configs
            var environmentConfig = scope.ServiceProvider.GetRequiredService<EnvironmentConfig>();

            // Get logger
            var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger("AccountsDbInitialSeed");

            // Get accountsDbContext
            using var _accountsDbContext = scope.ServiceProvider.GetRequiredService<AccountsDbContext>();

            // Apply pending database migrations
            await ApplyMigrationsAsync(_accountsDbContext, logger);

            // Get RoleManager and UserManager
            using var _roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AccountRole>>();
            using var _userManager = scope.ServiceProvider.GetRequiredService<UserManager<AccountUser>>();

            // Try to seed data
            try
            {
                // Seed any missing fixed roles.
                // This runs unconditionally (idempotently) so existing databases also pick up
                // newly added roles (e.g. the CRM placeholders), even when the rest of the seed
                // is skipped by IsSeedingRequired.
                if (!await SeedDefaultRolesAsync(_roleManager, environmentConfig, logger)) return app;

                // Keep the default seed idempotent on existing databases: missing plan, subscription
                // or credit rows are created, and the default plan and default tenant subscription are
                // corrected to the running edition's limits.
                if (!await IsSeedingRequired(_accountsDbContext, logger))
                {
                    var existingSuperUser = await _accountsDbContext.Users
                        .Where(w => w.IsDefault)
                        .SingleOrDefaultAsync();

                    if (existingSuperUser != null)
                    {
                        if (!await SeedSubscriptionPlanAsync(_accountsDbContext, environmentConfig, existingSuperUser, logger) ||
                            !await SeedTenantSubscriptionAsync(_accountsDbContext, environmentConfig, existingSuperUser, logger) ||
                            !await SeedTenantCreditsAsync(_accountsDbContext, existingSuperUser, logger))
                        {
                            return app;
                        }
                    }

                    return app;
                }

                // Seed Super User without tenant
                var superUser = await SeedSuperUserAsync(_userManager, environmentConfig, logger);

                // Super user not seeded
                if (superUser == null) return app;

                // Seed Permissions
                if (!await SeedPermissionsAsync(_accountsDbContext, superUser, logger)) return app;

                // Seed default tenant
                var defaultTenant = await SeedDefaultTenantAsync(_accountsDbContext, environmentConfig, superUser.Id, logger);

                // Default tenant not seeded
                if (defaultTenant == null) return app;

                // Update Super user tenant Id
                if (!await UpdateSuperUserTenantId(_accountsDbContext, defaultTenant.Id, superUser.Id, logger)) return app;

                // Seed Credit Plans
                if (!await SeedCreditPlansAsync(_accountsDbContext, environmentConfig, superUser, logger)) return app;

                if (!await SeedSubscriptionPlanAsync(_accountsDbContext, environmentConfig, superUser, logger))
                    return app;

                // Seed the Tenant Subscription (this associates the super user with a subscription plan for their tenant)
                if (!await SeedTenantSubscriptionAsync(_accountsDbContext, environmentConfig, superUser, logger))
                    return app;

                // Seed the Tenant Credits (this associates the super user with a subscription plan for their tenant)
                if (!await SeedTenantCreditsAsync(_accountsDbContext, superUser, logger))
                    return app;

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding initial data.");
            }
            return app;
        }
    }

    // Apply pending database migrations
    private async static Task ApplyMigrationsAsync(AccountsDbContext accountsDbContext, ILogger logger)
    {
        try
        {
            await accountsDbContext.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while applying database migrations.");
            throw;
        }
    }

    // Check if data already exists
    private static async Task<bool> IsSeedingRequired(AccountsDbContext accountsDbContext, ILogger logger)
    {
        try
        {
            if (await accountsDbContext.Tenants.Where(w => string.IsNullOrEmpty(w.ContainerName)).CountAsync() > 0)
            {
                // Fetch tenants with empty ContainerName
                var tenantsToUpdate = await accountsDbContext.Tenants
                    .Where(w => string.IsNullOrEmpty(w.ContainerName))
                    .ToListAsync();

                // Loop through each tenant and update ContainerName
                foreach (var tenant in tenantsToUpdate)
                {
                    // Example: set ContainerName based on TenantId or any logic
                    tenant.ContainerName = TenantContainerUtil.GenerateName(tenant.Name);
                }

                // Save changes to the database
                await accountsDbContext.SaveChangesAsync();
            }

            // Tenant already exists
            if (await accountsDbContext.Tenants.Where(w => w.IsDefault).CountAsync() > 0)
            {
                logger.LogDebug("Tenant data already exists, skipping data seed process.");
                return false;
            }

            // User already exists
            if (await accountsDbContext.Users.Where(w => w.IsDefault).CountAsync() > 0)
            {
                logger.LogDebug("User data already exists, skipping data seed process.");
                return false;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while checking if seeding is required.");
            return false;
        }

        // Seeding is required
        return true;
    }

    // Seed roles. Idempotent: for each fixed role, add it only when it does not exist yet,
    // so existing databases pick up newly added roles without touching the ones already present.
    private async static Task<bool> SeedDefaultRolesAsync(RoleManager<AccountRole> roleManager, EnvironmentConfig environmentConfig, ILogger logger)
    {
        try
        {
            foreach (var role in Enum.GetValues(typeof(CustomRolesEnum)).Cast<CustomRolesEnum>())
            {
                // Community deployments are single-tenant, workspace-only editions.
                // Do not seed SA (platform admin is scoped to commercial deployments) or any
                // CRM role (the CRM app is not part of the community edition) into AspNetRoles.
                if (environmentConfig.IsCommunityDeployment &&
                    (role == CustomRolesEnum.SA || role.ToPlatformApp() == PlatformAppsEnum.CRM))
                {
                    continue;
                }

                // Role already exists. Do not add it again.
                if (await roleManager.RoleExistsAsync(role.ToString())) continue;

                // Get role description
                var userRoleDescription = GetEnumDescriptionUtil.GetEnumDescription(role);

                // Split role description using semicolon (;)
                string[] splitContent = userRoleDescription.Split(';');

                await roleManager.CreateAsync(new AccountRole()
                {
                    Seq = Convert.ToInt32(splitContent[0].Trim()),
                    Name = role.ToString(),
                    FullName = splitContent[1].Trim(),
                    Description = splitContent[2].Trim(),
                    AppCode = role.ToPlatformApp().ToAppCode(),
                    IsDefault = true,
                });
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding default roles.");
            return false;
        }

        // Roles seeded successfully
        return true;
    }

    // Seed super user without tenant
    private async static Task<AccountUser?> SeedSuperUserAsync(UserManager<AccountUser> userManager, EnvironmentConfig environmentConfig, ILogger logger)
    {
        try
        {
            // Set super user Id
            var superUserId = Guid.NewGuid();

            // Initialize super user
            var superUser = new AccountUser()
            {
                Id = superUserId,
                UserName = environmentConfig.OnPremAdminEmail,
                Email = environmentConfig.OnPremAdminEmail,
                EmailConfirmed = true,
                FirstName = "Platform",
                LastName = "Admin",
                PwdSetOn = DateTimeOffset.UtcNow,
                IsDefault = true,
                IsEditable = false,
                TenantId = null,
                CreatedByUserId = superUserId,
                LastModifiedByUserId = superUserId
            };

            // Create a list of default roles to be assigned to the super user.
            // Only workspace roles are granted: the workspace guard keys off the JWT's top role
            // (Seq ordering), and granting CRM placeholder roles would corrupt that detection
            // (they restart Seq at 0, so a CRM role would shadow SA/TA in the JWT).
            var roles = Enum.GetValues(typeof(CustomRolesEnum))
                                .Cast<CustomRolesEnum>()
                                .Where(w => w != CustomRolesEnum.SA && w.ToPlatformApp() == PlatformAppsEnum.Workspace)
                                .Select(r => r.ToString())
                                .ToList();

            // SA is granted only to Commercial deployments. Community and Enterprise are
            // single-tenant self-hosted deployments whose platform admin must NOT hold SA
            // (SA is already excluded from the base workspace role set above).
            // Check if the tenant type is 'Commercial' (case-insensitive comparison)
            if (environmentConfig.OnPremTenantType.Equals(OnPremTenantTypesEnum.Commercial.ToString(), StringComparison.InvariantCultureIgnoreCase))
            {
                // For Commercial tenants, add the 'SA' role - typically for a role "Super Admin"
                roles.Add(nameof(CustomRolesEnum.SA));
            }
            var password = HelperUtil.GenerateRandomPassword();

            // Add supper user & its roles
            var createUserResult = await userManager.CreateAsync(superUser, password);
            var addToRoleResult = await userManager.AddToRolesAsync(superUser, roles);

            // Super user creation failed
            if (!createUserResult.Succeeded || !addToRoleResult.Succeeded)
            {
                foreach (var error in createUserResult.Errors)
                    logger.LogError("Super user creation failed. ErrorCode: {ErrorCode}, Description: {Description}", error.Code, error.Description);

                foreach (var error in addToRoleResult.Errors)
                    logger.LogError("Adding roles for super user failed. ErrorCode: {ErrorCode}, Description: {Description}", error.Code, error.Description);

                return null;
            }

            logger.LogInformation("Super user {Email} created successfully.", superUser.Email);
            Console.WriteLine($"Email: {superUser.Email}");
            Console.WriteLine($"Password: {password}");
            return superUser;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the super user.");
            return null;
        }
    }

    // Seed default tenants
    private async static Task<Tenant?> SeedDefaultTenantAsync(AccountsDbContext accountsDbContext, EnvironmentConfig environmentConfig, Guid superUserId, ILogger logger)
    {
        try
        {
            // Community deployments have no on-prem tenant id to parse, so generate a fresh id for
            // the single default tenant. Paid deployments keep the id supplied by GlobalAdmin.
            Guid tenantGuid;
            if (environmentConfig.IsCommunityDeployment)
            {
                tenantGuid = Guid.NewGuid();
            }
            else
            {
                Guid.TryParse(environmentConfig.OnPremTenantId, out tenantGuid);
            }

            // Community deployments receive no tenant metadata from GlobalAdmin; fall back to a
            // fixed display name so the tenant and its container are still named deterministically.
            var tenantName = environmentConfig.IsCommunityDeployment && string.IsNullOrWhiteSpace(environmentConfig.OnPremTenantName)
                ? OnPremTenantTypesEnum.Community.ToString()
                : environmentConfig.OnPremTenantName;

            // Initialize default tenant
            var newTenant = new Tenant()
            {
                Id = tenantGuid,
                ResourceType = TenantResourceTypesEnum.Dedicated,
                Type = TenantTypesEnum.Organization,
                Currency = CurrencyTypesEnum.INR,
                Name = tenantName,
                Domain = ExtractDomainFromEmailUtil.ExtractDomainFromUrl(environmentConfig.AccountsApiBaseUrl),
                ContainerName = TenantContainerUtil.GenerateName(tenantName),
                Country = CountriesEnum.India,
                ExpiresOn = DateTimeOffset.MaxValue, // TODO: We need to remove or update it
                IsSSOEnabled = false,
                IsPwdEnabled = true,
                IsPwdNeverExpiresEnabled = true,
                IsIdleSessionTimeoutEnabled = true,
                IsTwoFAEnabled = false,
                DaysBeforePwdExpires = 730,
                IdleSessionTimeoutMinutes = 10,
                IsDefault = true,
                IsEditable = true,
                SSOConfigJson = "",
                DbOption = DatabaseOptionsEnum.DedicatedServer,
                CreatedByUserId = superUserId,
                LastModifiedByUserId = superUserId
            };

            // Add tenant
            await accountsDbContext.Tenants.AddAsync(newTenant);

            // Save changes
            await accountsDbContext.SaveChangesAsync();

            // Seed the tenant's default "Central" space immediately so a newly installed
            // database has it without waiting for the next startup (all deployment types).
            await DefaultSpaceHelpers.EnsureDefaultSpaceAsync(
                accountsDbContext, newTenant.Id, newTenant.CreatedByUserId, newTenant.LastModifiedByUserId, logger);

            // Tenants seeded successfully
            return newTenant;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the default tenant.");
            return null;
        }
    }

    // Seed permissions
    private async static Task<bool> SeedPermissionsAsync(AccountsDbContext dbContext, AccountUser superUser, ILogger logger)
    {
        try
        {
            foreach (var permission in Enum.GetValues(typeof(PermissionTypesEnum)))
            {
                // Get permission description
                var userPermissionDescription = GetEnumDescriptionUtil.GetEnumDescription((Enum)permission);

                // Split permission description using semicolon (;)
                string[] splitContent = userPermissionDescription.Split(';');

                await dbContext.Permissions.AddAsync(new Permission()
                {
                    Name = permission.ToString(),
                    FullName = splitContent[1].Trim(),
                    Description = splitContent[2].Trim(),
                    CreatedByUserId = superUser.Id,
                    LastModifiedByUserId = superUser.Id
                });

            }
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding permissions.");
            return false;
        }

        // Roles seeded successfully
        return true;
    }

    private static async Task<bool> UpdateSuperUserTenantId(AccountsDbContext accountsDbContext, Guid defaultTenantId, Guid superUserId, ILogger logger)
    {
        try
        {
            // Get default Tenant for super user
            var defaultTenant = await accountsDbContext.Tenants.Where(w => w.Id == defaultTenantId).SingleOrDefaultAsync();

            // Default Tenant not found
            if (defaultTenant == null)
            {
                logger.LogError("Default tenant not found for super user during tenant id update.");
                return false;
            }

            // Get super user
            var superUser = await accountsDbContext.Users.Include(i => i.Tenant).Include(i => i.UserRoles).Where(w => w.Id == superUserId).SingleOrDefaultAsync();

            // Super user not found
            if (superUser == null)
            {
                logger.LogError("Super user not found while updating tenant id.");
                return false;
            }

            // Map tenant Id
            superUser.TenantId = defaultTenant.Id;

            // Update supper user
            accountsDbContext.Update(superUser);

            // Save changes
            await accountsDbContext.SaveChangesAsync();

            // Super user updated successfully
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while updating the super user's tenant id.");
            return false;
        }
    }

    // Seed CreditPlans based on CreditServicesEnum
    private async static Task<bool> SeedCreditPlansAsync(AccountsDbContext dbContext, EnvironmentConfig environmentConfig, AccountUser superUser, ILogger logger)
    {
        try
        {
            // Credit plans are only billed on Commercial deployments. Community and Enterprise
            // are self-hosted editions with no usage billing, so skip seeding entirely.
            if (!environmentConfig.OnPremTenantType.Equals(OnPremTenantTypesEnum.Commercial.ToString(), StringComparison.InvariantCultureIgnoreCase))
            {
                logger.LogDebug("Non-commercial deployment, skipping credit plan seed.");
                return true;
            }

            // Create a list to hold CreditPlan objects to be inserted in bulk
            var creditPlans = new List<CreditPlan>();

            // Iterate over each value in CreditServicesEnum
            foreach (var creditServiceType in Enum.GetValues(typeof(CreditServicesEnum)))
            {
                var serviceType = (CreditServicesEnum)creditServiceType;

                // Directly create CreditPlan object and add it to the list
                creditPlans.Add(new CreditPlan()
                {
                    ServiceType = serviceType,
                    UnitType = UnitTypesEnum.Transactions, // Assuming a default, can be adjusted
                    OneUnit = 1, // Default value for OneUnit
                    Credits = 1, // Default value for Credits
                    CreatedByUserId = superUser.Id,
                    LastModifiedByUserId = superUser.Id
                });
            }

            // Insert all CreditPlans at once
            await dbContext.CreditPlans.AddRangeAsync(creditPlans);

            // Commit changes to the database
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding credit plans.");
            return false;
        }

        // Credit plans seeded successfully
        return true;
    }

    private static async Task<bool> SeedSubscriptionPlanAsync(AccountsDbContext accountsDbContext, EnvironmentConfig environmentConfig, AccountUser superUser, ILogger logger)
    {
        try
        {
            await ConvertLegacyDefaultPlanAsync(accountsDbContext, environmentConfig, superUser, logger);

            var seedPlans = EditionSubscriptionPlanHelpers.GetSeedPlans(environmentConfig, superUser.Id);
            var seedPlanUniqueNames = seedPlans.Select(p => p.UniqueName).ToList();

            var existingPlans = await accountsDbContext.SubscriptionPlans
                .Where(w => seedPlanUniqueNames.Contains(w.UniqueName))
                .ToListAsync();

            foreach (var seedPlan in seedPlans)
            {
                var matchingPlans = existingPlans.Where(p => p.UniqueName == seedPlan.UniqueName).ToList();

                if (matchingPlans.Count == 0)
                {
                    await accountsDbContext.SubscriptionPlans.AddAsync(seedPlan);
                }
                else if (!matchingPlans.Any(p => p.IsDefault))
                {
                    PromoteToDefaultPlan(matchingPlans, superUser);
                }
            }

            await accountsDbContext.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the subscription plan.");
            return false;
        }
    }

    private static void PromoteToDefaultPlan(List<SubscriptionPlan> matchingPlans, AccountUser superUser)
    {
        var plan = matchingPlans
            .OrderBy(p => p.IsDisabled)
            .ThenBy(p => p.Status != PlanStatusTypesEnum.Current)
            .ThenBy(p => p.CreatedOn)
            .First();

        plan.IsDefault = true;
        plan.IsDisabled = false;
        plan.LastModifiedByUserId = superUser.Id;
    }

    // IMPORTANT NOTE: before #467 every edition seeded one shared "Default" plan that existing tenant
    // subscriptions still reference, so it is converted in place into the edition's host plan.
    private static async Task ConvertLegacyDefaultPlanAsync(AccountsDbContext accountsDbContext, EnvironmentConfig environmentConfig, AccountUser superUser, ILogger logger)
    {
        var hostPlan = EditionSubscriptionPlanHelpers.GetHostPlan(environmentConfig, superUser.Id);

        var legacyPlan = await accountsDbContext.SubscriptionPlans
            .Where(w => w.Name == "Default" && w.IsDefault && w.UniqueName != hostPlan.UniqueName)
            .SingleOrDefaultAsync();

        if (legacyPlan == null) return;

        legacyPlan.Name = hostPlan.Name;
        legacyPlan.Type = hostPlan.Type;
        legacyPlan.Currency = hostPlan.Currency;
        legacyPlan.Frequency = hostPlan.Frequency;
        legacyPlan.UniqueName = hostPlan.UniqueName;

        // IMPORTANT NOTE: a Community boot must never rewrite stored limits.
        if (!environmentConfig.IsCommunityDeployment)
        {
            legacyPlan.MaxCredits = hostPlan.MaxCredits;
            legacyPlan.MaxPublishedItems = hostPlan.MaxPublishedItems;
            legacyPlan.MaxSpaces = hostPlan.MaxSpaces;
            legacyPlan.MaxUsers = hostPlan.MaxUsers;
            legacyPlan.StorageLimitMB = hostPlan.StorageLimitMB;
            legacyPlan.HistoryRetentionDays = hostPlan.HistoryRetentionDays;
        }

        legacyPlan.LastModifiedByUserId = superUser.Id;
        await accountsDbContext.SaveChangesAsync();
        logger.LogWarning("Converted the legacy Default subscription plan for the {TenantType} edition.", environmentConfig.OnPremTenantType);
    }

    private static async Task<bool> SeedTenantSubscriptionAsync(AccountsDbContext accountsDbContext, EnvironmentConfig environmentConfig, AccountUser superUser, ILogger logger)
    {
        try
        {
            // Get the default tenant associated with the super user
            var defaultTenant = await accountsDbContext.Tenants
                .Where(w => w.Id == superUser.TenantId)
                .SingleOrDefaultAsync();

            if (defaultTenant == null)
            {
                logger.LogError("Default tenant not found for super user while seeding tenant subscription.");
                return false;
            }

            var subscriptionPlanUniqueName = EditionSubscriptionPlanHelpers.GetHostPlan(environmentConfig, superUser.Id).UniqueName;

            var subscriptionPlan = await accountsDbContext.SubscriptionPlans
                .Where(w => w.UniqueName == subscriptionPlanUniqueName && w.IsDefault)
                .SingleOrDefaultAsync();

            if (subscriptionPlan == null)
            {
                logger.LogError("Subscription plan {PlanUniqueName} not found.", subscriptionPlanUniqueName);
                return false;
            }

            // Check if a subscription plan already exists for the super user's tenant
            var existingSubscription = await accountsDbContext.TenantSubscriptions
                .Where(w => w.TenantId == defaultTenant.Id && w.IsActive)
                .SingleOrDefaultAsync();

            // IMPORTANT NOTE: a Community boot must never rewrite stored limits; only a paid
            // deployment corrects drift between paid editions here.
            if (existingSubscription != null)
            {
                if (!environmentConfig.IsCommunityDeployment &&
                    existingSubscription.PlanId == subscriptionPlan.Id &&
                    (existingSubscription.MaxPublishedItems != subscriptionPlan.MaxPublishedItems ||
                     existingSubscription.MaxSpaces != subscriptionPlan.MaxSpaces ||
                     existingSubscription.MaxUsers != subscriptionPlan.MaxUsers ||
                     existingSubscription.StorageLimitMB != subscriptionPlan.StorageLimitMB ||
                     existingSubscription.HistoryRetentionDays != subscriptionPlan.HistoryRetentionDays))
                {
                    existingSubscription.MaxPublishedItems = subscriptionPlan.MaxPublishedItems;
                    existingSubscription.MaxSpaces = subscriptionPlan.MaxSpaces;
                    existingSubscription.MaxUsers = subscriptionPlan.MaxUsers;
                    existingSubscription.StorageLimitMB = subscriptionPlan.StorageLimitMB;
                    existingSubscription.HistoryRetentionDays = subscriptionPlan.HistoryRetentionDays;
                    existingSubscription.LastModifiedByUserId = superUser.Id;
                    await accountsDbContext.SaveChangesAsync();
                    logger.LogWarning("Corrected the default tenant subscription {SubscriptionId} to the {PlanUniqueName} plan limits.",
                        existingSubscription.Id, subscriptionPlanUniqueName);
                }

                return true;
            }

            // Create the new TenantSubscription with necessary details
            var tenantSubscription = new TenantSubscription
            {
                TenantId = defaultTenant.Id,
                PlanId = subscriptionPlan.Id,
                Frequency = subscriptionPlan.Frequency,
                IsActive = true,
                Status = SubscriptionStatusTypesEnum.Active,
                NextBillingDate = new DateTimeOffset(DateTimeOffset.MaxValue.Date, TimeSpan.Zero),
                MaxCredits = subscriptionPlan.MaxCredits,
                MaxPublishedItems = subscriptionPlan.MaxPublishedItems,
                MaxSpaces = subscriptionPlan.MaxSpaces,
                MaxUsers = subscriptionPlan.MaxUsers,
                StorageLimitMB = subscriptionPlan.StorageLimitMB,
                HistoryRetentionDays = subscriptionPlan.HistoryRetentionDays,
                CreatedByUserId = superUser.Id,
                LastModifiedByUserId = superUser.Id
            };

            // Add the new tenant subscription to the database context
            await accountsDbContext.TenantSubscriptions.AddAsync(tenantSubscription);

            // Save the changes to the database
            await accountsDbContext.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the tenant subscription.");
            return false;
        }
    }

    private static async Task<bool> SeedTenantCreditsAsync(AccountsDbContext accountsDbContext, AccountUser superUser, ILogger logger)
    {
        try
        {
            // Fetch the default tenant associated with the super user
            var defaultTenant = await accountsDbContext.Tenants
                .Where(w => w.Id == superUser.TenantId)
                .SingleOrDefaultAsync();

            if (defaultTenant == null)
            {
                logger.LogError("Default tenant not found for super user while seeding tenant credits.");
                return false;
            }

            // Check if the tenant already has an active subscription
            var tenantSubscription = await accountsDbContext.TenantSubscriptions
                .Where(w => w.TenantId == defaultTenant.Id && w.IsActive)
                .SingleOrDefaultAsync();

            if (tenantSubscription == null)
            {
                logger.LogError("No active subscription found for the super user's tenant while seeding credits.");
                return false;
            }

            // Check if the tenant already has credits
            var existingCredits = await accountsDbContext.TenantCredits
                .Where(w => w.TenantId == superUser.TenantId)
                .SingleOrDefaultAsync();

            // If tenant credits already exist, skip seeding and return true
            if (existingCredits != null)
            {
                logger.LogDebug("Tenant credits already exist for the super user's tenant.");
                return true;
            }

            // Create a new TenantCredits entry
            var tenantCredits = new TenantCredit
            {
                TenantId = defaultTenant.Id,
                SubscriptionId = tenantSubscription.Id,
                AvailableCredits = tenantSubscription.MaxCredits,
                ExpiredOn = new DateTimeOffset(DateTimeOffset.MaxValue.Date, TimeSpan.Zero),
                Type = CreditTypesEnum.Subscription,
                CreatedByUserId = superUser.Id,
                LastModifiedByUserId = superUser.Id
            };

            // Add the new tenant credits record to the database
            await accountsDbContext.TenantCredits.AddAsync(tenantCredits);

            // Save the changes to the database
            await accountsDbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding tenant credits.");
            return false;
        }
    }
}