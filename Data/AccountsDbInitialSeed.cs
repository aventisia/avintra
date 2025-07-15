// For more info on How to seed data, watch YT video: https://www.youtube.com/watch?v=0B7QjRSvcGI
using Newtonsoft.Json;

namespace AccountsAPIs.Data;

public static class AccountsDbInitialSeed
{
    public static async Task<WebApplication> SeedInitialData(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        // Get TenantDefaultConfig
        var tenantDefaultConfig = scope.ServiceProvider.GetRequiredService<TenantDefaultConfig>();

        // Get DefaultUsersConfig
        var defaultUsersConfig = scope.ServiceProvider.GetRequiredService<DefaultUsersConfig>();

        // Get accountsDbContext
        using var _accountsDbContext =
            scope.ServiceProvider.GetRequiredService<AccountsDbContext>();

        // Get RoleManager and UserManager
        using var _roleManager = scope.ServiceProvider.GetRequiredService<
            RoleManager<AccountRole>
        >();
        using var _userManager = scope.ServiceProvider.GetRequiredService<
            UserManager<AccountUser>
        >();

        var superUserId = Guid.NewGuid();

        // Try to seed data
        try
        {
            // Seed Roles
            await SeedRolesAsync(_roleManager);

            // Seed Super User without tenant
            var superUser = await SeedSuperUserAsync(
                _userManager,
                defaultUsersConfig.SuperUser,
                superUserId
            );

            // Seed Permissions
            await SeedPermissionsAsync(_accountsDbContext, superUserId);

            await _accountsDbContext.SaveChangesAsync();

            // Super user not seeded
            if (superUser == null)
                Console.WriteLine("creating sa failed");

            // Seed default tenants
            await SeedDefaultTenantsAsync(_accountsDbContext, tenantDefaultConfig, superUser.Id);

            // Seed default IndividualUser
            await SeedIndividualUserAsync(
                _accountsDbContext,
                _userManager,
                defaultUsersConfig.IndividualUser,
                superUser.Id
            );

            // Update Super user tenant Id
            await UpdateSuperUserTenantId(_accountsDbContext, superUser.Id);
            return app;
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: Error occurred while tyring to seed data: " + ex.Message);
        }
        return app;
    }

