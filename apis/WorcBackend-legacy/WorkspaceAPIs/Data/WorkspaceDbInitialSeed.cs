// For more info on How to seed data, watch YT video: https://www.youtube.com/watch?v=0B7QjRSvcGI
using AspNetToolkit.Config;
using AspNetToolkit.Data;
using WorkspaceAPIs.Entities;
using WorkspaceAPIs.Enums;
using WorkspaceAPIs.Features.Tools.Helpers;
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

            // Seed platform ws_Tools for the Apache Camel github/m365 connectors from
            // the generated compact OpenAPI specs (Q10=A).
            await SeedDefaultCamelToolsAsync(_workspaceDbContext, platformAdmin.Value, _logger);

            // Seed platform ws_Tools for the Corsair github/outlook plugins from the
            // generated compact OpenAPI specs (committed, no live sidecar call).
            await SeedDefaultCorsairToolsAsync(_workspaceDbContext, platformAdmin.Value, _logger);

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
    /// Seeds default platform <c>ws_Tools</c> for the Apache Camel github/m365
    /// connectors from the compact OpenAPI specs generated by the generator tool
    /// (ConfigFiles/Camel/openapi/*.openapi.json). Idempotent: matched by a
    /// deterministic id, created or updated on every startup.
    /// </summary>
    private static async Task SeedDefaultCamelToolsAsync(
        WorkspaceDbContext workspaceDbContext,
        (Guid UserId, Guid TenantId) platformAdmin,
        ILogger logger)
    {
        var contentRootPath = Directory.GetCurrentDirectory();
        var openApiDir = Path.Combine(
            contentRootPath,
            "Features", "CloudConnectors", "ConfigFiles", "Camel", "openapi");

        if (!Directory.Exists(openApiDir))
        {
            logger.LogWarning("Camel OpenAPI specs directory not found at {OpenApiDir}. Skipping Camel tool seeding.", openApiDir);
            return;
        }

        var now = DateTimeOffset.UtcNow;

        foreach (var specFile in Directory.GetFiles(openApiDir, "*.openapi.json"))
        {
            var fileName = Path.GetFileName(specFile); // e.g. github.openapi.json
            var family = Path.GetFileNameWithoutExtension(fileName).Split('.')[0].ToLowerInvariant();
            if (family != "github" && family != "m365")
            {
                logger.LogInformation("Skipping non-seedable Camel OpenAPI spec {FileName}.", fileName);
                continue;
            }

            try
            {
                var spec = await File.ReadAllTextAsync(specFile);
                var parsedSchema = OpenApiSpecHelpers.FlattenOpenApiSpec(spec);
                if (parsedSchema is null)
                {
                    logger.LogWarning("Could not parse OpenAPI spec {FileName}; skipping Camel tool seeding.", fileName);
                    continue;
                }

                var toolName = family switch
                {
                    "github" => "Camel GitHub",
                    "m365" => "Camel M365",
                    _ => "Camel " + char.ToUpperInvariant(family[0]) + family[1..],
                };
                var toolId = DeterministicGuid("camel-tool-" + toolName);
                var baseUrl = family == "github"
                    ? "https://api.github.com"
                    : "https://graph.microsoft.com/v1.0";

                var existing = await workspaceDbContext.Tools
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(t => t.Id == toolId);

                if (existing is null)
                {
                    var tool = new Tool
                    {
                        Id = toolId,
                        TenantId = platformAdmin.TenantId,
                        SpaceId = PlatformSpaceId,
                        EnvType = ConfigureEnvironmentType.Dev,
                        Name = toolName,
                        Description = $"Apache Camel {family} connector (platform tool, seeded from the Camel harness OpenAPI spec).",
                        Type = ComponentTypeEnum.Platform,
                        BaseUrl = baseUrl,
                        OpenApiSpec = spec,
                        ParsedSchema = parsedSchema,
                        AuthenticationType = ToolAuthenticationTypeEnum.Bearer,
                        IsTenantWideAccess = true,
                        IsActive = true,
                        IsVerified = true,
                        CreatedByUserId = platformAdmin.UserId,
                        LastModifiedByUserId = platformAdmin.UserId,
                        CreatedOn = now,
                        LastModifiedOn = now,
                    };
                    await workspaceDbContext.Tools.AddAsync(tool);
                }
                else
                {
                    existing.Name = toolName;
                    existing.Description = $"Apache Camel {family} connector (platform tool, seeded from the Camel harness OpenAPI spec).";
                    existing.TenantId = platformAdmin.TenantId;
                    existing.BaseUrl = baseUrl;
                    existing.OpenApiSpec = spec;
                    existing.ParsedSchema = parsedSchema;
                    existing.AuthenticationType = ToolAuthenticationTypeEnum.Bearer;
                    existing.IsTenantWideAccess = true;
                    existing.IsActive = true;
                    existing.IsVerified = true;
                    existing.LastModifiedByUserId = platformAdmin.UserId;
                    existing.LastModifiedOn = now;
                }

                await workspaceDbContext.SaveChangesAsync();

                logger.LogInformation("Seeded platform Camel tool {ToolName} ({ToolId}).", toolName, toolId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding Camel tool from spec {FileName}.", fileName);
            }
        }
    }

    /// <summary>
    /// Seeds platform ws_Tools for the Corsair github/outlook plugins from the
    /// generated compact OpenAPI specs under
    /// <c>Features/CloudConnectors/ConfigFiles/Corsair/openapi</c>.
    ///
    /// The specs are committed (generated by the Corsair <c>generate:dcp</c>
    /// script) so seeding never calls the sidecar over HTTP during startup.
    /// Idempotent: each tool is matched by a deterministic id and created or
    /// updated on every startup, mirroring <see cref="SeedDefaultCamelToolsAsync"/>.
    /// </summary>
    private static async Task SeedDefaultCorsairToolsAsync(
        WorkspaceDbContext workspaceDbContext,
        (Guid UserId, Guid TenantId) platformAdmin,
        ILogger logger)
    {
        var contentRootPath = Directory.GetCurrentDirectory();
        var openApiDir = Path.Combine(
            contentRootPath,
            "Features", "CloudConnectors", "ConfigFiles", "Corsair", "openapi");

        if (!Directory.Exists(openApiDir))
        {
            logger.LogWarning("Corsair OpenAPI specs directory not found at {OpenApiDir}. Skipping Corsair tool seeding.", openApiDir);
            return;
        }

        var now = DateTimeOffset.UtcNow;

        foreach (var specFile in Directory.GetFiles(openApiDir, "*.openapi.json"))
        {
            var fileName = Path.GetFileName(specFile); // e.g. github.openapi.json
            var plugin = Path.GetFileNameWithoutExtension(fileName).Split('.')[0].ToLowerInvariant();

            try
            {
                var spec = await File.ReadAllTextAsync(specFile);
                var parsedSchema = OpenApiSpecHelpers.FlattenOpenApiSpec(spec);
                if (parsedSchema is null)
                {
                    logger.LogWarning("Could not parse OpenAPI spec {FileName}; skipping Corsair tool seeding.", fileName);
                    continue;
                }

                // The base URL is embedded in the generated spec's servers[0].url
                // (populated from the DCP generator's DEFAULT_BASE_URL_MAP). Derive it
                // from the spec so every registered plugin is seeded without a
                // hardcoded allow-list. Fall back to a placeholder when absent.
                var baseUrl = ExtractServerBaseUrl(parsedSchema) ?? "https://api.example.com";

                // User-facing tool names must NOT expose the internal "Corsair" infrastructure name.
                // The tool ID remains deterministic and internal; only the display name/description are public.
                var toolName = plugin switch
                {
                    "github" => "GitHub",
                    "outlook" => "Outlook",
                    "resend" => "Resend",
                    "tavily" => "Tavily",
                    "slack" => "Slack",
                    "stripe" => "Stripe",
                    "notion" => "Notion",
                    "hubspot" => "HubSpot",
                    "twilio" => "Twilio",
                    "openweathermap" => "OpenWeatherMap",
                    _ => char.ToUpperInvariant(plugin[0]) + plugin[1..],
                };
                var toolId = DeterministicGuid("corsair-tool-" + plugin);

                var existing = await workspaceDbContext.Tools
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(t => t.Id == toolId);

                if (existing is null)
                {
                    var tool = new Tool
                    {
                        Id = toolId,
                        TenantId = platformAdmin.TenantId,
                        SpaceId = PlatformSpaceId,
                        EnvType = ConfigureEnvironmentType.Dev,
                        Name = toolName,
                        Description = $"{toolName} integration (platform tool, seeded from the internal plugin OpenAPI spec).",
                        Type = ComponentTypeEnum.Platform,
                        BaseUrl = baseUrl,
                        OpenApiSpec = spec,
                        ParsedSchema = parsedSchema,
                        AuthenticationType = ToolAuthenticationTypeEnum.Bearer,
                        IsTenantWideAccess = true,
                        IsActive = true,
                        IsVerified = true,
                        CreatedByUserId = platformAdmin.UserId,
                        LastModifiedByUserId = platformAdmin.UserId,
                        CreatedOn = now,
                        LastModifiedOn = now,
                    };
                    await workspaceDbContext.Tools.AddAsync(tool);
                }
                else
                {
                    existing.Name = toolName;
                    existing.Description = $"{toolName} integration (platform tool, seeded from the internal plugin OpenAPI spec).";
                    existing.TenantId = platformAdmin.TenantId;
                    existing.BaseUrl = baseUrl;
                    existing.OpenApiSpec = spec;
                    existing.ParsedSchema = parsedSchema;
                    existing.AuthenticationType = ToolAuthenticationTypeEnum.Bearer;
                    existing.IsTenantWideAccess = true;
                    existing.IsActive = true;
                    existing.IsVerified = true;
                    existing.LastModifiedByUserId = platformAdmin.UserId;
                    existing.LastModifiedOn = now;
                }

                await workspaceDbContext.SaveChangesAsync();

                logger.LogInformation("Seeded platform integration tool {ToolName} ({ToolId}).", toolName, toolId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding Corsair tool from spec {FileName}.", fileName);
            }
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
                    FileType = "markdown",
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
                existingSkillFile.FileType = "markdown";
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

    /// <summary>
    /// Extracts the first server base URL from a flattened OpenAPI spec document.
    /// The Corsair DCP generator embeds the provider base URL in servers[0].url.
    /// Returns <c>null</c> when the spec has no servers array or no URL.
    /// </summary>
    private static string? ExtractServerBaseUrl(System.Text.Json.JsonDocument parsedSchema)
    {
        try
        {
            if (parsedSchema.RootElement.TryGetProperty("servers", out var servers) &&
                servers.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var server in servers.EnumerateArray())
                {
                    if (server.TryGetProperty("url", out var url) &&
                        url.ValueKind == System.Text.Json.JsonValueKind.String &&
                        !string.IsNullOrWhiteSpace(url.GetString()))
                    {
                        return url.GetString();
                    }
                }
            }
        }
        catch
        {
            // ignore malformed servers; caller falls back to a placeholder
        }
        return null;
    }
}