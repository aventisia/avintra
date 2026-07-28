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

            // Get accountsDbContext
            using var _accountsDbContext = scope.ServiceProvider.GetRequiredService<AccountsDbContext>();

            // Apply pending database migrations
            await ApplyMigrationsAsync(_accountsDbContext);

            // Get RoleManager and UserManager
            using var _roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AccountRole>>();
            using var _userManager = scope.ServiceProvider.GetRequiredService<UserManager<AccountUser>>();

            // Try to seed data
            try
            {
                // Seeding is not required
                if (!await IsSeedingRequired(_accountsDbContext)) return app;

                // Seed Roles
                if (!await SeedDefaultRolesAsync(_roleManager)) return app;

                // Seed Super User without tenant
                var superUser = await SeedSuperUserAsync(_userManager, environmentConfig);

                // Super user not seeded
                if (superUser == null) return app;

                // Seed Permissions
                if (!await SeedPermissionsAsync(_accountsDbContext, superUser)) return app;

                // Seed default tenant
                var defaultTenant = await SeedDefaultTenantAsync(_accountsDbContext, environmentConfig, superUser.Id);

                // Default tenant not seeded
                if (defaultTenant == null) return app;

                // Update Super user tenant Id
                if (!await UpdateSuperUserTenantId(_accountsDbContext, defaultTenant.Id, superUser.Id)) return app;

                // Seed Permissions
                if (!await SeedCreditPlansAsync(_accountsDbContext, superUser)) return app;

                // Seed the default Subscription Plan (create or ensure the default subscription plan exists)
                if (!await SeedSubscriptionPlanAsync(_accountsDbContext, environmentConfig, superUser))
                    return app;

                // Seed the Tenant Subscription (this associates the super user with a subscription plan for their tenant)
                if (!await SeedTenantSubscriptionAsync(_accountsDbContext, superUser))
                    return app;

                // Seed the Tenant Credits (this associates the super user with a subscription plan for their tenant)
                if (!await SeedTenantCreditsAsync(_accountsDbContext, superUser))
                    return app;

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: Error occurred while tyring to seed data: " + ex.Message);
            }
            return app;
        }
    }

    // Apply pending database migrations
    private async static Task ApplyMigrationsAsync(AccountsDbContext accountsDbContext)
    {
        try
        {
            Console.WriteLine("Info: Applying database migrations...");
            await accountsDbContext.Database.MigrateAsync();
            Console.WriteLine("Info: Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: An error occurred while applying database migrations: {ex.Message}");
            throw;
        }
    }

    // Check if data already exists
    private static async Task<bool> IsSeedingRequired(AccountsDbContext accountsDbContext)
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
                Console.WriteLine("Info: Role's data already exists, so, skipping data seed process");
                return false;
            }

            // Tenant already exists
            if (await accountsDbContext.Tenants.Where(w => w.IsDefault).CountAsync() > 0)
            {
                Console.WriteLine("Info: Tenant's data already exists, so, skipping data seed process");
                return false;
            }

            // User already exists
            if (await accountsDbContext.Users.Where(w => w.IsDefault).CountAsync() > 0)
            {
                Console.WriteLine("Info: User's data already exists, so, skipping data seed process");
                return false;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: Error occurred while tyring to check if data already exists: " + ex.Message);
            return false;
        }

        // Seeding is required
        return true;
    }

    // Seed roles
    private async static Task<bool> SeedDefaultRolesAsync(RoleManager<AccountRole> roleManager)
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
            Console.WriteLine("Error: Error occurred while tyring to seed roles: " + ex.Message);
            return false;
        }

        // Roles seeded successfully
        return true;
    }

    // Seed super user without tenant
    private async static Task<AccountUser?> SeedSuperUserAsync(UserManager<AccountUser> userManager, EnvironmentConfig environmentConfig)
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
                // Log create user errors
                foreach (var error in createUserResult.Errors)
                    Console.WriteLine($"Super user creation failed. ErrorCode: {error.Code}, Description: {error.Description}");

                // Log add-to-role errors
                foreach (var error in addToRoleResult.Errors)
                    Console.WriteLine($"Adding roles for super user failed. ErrorCode: {error.Code}, Description: {error.Description}");

                return null;
            }

            Console.WriteLine("User created successfully.");
            Console.WriteLine($"Email: {superUser.Email}");
            Console.WriteLine($"Password: {password}");

            // Super user seeded successfully
            return superUser;
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: Error occurred while tyring to seed super user : " + ex.Message);
            return null;
        }
    }

    // Seed default tenants
    private async static Task<Tenant?> SeedDefaultTenantAsync(AccountsDbContext accountsDbContext, EnvironmentConfig environmentConfig, Guid superUserId)
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
            Console.WriteLine("Error: Error occurred while tyring to seed default tenants: " + ex.Message);
            return null;
        }
    }

    // Seed permissions
    private async static Task<bool> SeedPermissionsAsync(AccountsDbContext dbContext, AccountUser superUser)
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
            Console.WriteLine("Error: Error occurred while trying to seed permissions: " + ex.Message);
            return false;
        }

        // Roles seeded successfully
        return true;
    }

    private static async Task<bool> UpdateSuperUserTenantId(AccountsDbContext accountsDbContext, Guid defaultTenantId, Guid superUserId)
    {
        try
        {
            // Get default Tenant for super user
            var defaultTenant = await accountsDbContext.Tenants.Where(w => w.Id == defaultTenantId).SingleOrDefaultAsync();

            // Default Tenant not found
            if (defaultTenant == null)
            {
                Console.WriteLine("Error: Default Tenant not found for super user");
                return false;
            }

            // Get super user
            var superUser = await accountsDbContext.Users.Include(i => i.Tenant).Include(i => i.UserRoles).Where(w => w.Id == superUserId).SingleOrDefaultAsync();

            // Super user not found
            if (superUser == null)
            {
                Console.WriteLine("Error: Super user not found for updating tenant Id");
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
            Console.WriteLine("Error: Error occurred while tyring to update super user tenant : " + ex.Message);
            return false;
        }
    }

    // Seed CreditPlans based on CreditServicesEnum
    private async static Task<bool> SeedCreditPlansAsync(AccountsDbContext dbContext, AccountUser superUser)
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
            // Log detailed error information for debugging
            Console.WriteLine($"Error: Error occurred while seeding credit plans. Exception: {ex.Message}");
            return false;
        }

        // Credit plans seeded successfully
        return true;
    }

    private static async Task<bool> SeedSubscriptionPlanAsync(AccountsDbContext accountsDbContext, EnvironmentConfig environmentConfig, AccountUser superUser)
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
                Console.WriteLine($"Subscription plan '{subscriptionPlanName}' already exists.");
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
            // Log the error and return false if seeding failed
            Console.WriteLine($"Error: An error occurred while trying to seed the subscription plan: {ex.Message}");
            return false;
        }
    }

    private static async Task<bool> SeedTenantSubscriptionAsync(AccountsDbContext accountsDbContext, AccountUser superUser)
    {
        try
        {
            // Get the default tenant associated with the super user
            var defaultTenant = await accountsDbContext.Tenants
                .Where(w => w.Id == superUser.TenantId)
                .SingleOrDefaultAsync();

            // If the default tenant is not found, log the error and return false
            if (defaultTenant == null)
            {
                Console.WriteLine("Error: Default Tenant not found for super user");
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
                Console.WriteLine($"Subscription plan '{subscriptionPlanName}' already exists for the super user's tenant.");
                return true;
            }

            // Get the default subscription plan to be associated with the tenant
            var subscriptionPlan = await accountsDbContext.SubscriptionPlans
                .Where(w => w.Name == subscriptionPlanName && w.IsDefault)
                .SingleOrDefaultAsync();

            // If the subscription plan is not found, log the error and return false
            if (subscriptionPlan == null)
            {
                Console.WriteLine($"Error: Subscription plan '{subscriptionPlanName}' not found.");
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
                NextBillingDate = DateTimeOffset.MaxValue.Date,
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
            // Log the error and return false if seeding failed
            Console.WriteLine($"Error: An error occurred while trying to seed the tenant subscription: {ex.Message}");
            return false;
        }
    }

    private static async Task<bool> SeedTenantCreditsAsync(AccountsDbContext accountsDbContext, AccountUser superUser)
    {
        try
        {
            // Fetch the default tenant associated with the super user
            var defaultTenant = await accountsDbContext.Tenants
                .Where(w => w.Id == superUser.TenantId)
                .SingleOrDefaultAsync();

            // If the default tenant is not found, log the error and return false
            if (defaultTenant == null)
            {
                Console.WriteLine("Error: Default Tenant not found for super user");
                return false;
            }

            // Check if the tenant already has an active subscription
            var tenantSubscription = await accountsDbContext.TenantSubscriptions
                .Where(w => w.TenantId == defaultTenant.Id && w.IsActive)
                .SingleOrDefaultAsync();

            // If no active subscription is found, log the error and return false
            if (tenantSubscription == null)
            {
                Console.WriteLine("Error: No active subscription found for the super user's tenant.");
                return false;
            }

            // Check if the tenant already has credits
            var existingCredits = await accountsDbContext.TenantCredits
                .Where(w => w.TenantId == superUser.TenantId)
                .SingleOrDefaultAsync();

            // If tenant credits already exist, skip seeding and return true
            if (existingCredits != null)
            {
                Console.WriteLine($"Tenant credits already exist for the super user's tenant.");
                return true;
            }

            // Create a new TenantCredits entry
            var tenantCredits = new TenantCredit
            {
                TenantId = defaultTenant.Id,
                SubscriptionId = tenantSubscription.Id,
                AvailableCredits = ulong.MaxValue,
                ExpiredOn = DateTimeOffset.MaxValue,
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
            // Log the error and return false if seeding failed
            Console.WriteLine($"Error: An error occurred while trying to seed tenant credits: {ex.Message}");
            return false;
        }
    }
}