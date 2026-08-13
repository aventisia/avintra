// For more info on How to seed data, watch YT video: https://www.youtube.com/watch?v=0B7QjRSvcGI
using WorkspaceAPIs.Entities;
using WorkspaceAPIs.Enums;
using WorkspaceAPIs.Helpers;

namespace WorkspaceAPIs.Data;

public static class WorkspaceDbInitialSeed
{
    // Platform tenant represents globally-managed platform resources (e.g., platform skills).
    private static readonly Guid PlatformTenantId = Guid.Empty;

    // Central space is represented by a null SpaceId.
    private static readonly Guid? PlatformSpaceId = null;

    // Deterministic user id used as the creator/last-modifier for platform resources.
    private static readonly Guid PlatformSystemUserId = new("11111111-1111-1111-1111-111111111111");

    public async static Task<WebApplication> SeedInitialData(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            // Get workspaceDbContext
            using var _workspaceDbContext = scope.ServiceProvider.GetRequiredService<WorkspaceDbContext>();

            // Get configuration
            var _configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            // Get logger factory for seed-time logging
            var _loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
            var _logger = _loggerFactory.CreateLogger(nameof(WorkspaceDbInitialSeed));

            // Apply pending database migrations
            await ApplyMigrationsAsync(_workspaceDbContext);

            // Seed the default platform system user used by platform resources.
            await SeedPlatformSystemUserAsync(_workspaceDbContext, _logger);

            // Seed default platform skills from the llmpipeline skills folder.
            await SeedDefaultSkillsAsync(_workspaceDbContext, _configuration, _logger);

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

            // TODO: Machine entity: Remove this temporary migration code after all legacy data is migrated
            //await UpdateMachineTableAsync(workspaceDbContext);

            // TODO: Remove once reached the main branch and deployed to production.
            await UpdateJobStatus_Abort2Aborted(workspaceDbContext);

            // TODO: Remove once reached the main branch and deployed to production.
            await UpdateTriggerType_RemoveTriggerSuffix(workspaceDbContext);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: An error occurred while applying database migrations: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Ensures a platform system workspace user exists. This user is used as the creator
    /// and last-modifier for platform-managed resources such as platform skills.
    /// </summary>
    private static async Task SeedPlatformSystemUserAsync(WorkspaceDbContext workspaceDbContext, ILogger logger)
    {
        try
        {
            var existingUser = await workspaceDbContext.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == PlatformSystemUserId);

            if (existingUser != null)
                return;

            var systemUser = new WorkspaceUser
            {
                Id = PlatformSystemUserId,
                TenantId = PlatformTenantId,
                UserName = "system",
                FirstName = "Platform",
                LastName = "System",
            };

            await workspaceDbContext.Users.AddAsync(systemUser);
            await workspaceDbContext.SaveChangesAsync();

            logger.LogInformation("Seeded platform system workspace user.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding platform system workspace user.");
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

        if (skillDirectories.Length == 0)
        {
            logger.LogWarning("No skill directories found in {SkillsPath}.", skillsPath);
            return;
        }

        foreach (var skillDirectory in skillDirectories)
        {
            await SeedDefaultSkillAsync(workspaceDbContext, skillDirectory, logger);
        }
    }

    /// <summary>
    /// Creates or updates a single platform skill from its directory.
    /// </summary>
    private static async Task SeedDefaultSkillAsync(
        WorkspaceDbContext workspaceDbContext,
        string skillDirectory,
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
                    TenantId = PlatformTenantId,
                    SpaceId = PlatformSpaceId,
                    Name = name,
                    Description = description,
                    Type = ComponentTypeEnum.Platform,
                    IsGlobal = true,
                    IsTenantWideAccess = true,
                    IsActive = true,
                    CreatedByUserId = PlatformSystemUserId,
                    LastModifiedByUserId = PlatformSystemUserId,
                    CreatedOn = now,
                    LastModifiedOn = now,
                };

                await workspaceDbContext.Skills.AddAsync(skill);
            }
            else
            {
                skill = existingSkill;
                skill.Name = name;
                skill.Description = description;
                skill.LastModifiedByUserId = PlatformSystemUserId;
                skill.LastModifiedOn = now;
                skill.IsGlobal = true;
                skill.IsTenantWideAccess = true;
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
                    TenantId = PlatformTenantId,
                    SpaceId = PlatformSpaceId,
                    SkillId = skillId,
                    FileName = "SKILL.md",
                    Content = content,
                    FileType = "markdown",
                    CreatedByUserId = PlatformSystemUserId,
                    LastModifiedByUserId = PlatformSystemUserId,
                    CreatedOn = now,
                    LastModifiedOn = now,
                };