    // Seed roles
    static async Task<bool> SeedRolesAsync(RoleManager<AccountRole> roleManager)
    {
        try
        {
            foreach (var role in Enum.GetValues(typeof(CustomRolesEnum)))
            {
                // Get role description
                var userRoleDescription = GetEnumDescriptionUtil.GetEnumDescription((Enum)role);

                // Split role description using semicolon (;)
                string[] splitContent = userRoleDescription.Split(';');

                await roleManager.CreateAsync(
                    new AccountRole()
                    {
                        Seq = Convert.ToInt32(splitContent[0].Trim()),
                        Name = role.ToString(),
                        FullName = splitContent[1].Trim(),
                        Description = splitContent[2].Trim(),
                    }
                );
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
    static async Task<AccountUser?> SeedSuperUserAsync(
        UserManager<AccountUser> userManager,
        DefaultUser defaultSuperUser,
        Guid superUserId
    )
    {
        try
        {
            // Initialize super user
            var superUser = new AccountUser()
            {
                Id = superUserId,
                UserName = defaultSuperUser.Email,
                Email = defaultSuperUser.Email,
                EmailConfirmed = true,
                FirstName = defaultSuperUser.FirstName,
                LastName = defaultSuperUser.LastName,
                PwdSetOn = DateTimeOffset.UtcNow,
                IsDefault = true,
                IsEditable = false,
                TenantId = null,
                CreatedByUserId = superUserId,
                LastModifiedByUserId = superUserId,
            };

            // Add supper user & its roles
            var createUserResult = await userManager.CreateAsync(superUser);
            var addToRoleResult = await userManager.AddToRolesAsync(
                superUser,
                defaultSuperUser.Roles
            );

            // Super user creation failed
            if (!createUserResult.Succeeded || !addToRoleResult.Succeeded)
            {
                // Log create user errors
                Console.WriteLine(
                    $"Super user creation failed. {JsonConvert.SerializeObject(createUserResult.Errors)}"
                );

                // Log add-to-role errors
                Console.WriteLine(
                    $"Adding roles for super user failed. {JsonConvert.SerializeObject(addToRoleResult.Errors)}"
                );

                return null;
            }

            // Super user seeded successfully
            return superUser;
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                "Error: Error occurred while tyring to seed super user : " + ex.Message
            );
            return null;
        }
    }

    // Seed default tenants
    static async Task<bool> SeedDefaultTenantsAsync(
        AccountsDbContext accountsDbContext,
        TenantDefaultConfig tenantDefaultConfig,
        Guid superUserId
    )
    {
        try
        {
            foreach (Enum defaultTenant in Enum.GetValues(typeof(DefaultTenantsEnum)))
            {
                // Initialize default tenant
                var newTenant = new Tenant()
                {
                    Type = TenantTypesEnum.Shared,
                    Currency = CurrencyTypesEnum.USD,
                    Name = GetEnumDescriptionUtil.GetEnumDescription(defaultTenant),
                    ExpiresOn = DateTimeOffset.UtcNow.AddDays(
                        tenantDefaultConfig.InactiveDaysBeforeDataExpires
                    ),
                    IsSSOEnabled = false,
                    IsPwdEnabled = true,
                    IsPwdNeverExpiresEnabled = true,
                    IsIdleSessionTimeoutEnabled = true,
                    IsTwoFAEnabled = false,
                    DaysBeforePwdExpires = tenantDefaultConfig.DaysBeforePwdExpires,
                    IdleSessionTimeoutMinutes = tenantDefaultConfig.IdleSessionTimeoutInMinutes,
                    IsDefault = true,
                    IsEditable = !defaultTenant.Equals(DefaultTenantsEnum.IndividualUsers),
                    SSOConfigJson = "",
                    DbOption = DatabaseOptionsEnum.Isolated,
                    CreatedByUserId = superUserId,
                    LastModifiedByUserId = superUserId,
                };

                // Add tenant
                await accountsDbContext.Tenants.AddAsync(newTenant);
            }

            // Save changes
            await accountsDbContext.SaveChangesAsync();

            // Tenants seeded successfully
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                "Error: Error occurred while tyring to seed default tenants: " + ex.Message
            );
            return false;
        }
    }

    // Seed Individual User
    static async Task<bool> SeedIndividualUserAsync(
        AccountsDbContext accountsDbContext,
        UserManager<AccountUser> userManager,
        DefaultUser defaultIndividualUser,
        Guid superUserId
    )
    {
        try
        {
            // Get Tenant name
            var tenantName = GetEnumDescriptionUtil.GetEnumDescription(
                DefaultTenantsEnum.IndividualUsers
            );

            // Get default Tenant for individual user
            var defaultTenant = await accountsDbContext
                .Tenants.Where(w => w.IsDefault && w.Name == tenantName)
                .SingleOrDefaultAsync();

            // Default Tenant not found
            if (defaultTenant == null)
            {
                Console.WriteLine("Error: Default Tenant not found for individual user");
                return false;
            }

            // Initialize individual user
            var individualUser = new AccountUser()
            {
                UserName = defaultIndividualUser.Email,
                Email = defaultIndividualUser.Email,
                EmailConfirmed = true,
                FirstName = defaultIndividualUser.FirstName,
                LastName = defaultIndividualUser.LastName,
                PwdSetOn = DateTimeOffset.UtcNow,
                IsDefault = true,
                IsEditable = false,
                TenantId = defaultTenant.Id,
                CreatedByUserId = superUserId,
                LastModifiedByUserId = superUserId,
            };

            // Add individual user & its roles
            var createUserResult = await userManager.CreateAsync(individualUser);
            var addToRoleResult = await userManager.AddToRolesAsync(
                individualUser,
                defaultIndividualUser.Roles
            );

            // Individual user creation failed
            if (!createUserResult.Succeeded || !addToRoleResult.Succeeded)
            {
                // Log create user errors
                foreach (var error in createUserResult.Errors)
                    Console.WriteLine(
                        $"Individual user creation failed. ErrorCode: {error.Code}, Description: {error.Description}"
                    );

                // Log add-to-role errors
                foreach (var error in addToRoleResult.Errors)
                    Console.WriteLine(
                        $"Adding roles for individual user failed. ErrorCode: {error.Code}, Description: {error.Description}"
                    );

                return false;
            }

            // Individual user seeded successfully
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                "Error: Error occurred while tyring to seed individual user : " + ex.Message
            );
            return false;
        }
    }

    // Seed permissions
    static async Task<bool> SeedPermissionsAsync(AccountsDbContext dbContext, Guid superUserId)
    {
        try
        {
            foreach (var permission in Enum.GetValues(typeof(PermissionTypesEnum)))
            {
                // Get permission description
                var userPermissionDescription = GetEnumDescriptionUtil.GetEnumDescription(
                    (Enum)permission
                );

                // Split permission description using semicolon (;)
                string[] splitContent = userPermissionDescription.Split(';');

                await dbContext.Permissions.AddAsync(
                    new Permission()
                    {
                        Name = permission.ToString(),
                        FullName = splitContent[1].Trim(),
                        Description = splitContent[2].Trim(),
                        CreatedByUserId = superUserId,
                        LastModifiedByUserId = superUserId,
                    }
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                "Error: Error occurred while trying to seed permissions: " + ex.Message
            );
            return false;
        }

        // Roles seeded successfully
        return true;
    }

    static async Task<bool> UpdateSuperUserTenantId(
        AccountsDbContext accountsDbContext,
        Guid superUserId
    )
    {
        try
        {
            // Get Tenant name
            var tenantName = GetEnumDescriptionUtil.GetEnumDescription(
                DefaultTenantsEnum.Aventisia
            );

            // Get default Tenant for super user
            var defaultTenant = await accountsDbContext
                .Tenants.Where(w => w.IsDefault && w.Name == tenantName)
                .SingleOrDefaultAsync();

            // Default Tenant not found
            if (defaultTenant == null)
            {
                Console.WriteLine("Error: Default Tenant not found for super user");
                return false;
            }

            // Get super user
            var superUser = await accountsDbContext
                .Users.Include(i => i.Tenant)
                .Include(i => i.UserRoles)
                .Where(w => w.Id == superUserId)
                .SingleOrDefaultAsync();

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
            Console.WriteLine(
                "Error: Error occurred while tyring to update super user tenant : " + ex.Message
            );
            return false;
        }
    }
}
