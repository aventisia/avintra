using AspNetToolkit.Config;
using AspNetToolkit.Data;
using WorkspaceAPIs.Entities;
using WorkspaceAPIs.Enums;
using WorkspaceAPIs.Helpers;

namespace WorkspaceAPIs.Data;

public static class WorkspaceDbInitialSeed
{
    // IMPORTANT NOTE: The central space is represented by a null SpaceId.
    private static readonly Guid? PlatformSpaceId = null;

    public async static Task<WebApplication> SeedInitialData(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            using var _workspaceDbContext = scope.ServiceProvider.GetRequiredService<WorkspaceDbContext>();

            var _configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            var _environmentConfig = scope.ServiceProvider.GetRequiredService<EnvironmentConfig>();

            using var _tenantDbContext = scope.ServiceProvider.GetRequiredService<TenantDbContext>();

            var _loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
            var _logger = _loggerFactory.CreateLogger(nameof(WorkspaceDbInitialSeed));

            await ApplyMigrationsAsync(_workspaceDbContext);

            await SeedQueueMaximumRetryAttemptsAsync(_workspaceDbContext, _logger);

            await SeedEnabledModelsAsync(_workspaceDbContext, _logger);

            await SeedGeminiBuilderModelAsync(_workspaceDbContext, _tenantDbContext, _logger);

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

            await SeedDefaultSkillsAsync(_workspaceDbContext, _configuration, platformAdmin.Value, _logger);

            // IMPORTANT NOTE: Camel tool seeding is now handled by the CamelStartupHostedService
            // (independent of the DB seed process). It seeds ALL connectors from the
            // harness catalog, superseding the old github/m365-only OpenAPI seeding.

            return app;
        }
    }

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

    private static async Task SeedQueueMaximumRetryAttemptsAsync(WorkspaceDbContext workspaceDbContext, ILogger logger)
    {
        int DefaultMaximumRetryAttempts = 3;
        var queuesToUpdate = await workspaceDbContext.Queues
            .IgnoreQueryFilters()
            .Where(q => q.MaximumRetryAttempts == 0)
            .ToListAsync();

        if (queuesToUpdate.Count == 0)
        {
            return;
        }

        foreach (var queue in queuesToUpdate)
        {
            queue.MaximumRetryAttempts = DefaultMaximumRetryAttempts;
        }

        await workspaceDbContext.SaveChangesAsync();

        logger.LogInformation(
            "Updated MaximumRetryAttempts to {DefaultMaximumRetryAttempts} for {QueueCount} existing queues.",
            DefaultMaximumRetryAttempts,
            queuesToUpdate.Count);
    }

    private static async Task SeedGeminiBuilderModelAsync(
        WorkspaceDbContext workspaceDbContext,
        TenantDbContext tenantDbContext,
        ILogger logger)
    {
        // IMPORTANT NOTE: The Gemini builder model backfill is merge-only: existing provider rows keep their disabled state, credentials, and model casing.
        try
        {
            const string GeminiBuilderModelId = "gemini-3.1-flash-lite";

            var catalogTenantIds = await tenantDbContext.ReadOnlyTenants
                .Select(tenant => tenant.Id)
                .ToListAsync();

            var providerTenantIds = await workspaceDbContext.TenantModelProviders
                .IgnoreQueryFilters()
                .Select(provider => provider.TenantId)
                .Distinct()
                .ToListAsync();

            var tenantIds = catalogTenantIds
                .Union(providerTenantIds)
                .ToList();

            var geminiProviders = await workspaceDbContext.TenantModelProviders
                .IgnoreQueryFilters()
                .Where(provider => provider.ProviderType == LLMProviderTypesEnum.Gemini)
                .ToListAsync();

            var insertedCount = 0;
            var mergedCount = 0;
            var skippedCount = 0;

            foreach (var tenantId in tenantIds)
            {
                var tenantProviders = geminiProviders
                    .Where(provider => provider.TenantId == tenantId)
                    .ToList();

                if (tenantProviders.Count == 0)
                {
                    var attributionUserId = await workspaceDbContext.Users
                        .IgnoreQueryFilters()
                        .Where(user => user.TenantId == tenantId)
                        .Select(user => (Guid?)user.Id)
                        .FirstOrDefaultAsync();

                    if (attributionUserId is null)
                    {
                        skippedCount++;
                        logger.LogWarning(
                            "Skipped Gemini builder model seeding for tenant {TenantId}: no workspace user available for attribution.",
                            tenantId);
                        continue;
                    }

                    var now = DateTimeOffset.UtcNow;

                    await workspaceDbContext.TenantModelProviders.AddAsync(new TenantModelProvider
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        ProviderType = LLMProviderTypesEnum.Gemini,
                        CredentialId = null,
                        ProviderUrl = null,
                        IsDisabled = false,
                        EnabledModelIds = new List<string> { GeminiBuilderModelId },
                        EnabledModels = new List<EnabledModel>
                        {
                            new EnabledModel
                            {
                                ModelId = GeminiBuilderModelId,
                                Capability = ModelCapabilityEnum.Text.ToString(),
                            },
                        },
                        CreatedByUserId = attributionUserId.Value,
                        LastModifiedByUserId = attributionUserId.Value,
                        CreatedOn = now,
                        LastModifiedOn = now,
                    });

                    insertedCount++;
                    continue;
                }

                foreach (var provider in tenantProviders)
                {
                    if (provider.IsDisabled)
                        continue;

                    var hasModel = provider.EnabledModels
                        .Any(model => string.Equals(
                            model.ModelId?.Trim(),
                            GeminiBuilderModelId,
                            StringComparison.OrdinalIgnoreCase));

                    if (hasModel)
                        continue;

                    provider.EnabledModels = provider.EnabledModels
                        .Append(new EnabledModel
                        {
                            ModelId = GeminiBuilderModelId,
                            Capability = ModelCapabilityEnum.Text.ToString(),
                        })
                        .ToList();

                    mergedCount++;
                }
            }

            await workspaceDbContext.SaveChangesAsync();

            logger.LogInformation(
                "Gemini builder model seeding checked {TenantCount} tenants: inserted {InsertedCount}, merged {MergedCount}, skipped {SkippedCount}.",
                tenantIds.Count,
                insertedCount,
                mergedCount,
                skippedCount);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding the Gemini builder model. Continuing startup.");
        }
    }

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

            // IMPORTANT NOTE: ReadOnlyAccountUsers.UserName/Email is seeded with the OnPremAdminEmail value.
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

    private static Guid DeterministicGuid(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}