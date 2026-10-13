// For more info on How to seed data, watch YT video: https://www.youtube.com/watch?v=0B7QjRSvcGI
using AspNetToolkit.Config;
using AspNetToolkit.Data;
using WorkspaceAPIs.Entities;
using WorkspaceAPIs.Enums;
using WorkspaceAPIs.Helpers;

namespace WorkspaceAPIs.Data;

public static class WorkspaceDbInitialSeed
{
    // Central space is represented by a null SpaceId.
    private static readonly Guid? PlatformSpaceId = null;

    public async static Task<WebApplication> SeedInitialData(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            // Get workspaceDbContext
            using var _workspaceDbContext = scope.ServiceProvider.GetRequiredService<WorkspaceDbContext>();

            // Get configuration
            var _configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            // Get environment config for default admin email lookup
            var _environmentConfig = scope.ServiceProvider.GetRequiredService<EnvironmentConfig>();

            // Get tenant db context to resolve the default admin account user
            using var _tenantDbContext = scope.ServiceProvider.GetRequiredService<TenantDbContext>();

            // Get logger factory for seed-time logging
            var _loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
            var _logger = _loggerFactory.CreateLogger(nameof(WorkspaceDbInitialSeed));

            // Apply pending database migrations
            await ApplyMigrationsAsync(_workspaceDbContext);

            await SeedEnabledModelsAsync(_workspaceDbContext, _logger);

            // Resolve the default admin user that owns platform resources.
            var platformAdmin = await ResolvePlatformAdminUserAsync(
                _workspaceDbContext,
                _tenantDbContext,
                _environmentConfig,
                _logger);

            if (platformAdmin is null)
            {
                _logger.LogWarning(
                    "No default admin user found for email {AdminEmail}. Skipping platform skill seeding.",
                    _environmentConfig.OnPremAdminEmail);

                return app;
            }

            // Seed default platform skills from the llmpipeline skills folder.
            await SeedDefaultSkillsAsync(_workspaceDbContext, _configuration, platformAdmin.Value, _logger);

            // NOTE: Camel tool seeding is now handled by the CamelStartupHostedService
            // (independent of the DB seed process). It seeds ALL connectors from the
            // harness catalog, superseding the old github/m365-only OpenAPI seeding.

            return app;
        }
    }

    // Apply pending database migrations

    private async static Task ApplyMigrationsAsync(WorkspaceDbContext workspaceDbContext)
    {
        try
        {
            Console.WriteLine("Info: Applying database migrations...");
            await workspaceDbContext.Database.MigrateAsync();
            Console.WriteLine("Info: Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: An error occurred while applying database migrations: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Seeds capability-aware enabled models from the legacy enabled model identifiers for providers that have none yet.
    /// </summary>
    private static async Task SeedEnabledModelsAsync(WorkspaceDbContext workspaceDbContext, ILogger logger)
    {
        var providers = await workspaceDbContext.TenantModelProviders
            .IgnoreQueryFilters()
            .ToListAsync();

        var providersToTransform = providers
            .Where(p => p.EnabledModels.Count == 0 && p.EnabledModelIds.Count > 0)
            .ToList();

        foreach (var provider in providersToTransform)
        {
            provider.EnabledModels = provider.EnabledModelIds
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => new EnabledModel { ModelId = id.Trim(), Capability = null })
                .GroupBy(m => m.ModelId, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First())
                .ToList();
        }

        if (providersToTransform.Count == 0)
        {
            return;
        }

        await workspaceDbContext.SaveChangesAsync();

        logger.LogInformation(
            "Seeded enabled models for {ProviderCount} tenant model providers.",
            providersToTransform.Count);
    }

    /// <summary>
    /// Looks up the default admin account user by <see cref="EnvironmentConfig.OnPremAdminEmail"/>
    /// from the tenant (AccountsDb) context, then ensures a matching WorkspaceUser row exists.
    /// Returns the workspace user id and the admin's tenant id, or null when no admin can be resolved.
    /// </summary>
    private static async Task<(Guid UserId, Guid TenantId)?> ResolvePlatformAdminUserAsync(
        WorkspaceDbContext workspaceDbContext,
        TenantDbContext tenantDbContext,
        EnvironmentConfig environmentConfig,
        ILogger logger)
    {
        try
        {
            var adminEmail = environmentConfig.OnPremAdminEmail?.Trim();

            if (string.IsNullOrWhiteSpace(adminEmail))
            {
                logger.LogWarning("EnvironmentConfig.OnPremAdminEmail is not set. Cannot resolve platform admin user.");
                return null;
            }

            // ReadOnlyAccountUsers user name/email is seeded with OnPremAdminEmail value.
            var accountUser = await tenantDbContext.ReadOnlyAccountUsers
                .FirstOrDefaultAsync(u =>
                    (u.Email != null && u.Email.ToLower() == adminEmail.ToLower())
                    || (u.UserName != null && u.UserName.ToLower() == adminEmail.ToLower()));

            logger.LogInformation(
                "Resolved default admin account lookup for {AdminEmail}: found={Found}, userId={UserId}, tenantId={TenantId}",
                adminEmail,
                accountUser != null,
                accountUser?.Id,
                accountUser?.TenantId);

            if (accountUser is null)
            {
                logger.LogWarning("Default admin account user not found for email {AdminEmail}.", adminEmail);
                return null;
            }

            if (accountUser.TenantId is null || accountUser.TenantId == Guid.Empty)
            {
                logger.LogWarning(
                    "Default admin account user {UserId} does not have an assigned tenant. Skipping platform skill seeding.",
                    accountUser.Id);
                return null;
            }

            var adminTenantId = accountUser.TenantId.Value;

            var workspaceUser = await workspaceDbContext.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == accountUser.Id);

            if (workspaceUser is null)
            {
                workspaceUser = new WorkspaceUser
                {
                    Id = accountUser.Id,
                    TenantId = adminTenantId,
                    UserName = accountUser.UserName ?? adminEmail,
                    FirstName = accountUser.FirstName ?? "Platform",
                    LastName = accountUser.LastName ?? "Admin",
                };

                await workspaceDbContext.Users.AddAsync(workspaceUser);
                await workspaceDbContext.SaveChangesAsync();

                logger.LogInformation(
                    "Seeded workspace user {UserId} for default admin {AdminEmail} under tenant {TenantId}.",
                    workspaceUser.Id,
                    adminEmail,
                    adminTenantId);
            }

            return (workspaceUser.Id, adminTenantId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error resolving default admin workspace user.");
            throw;
        }
    }

    /// <summary>
    /// Seeds default platform skills discovered from the llmpipeline skills folder.
    /// Each skill is matched by a deterministic id and is created or updated on every startup.
    /// </summary>
    private static async Task SeedDefaultSkillsAsync(
        WorkspaceDbContext workspaceDbContext,
        IConfiguration configuration,
        (Guid UserId, Guid TenantId) platformAdmin,
        ILogger logger)
    {
        var skillsPathSetting = configuration["Skills:DefaultSkillsPath"];
        var contentRootPath = configuration[Microsoft.AspNetCore.Hosting.WebHostDefaults.ContentRootKey]
            ?? Directory.GetCurrentDirectory();

        var skillsPath = string.IsNullOrWhiteSpace(skillsPathSetting)
            ? Path.Combine(contentRootPath, "..", "..", "llmpipeline", "app", "features", "langgraph", "skills")
            : Path.Combine(contentRootPath, skillsPathSetting);

        skillsPath = Path.GetFullPath(skillsPath);

        if (!Directory.Exists(skillsPath))
        {
            logger.LogWarning("Default skills directory not found at {SkillsPath}. Skipping platform skill seeding.", skillsPath);
            return;
        }

        var skillDirectories = Directory.GetDirectories(skillsPath);

        logger.LogInformation(
            "Found {Count} skill directories in {SkillsPath}.",
            skillDirectories.Length,
            skillsPath);

        if (skillDirectories.Length == 0)
        {
            logger.LogWarning("No skill directories found in {SkillsPath}.", skillsPath);
            return;
        }

        foreach (var skillDirectory in skillDirectories)
        {
            await SeedDefaultSkillAsync(workspaceDbContext, skillDirectory, platformAdmin, logger);
        }
    }

    /// <summary>
    /// Creates or updates a single platform skill from its directory.
    /// </summary>
    private static async Task SeedDefaultSkillAsync(
        WorkspaceDbContext workspaceDbContext,
        string skillDirectory,
        (Guid UserId, Guid TenantId) platformAdmin,
        ILogger logger)
    {
        var skillName = Path.GetFileName(skillDirectory);
        var skillMdPath = Path.Combine(skillDirectory, "SKILL.md");

        try
        {
            if (!File.Exists(skillMdPath))
            {
                logger.LogWarning("SKILL.md not found for skill {SkillName} at {Path}. Skipping.", skillName, skillMdPath);
                return;
            }

            var content = await File.ReadAllTextAsync(skillMdPath);
            var parsed = SkillMarkdownParser.Parse(content, skillName);

            if (parsed is null)
            {
                logger.LogWarning("SKILL.md for {SkillName} is missing valid front-matter. Skipping.", skillName);
                return;
            }

            var (name, description) = parsed.Value;
            var skillId = DeterministicGuid(name);

            var existingSkill = await workspaceDbContext.Skills
                .IgnoreQueryFilters()
                .Include(s => s.Files)
                .FirstOrDefaultAsync(s => s.Id == skillId);

            Skill skill;
            var now = DateTimeOffset.UtcNow;

            if (existingSkill is null)
            {
                skill = new Skill
                {
                    Id = skillId,
                    TenantId = platformAdmin.TenantId,
                    SpaceId = PlatformSpaceId,
                    Name = name,
                    Description = description,
                    Type = ComponentTypeEnum.Platform,
                    IsGlobal = false,
                    IsTenantWideAccess = false,
                    IsActive = true,
                    CreatedByUserId = platformAdmin.UserId,
                    LastModifiedByUserId = platformAdmin.UserId,
                    CreatedOn = now,
                    LastModifiedOn = now,
                };

                await workspaceDbContext.Skills.AddAsync(skill);
            }
            else
            {
                skill = existingSkill;
                skill.TenantId = platformAdmin.TenantId;
                skill.Name = name;
                skill.Description = description;
                skill.LastModifiedByUserId = platformAdmin.UserId;
                skill.LastModifiedOn = now;
                skill.IsGlobal = false;
                skill.IsTenantWideAccess = false;
                skill.IsActive = true;
                skill.Type = ComponentTypeEnum.Platform;
            }

            await workspaceDbContext.SaveChangesAsync();

            var existingSkillFile = await workspaceDbContext.SkillFiles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(f => f.SkillId == skillId && f.FileName == "SKILL.md");

            if (existingSkillFile is null)
            {
                var skillFile = new SkillFile
                {
                    Id = Guid.NewGuid(),
                    TenantId = platformAdmin.TenantId,
                    SpaceId = PlatformSpaceId,
                    SkillId = skillId,
                    FileName = "SKILL.md",
                    Content = content,
                    FileType = "Markdown",
                    CreatedByUserId = platformAdmin.UserId,
                    LastModifiedByUserId = platformAdmin.UserId,
                    CreatedOn = now,
                    LastModifiedOn = now,
                };

                await workspaceDbContext.SkillFiles.AddAsync(skillFile);
            }
            else
            {
                existingSkillFile.TenantId = platformAdmin.TenantId;
                existingSkillFile.Content = content;
                existingSkillFile.FileType = "Markdown";
                existingSkillFile.LastModifiedByUserId = platformAdmin.UserId;
                existingSkillFile.LastModifiedOn = now;
            }

            await workspaceDbContext.SaveChangesAsync();

            logger.LogInformation(
                "Seeded platform skill {SkillName} ({SkillId}).",
                name,
                skillId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding platform skill {SkillName}.", skillName);
        }
    }

    /// <summary>
    /// Generates a deterministic GUID from a skill name so the same skill always maps
    /// to the same primary key across environments and re-seeds.
    /// </summary>
    private static Guid DeterministicGuid(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}