                await workspaceDbContext.SkillFiles.AddAsync(skillFile);
            }
            else
            {
                existingSkillFile.Content = content;
                existingSkillFile.FileType = "markdown";
                existingSkillFile.LastModifiedByUserId = PlatformSystemUserId;
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

    private static async Task UpdateMachineTableAsync(WorkspaceDbContext workspaceDbContext)
    {
        // Load all machine records
        var machines = await workspaceDbContext.Machines.IgnoreQueryFilters()
            .Where(w => true)
            .ToListAsync();

        foreach (var machine in machines)
        {
            // Update the MachineName for each machine record
            machine.Name = MachinesTableHelpers.BuildMachineName(
                machine.OperatingSystem,
                machine.OsID,
                machine.Username);
        }

        await workspaceDbContext.SaveChangesAsync();


        // This section seems misplaced and should be removed, as it references 'jobs' which is not defined in this method.
    }

    // TODO: Remove once reached the main branch and deployed to production.
    private static async Task UpdateJobStatus_Abort2Aborted(WorkspaceDbContext workspaceDbContext)
    {
        // Load jobs that have Abort status
        var jobs = await workspaceDbContext.Jobs.IgnoreQueryFilters()
            .Where(w => w.Status == JobStatusEnum.Abort)
            .ToListAsync();

        // Update the status of each job to Aborted
        int updatedCount = 0;
        foreach (var job in jobs)
        {
            // Fetch the latest FlowVersionHistory for the job's FlowVersionId.
            var latestFlowVersionHistory = await workspaceDbContext.FlowVersionHistories.IgnoreQueryFilters()
                .Where(fvh => fvh.FlowVersionId == job.FlowVersionId)
                .OrderByDescending(fvh => fvh.CreatedOn)
                .FirstOrDefaultAsync();

            if (latestFlowVersionHistory != null)
            {
                job.FlowVersionHistoryId = latestFlowVersionHistory.Id;
                updatedCount++;
            }
        }

        Console.WriteLine($"Info: Updating {updatedCount} Job records with the latest FlowVersionHistoryId...");
        await workspaceDbContext.SaveChangesAsync();
        Console.WriteLine($"Info: Updated {jobs.Count} Job records from 'Abort' to 'Aborted' status.");
    }

    // TODO: Remove once reached the main branch and deployed to production.
    private static async Task UpdateTriggerType_RemoveTriggerSuffix(WorkspaceDbContext workspaceDbContext)
    {
        // Load triggers that have the "Trigger" suffix
        var triggers = await workspaceDbContext.Triggers.IgnoreQueryFilters().ToListAsync();

        // Update the type of each trigger by removing the "Trigger" suffix
        foreach (var trigger in triggers)
        {
            switch (trigger.TriggerType)
            {
                case TriggerTypesEnum.ManualTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Manual;
                    break;
                case TriggerTypesEnum.APITrigger:
                    trigger.TriggerType = TriggerTypesEnum.Api;
                    break;
                case TriggerTypesEnum.WebhookTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Webhook;
                    break;
                case TriggerTypesEnum.QueueTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Queue;
                    break;
                case TriggerTypesEnum.EventTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Event;
                    break;
                case TriggerTypesEnum.TimeTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Time;
                    break;
                case TriggerTypesEnum.EmailTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Email;
                    break;
                case TriggerTypesEnum.MessageTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Message;
                    break;
                default:
                    // If the trigger type does not have a "Trigger" suffix, do nothing
                    break;
            }
        }

        // Save changes to the database
        await workspaceDbContext.SaveChangesAsync();
        Console.WriteLine($"Info: Updated {triggers.Count} Trigger records by removing 'Trigger' suffix.");

        // Load jobs that have the "Trigger" suffix in their TriggerType
        var jobs = await workspaceDbContext.Jobs.IgnoreQueryFilters().ToListAsync();

        // Update the TriggerType of each job by removing the "Trigger" suffix
        foreach (var job in jobs)
        {
            switch (job.TriggerType)
            {
                case TriggerTypesEnum.ManualTrigger:
                    job.TriggerType = TriggerTypesEnum.Manual;
                    break;
                case TriggerTypesEnum.APITrigger:
                    job.TriggerType = TriggerTypesEnum.Api;
                    break;
                case TriggerTypesEnum.WebhookTrigger:
                    job.TriggerType = TriggerTypesEnum.Webhook;
                    break;
                case TriggerTypesEnum.QueueTrigger:
                    job.TriggerType = TriggerTypesEnum.Queue;
                    break;
                case TriggerTypesEnum.EventTrigger:
                    job.TriggerType = TriggerTypesEnum.Event;
                    break;
                case TriggerTypesEnum.TimeTrigger:
                    job.TriggerType = TriggerTypesEnum.Time;
                    break;
                case TriggerTypesEnum.EmailTrigger:
                    job.TriggerType = TriggerTypesEnum.Email;
                    break;
                case TriggerTypesEnum.MessageTrigger:
                    job.TriggerType = TriggerTypesEnum.Message;
                    break;
                default:
                    // If the trigger type does not have a "Trigger" suffix, do nothing
                    break;
            }
        }

        // Save changes to the database
        await workspaceDbContext.SaveChangesAsync();
        Console.WriteLine($"Info: Updated {jobs.Count} Job records by removing 'Trigger' suffix.");
    }
}