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
                // Ensure every tenant has a default "Central" space.
                // This runs unconditionally (idempotently) so existing tenants also get it,
                // even when the rest of the seed is skipped by IsSeedingRequired.
                await SeedDefaultSpacesForAllTenantsAsync(_accountsDbContext, logger);

                // Seeding is not required
                if (!await IsSeedingRequired(_accountsDbContext, logger)) return app;

                // Seed Roles
                if (!await SeedDefaultRolesAsync(_roleManager, logger)) return app;

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

                // Seed Permissions
                if (!await SeedCreditPlansAsync(_accountsDbContext, superUser, logger)) return app;

                // Seed the default Subscription Plan (create or ensure the default subscription plan exists)
                if (!await SeedSubscriptionPlanAsync(_accountsDbContext, environmentConfig, superUser, logger))
                    return app;

                // Seed the Tenant Subscription (this associates the super user with a subscription plan for their tenant)
                if (!await SeedTenantSubscriptionAsync(_accountsDbContext, superUser, logger))
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

            // Role already exists
            if (await accountsDbContext.Roles.CountAsync() > 0)
            {
                logger.LogDebug("Role data already exists, skipping data seed process.");
                return false;
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

    // Seed roles
    private async static Task<bool> SeedDefaultRolesAsync(RoleManager<AccountRole> roleManager, ILogger logger)
    {
        try
        {
            foreach (var role in Enum.GetValues(typeof(CustomRolesEnum)))
            {
                // Get role description
                var userRoleDescription = GetEnumDescriptionUtil.GetEnumDescription((Enum)role);

                // Split role description using semicolon (;)
                string[] splitContent = userRoleDescription.Split(';');

                await roleManager.CreateAsync(new AccountRole()
                {
                    Seq = Convert.ToInt32(splitContent[0].Trim()),
                    Name = role.ToString(),
                    FullName = splitContent[1].Trim(),
                    Description = splitContent[2].Trim(),
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
            var roles = Enum.GetValues(typeof(CustomRolesEnum))
                                .Cast<CustomRolesEnum>()
                                .Where(w => w != CustomRolesEnum.SA)
                                .Select(r => r.ToString())
                                .ToList();

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
            Console.WriteLine("Email: {superUser.Email}", superUser.Email);
            Console.WriteLine("Password: {password}", password);
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
            // Attempt to parse the TenantId as a Guid
            Guid tenantGuid;
            bool isValidTenantId = Guid.TryParse(environmentConfig.OnPremTenantId, out tenantGuid);

            // Initialize default tenant
            var newTenant = new Tenant()
            {
                Id = tenantGuid,
                ResourceType = TenantResourceTypesEnum.Dedicated,
                Type = TenantTypesEnum.Organization,
                Currency = CurrencyTypesEnum.USD,
                Name = environmentConfig.OnPremTenantName,
                Domain = ExtractDomainFromEmailUtil.ExtractDomainFromUrl(environmentConfig.AccountsApiBaseUrl),
                ContainerName = TenantContainerUtil.GenerateName(environmentConfig.OnPremTenantName),
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

            // Tenants seeded successfully
            return newTenant;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the default tenant.");
            return null;
        }
    }

    // Ensure every tenant has a default "Central" space.
    // Runs unconditionally (idempotently) so existing tenants also get it,
    // even when the rest of the seed is skipped by IsSeedingRequired.
    //
    // NOTE: Uses raw SQL insert to bypass the DbContext SaveChanges override,
    // which would otherwise overwrite TenantId with Guid.Empty during startup
    // (no request context is available at seed time).
    private async static Task SeedDefaultSpacesForAllTenantsAsync(AccountsDbContext accountsDbContext, ILogger logger)
    {
        try
        {
            // Fetch all tenants
            var tenants = await accountsDbContext.Tenants.ToListAsync();

            foreach (var tenant in tenants)
            {
                // Check if a default space already exists for the tenant
                var existingDefaultSpace = await accountsDbContext.Spaces
                    .Where(w => w.TenantId == tenant.Id && w.IsDefault)
                    .SingleOrDefaultAsync();

                // Default space already exists for this tenant
                if (existingDefaultSpace != null) continue;

                // Insert the default "Central" space directly via raw SQL
                var centralSpaceId = Guid.NewGuid();
                var now = DateTimeOffset.UtcNow;
                var centralName = "Central";
                var centralDescription = "The default space for shared resources, workflows, agents, and content accessible across the organization.";
                await accountsDbContext.Database.ExecuteSqlInterpolatedAsync(
                    $@"INSERT INTO ""Spaces"" (""Id"", ""TenantId"", ""Name"", ""Description"", ""IsDefault"", ""CreatedByUserId"", ""CreatedOn"", ""LastModifiedByUserId"", ""LastModifiedOn"", ""IsDisabled"")
                      VALUES ({centralSpaceId}, {tenant.Id}, {centralName}, {centralDescription}, {true}, {tenant.CreatedByUserId}, {now}, {tenant.LastModifiedByUserId}, {now}, {false})");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the default spaces.");
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
    private async static Task<bool> SeedCreditPlansAsync(AccountsDbContext dbContext, AccountUser superUser, ILogger logger)
    {
        try
        {
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
            // Define the name of the subscription plan to seed
            var subscriptionPlanName = "Default";

            // Check if the default subscription plan already exists in the database
            var existingPlan = await accountsDbContext.SubscriptionPlans
                .Where(w => w.Name == subscriptionPlanName && w.IsDefault)
                .SingleOrDefaultAsync();

            // If the subscription plan already exists, skip seeding and return true
            if (existingPlan != null)
            {
                logger.LogDebug("Subscription plan {PlanName} already exists.", subscriptionPlanName);
                return true;
            }

            // Prepare plan type based on tenant type
            SubscriptionPlanTypeEnum planType = environmentConfig.OnPremTenantType.Equals(OnPremTenantTypesEnum.Commercial.ToString(), StringComparison.InvariantCultureIgnoreCase) ?
                SubscriptionPlanTypeEnum.Pro :
                SubscriptionPlanTypeEnum.None;

            // If the plan doesn't exist, create the default subscription plan
            var newSubscriptionPlan = new SubscriptionPlan
            {
                Name = subscriptionPlanName,
                Type = planType,
                Currency = CurrencyTypesEnum.USD,
                Frequency = SubscriptionFrequenciesEnum.Yearly,
                Status = PlanStatusTypesEnum.Custom,
                UniqueName = $"{planType}-{SubscriptionFrequenciesEnum.Yearly}-{CurrencyTypesEnum.INR}".ToLower(),
                MaxPublishedItems = int.MaxValue,
                MaxSpaces = int.MaxValue,
                MaxUsers = int.MaxValue,
                StorageLimitMB = int.MaxValue,
                HistoryRetentionDays = int.MaxValue,
                Price = 0,
                IsDefault = true,
                CreatedByUserId = superUser.Id,
                LastModifiedByUserId = superUser.Id,
            };

            // Add the newly created subscription plan to the database context
            await accountsDbContext.SubscriptionPlans.AddAsync(newSubscriptionPlan);

            // Save the changes to the database
            await accountsDbContext.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the subscription plan.");
            return false;
        }
    }

    private static async Task<bool> SeedTenantSubscriptionAsync(AccountsDbContext accountsDbContext, AccountUser superUser, ILogger logger)
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

            // Define the subscription plan name (could also be retrieved from config)
            var subscriptionPlanName = "Default";

            // Check if a subscription plan already exists for the super user's tenant
            var existingSubscription = await accountsDbContext.TenantSubscriptions
                .Where(w => w.TenantId == defaultTenant.Id && w.IsActive)
                .SingleOrDefaultAsync();

            // If a subscription plan already exists, skip seeding and return true
            if (existingSubscription != null)
            {
                logger.LogDebug("Subscription plan {PlanName} already exists for the super user's tenant.", subscriptionPlanName);
                return true;
            }

            // Get the default subscription plan to be associated with the tenant
            var subscriptionPlan = await accountsDbContext.SubscriptionPlans
                .Where(w => w.Name == subscriptionPlanName && w.IsDefault)
                .SingleOrDefaultAsync();

            if (subscriptionPlan == null)
            {
                logger.LogError("Subscription plan {PlanName} not found.", subscriptionPlanName);
                return false;
            }

            // Create the new TenantSubscription with necessary details
            var tenantSubscription = new TenantSubscription
            {
                TenantId = defaultTenant.Id,
                PlanId = subscriptionPlan.Id,
                Frequency = SubscriptionFrequenciesEnum.Yearly,
                IsActive = true,
                Status = SubscriptionStatusTypesEnum.Active,
                NextBillingDate = new DateTimeOffset(DateTimeOffset.MaxValue.Date, TimeSpan.Zero),
                MaxCredits = ulong.MaxValue,
                MaxPublishedItems = int.MaxValue,
                MaxSpaces = int.MaxValue,
                MaxUsers = int.MaxValue,
                StorageLimitMB = int.MaxValue,
                HistoryRetentionDays = int.MaxValue,
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
                AvailableCredits = ulong.MaxValue,
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