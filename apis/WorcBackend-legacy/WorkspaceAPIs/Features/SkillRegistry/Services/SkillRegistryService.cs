namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing skill registry entries.
/// Handles CRUD operations and business logic for skill management.
/// </summary>
public class SkillRegistryService : ISkillRegistryService
{
    private readonly ILogger<SkillRegistryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IResourceShareService _resourceShareService;

    /// <summary>
    /// Validates skill names using the kebab-case convention: lowercase letters and digits,
    /// hyphen-separated segments, with no leading, trailing, or consecutive hyphens.
    /// </summary>
    private static readonly Regex SkillNameRegex = new(@"^[a-z][a-z0-9]*(-[a-z0-9]+)*$", RegexOptions.Compiled);

    public SkillRegistryService(
        ILogger<SkillRegistryService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IResourceShareService resourceShareService)
    {
        // Extract current user ID from JWT claim; fallback to empty Guid when missing.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _resourceShareService = resourceShareService;
    }

    /// <summary>
    /// Retrieves all skills visible to the current user (personal and shared).
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<SkillDto>>> GetSkillsAsync()
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<IEnumerable<SkillDto>>.Create("Failed to retrieve skills. Please try again", 400);

        try
        {
            // Retrieve IDs and access levels for skills explicitly shared with the current user.
            var resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                _userId,
                ResourceTypeEnum.Skill,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // Load skills owned by the user plus skills shared with them (explicitly or
            // tenant-wide) in a single query, ordered by most recently created.
            var skills = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    (
                        w.CreatedByUserId == _userId ||
                        (w.CreatedByUserId != _userId &&
                            (w.IsTenantWideAccess || resourceAccess.Keys.Contains(w.Id)))
                    )
                )
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ToListAsync();

            // Map retrieved skill entities to DTOs, assigning the effective access level:
            // Owner for own skills, the granted level for shared skills, and View for
            // tenant-wide skills without an explicit share.
            var skillDtoList = skills.Select(skill =>
            {
                var skillDto = skill.Adapt<SkillDto>();
                skillDto.AccessLevel = skill.CreatedByUserId == _userId
                    ? ResourceAccessTypeEnum.Personal
                    : resourceAccess.GetValueOrDefault(skill.Id, ResourceAccessTypeEnum.View);
                return skillDto;
            }).ToList();

            // Attach file counts without loading file content.
            var fileCounts = await GetFileCountsAsync(skills.Select(s => s.Id));
            skillDtoList.ForEach(dto => dto.FileCount = fileCounts.GetValueOrDefault(dto.Id, 0));

            serviceResponse.Update("Skills retrieved successfully", 200, skillDtoList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving skills for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Checks if a skill name is available within the current tenant.
    /// </summary>
    public async Task<ServiceResponse<TrueFalseResultDto>> IsSkillNameAvailableAsync(Guid? skillId, CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<TrueFalseResultDto>.Create("Failed to check skill name availability. Please try again", 400);

        try
        {
            // Normalize DTO string properties before validation.
            checkAvailabilityDto = TrimDtoStringPropsUtil.TrimDtoStringProps(checkAvailabilityDto);

            // Validate that a skill name was provided.
            if (string.IsNullOrWhiteSpace(checkAvailabilityDto.UserInput))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = "Skill name is required to check availability";
                return serviceResponse;
            }

            // Validate that the submitted name follows the kebab-case convention.
            if (!SkillNameRegex.IsMatch(checkAvailabilityDto.UserInput))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = "Skill name must contain lowercase letters, numbers and single hyphens only (e.g. pdf-report-generator)";
                return serviceResponse;
            }

            // Normalize input for case-insensitive comparison.
            var normalizedName = checkAvailabilityDto.UserInput.ToLowerInvariant();

            // Check for duplicate name excluding the current skill during updates, within the current environment.
            var existingSkill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.TenantId== _currentTenantService.CurrentTenantId&&
                    w.Name.ToLower() == normalizedName &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Determine availability based on whether a matching skill exists.
            var isAvailable = existingSkill == null;

            serviceResponse.Update(
                isAvailable ? "Skill name is available" : "Skill name is already in use",
                200,
                new TrueFalseResultDto { Result = isAvailable }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking skill name availability for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Retrieves a skill by its ID if the current user has access.
    /// </summary>
    public async Task<ServiceResponse<SkillDto>> GetSkillByIdAsync(Guid skillId)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<SkillDto>.Create("Failed to retrieve skill. Please try again", 404);

        try
        {
            // Validate the provided skill ID.
            if (skillId == Guid.Empty)
            {
                serviceResponse.Message = "A valid skill ID is required";
                return serviceResponse;
            }

            // Retrieve the skill by ID including its related users and files.
            // Bypass global tenant/space filters so platform/global skills are visible.
            var skill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.Id == skillId &&
                    (w.Type == ComponentTypeEnum.Platform || w.EnvType == _currentTenantService.CurrentEnvType))
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Return when skill does not exist.
            if (skill == null)
            {
                serviceResponse.Message = "Skill not found";
                return serviceResponse;
            }

            // Platform/library skills are read-only and viewable by all users, so they
            // skip the per-user share check.
            var accessLevel = ResourceAccessTypeEnum.View;
            if (skill.Type != ComponentTypeEnum.Platform)
            {
                var (canView, resolvedAccessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    skill.Id,
                    ResourceTypeEnum.Skill,
                    skill.CreatedByUserId,
                    skill.IsTenantWideAccess,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.View,
                    }
                );

                // Return forbidden when user lacks view permission.
                if (!canView)
                {
                    _logger.LogWarning("User {UserId} attempted to access skill {SkillId} without permission.", _userId, skill.Id);
                    serviceResponse.Message = "You do not have permission to view this skill";
                    return serviceResponse;
                }

                accessLevel = resolvedAccessLevel ?? ResourceAccessTypeEnum.View;
            }

            // Map to DTO and set effective access level (Personal for own records).
            var skillDto = skill.Adapt<SkillDto>();
            skillDto.AccessLevel = skill.CreatedByUserId == _userId
                ? ResourceAccessTypeEnum.Personal
                : accessLevel;

            // Attach the file count without loading file content.
            skillDto.FileCount = (await GetFileCountsAsync(new[] { skill.Id })).GetValueOrDefault(skill.Id, 0);

            serviceResponse.Update("Skill retrieved successfully", 200, skillDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving skill {SkillId} for user {UserId}", skillId, _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Retrieves a skill by its name within the current environment and tenant.
    /// </summary>
    public async Task<ServiceResponse<SkillDto>> GetSkillByNameAsync(string skillName)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<SkillDto>.Create("Failed to retrieve skill. Please try again", 404);

        try
        {
            // Validate the provided skill name.
            if (string.IsNullOrWhiteSpace(skillName))
            {
                serviceResponse.Message = "A valid skill name is required";
                return serviceResponse;
            }

            // Normalize input for case-insensitive comparison.
            var normalizedName = skillName.Trim().ToLowerInvariant();

            // Retrieve the skill by name within the current tenant, space, and environment.
            // Bypass global tenant/space filters so platform/global skills are visible.
            var skill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == normalizedName &&
                    (w.Type == ComponentTypeEnum.Platform || w.EnvType == _currentTenantService.CurrentEnvType))
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Return when skill does not exist.
            if (skill == null)
            {
                serviceResponse.Message = "Skill not found";
                return serviceResponse;
            }

            // Platform/library skills are read-only and viewable by all users, so they
            // skip the per-user share check.
            var accessLevel = ResourceAccessTypeEnum.View;
            if (skill.Type != ComponentTypeEnum.Platform)
            {
                var (canView, resolvedAccessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    skill.Id,
                    ResourceTypeEnum.Skill,
                    skill.CreatedByUserId,
                    skill.IsTenantWideAccess,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.View,
                    }
                );

                // Return forbidden when user lacks view permission.
                if (!canView)
                {
                    _logger.LogWarning("User {UserId} attempted to access skill {SkillName} without permission.", _userId, skillName);
                    serviceResponse.Message = "You do not have permission to view this skill";
                    return serviceResponse;
                }

                accessLevel = resolvedAccessLevel ?? ResourceAccessTypeEnum.View;
            }

            // Map to DTO and set effective access level (Personal for own records).
            var skillDto = skill.Adapt<SkillDto>();
            skillDto.AccessLevel = skill.CreatedByUserId == _userId
                ? ResourceAccessTypeEnum.Personal
                : accessLevel;

            // Attach the file count without loading file content.
            skillDto.FileCount = (await GetFileCountsAsync(new[] { skill.Id })).GetValueOrDefault(skill.Id, 0);

            serviceResponse.Update("Skill retrieved successfully", 200, skillDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving skill {SkillName} for user {UserId}", skillName, _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Inserts a new skill.
    /// </summary>
    public async Task<ServiceResponse<SkillDto>> InsertSkillAsync(SkillDto skillDto)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<SkillDto>.Create("Failed to create skill. Please try again", 400);

        try
        {
            // Normalize DTO string properties before validation and persistence.
            skillDto = TrimDtoStringPropsUtil.TrimDtoStringProps(skillDto);

            // Validate that skill name is provided.
            if (string.IsNullOrWhiteSpace(skillDto.Name))
            {
                serviceResponse.Message = "Skill name is required to create a skill";
                return serviceResponse;
            }

            // Validate that the skill name follows the kebab-case convention.
            if (!SkillNameRegex.IsMatch(skillDto.Name))
            {
                serviceResponse.Message = "Skill name must contain lowercase letters, numbers and single hyphens only (e.g. pdf-report-generator)";
                return serviceResponse;
            }

            // Check duplicate name within tenant and current environment to avoid conflicts.
            var existingSkill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == skillDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (existingSkill != null)
            {
                serviceResponse.Message = "A skill with this name already exists";
                return serviceResponse;
            }

            // Map DTO to entity, force custom type, and set audit fields.
            var newSkill = skillDto.Adapt<Skill>();
            newSkill.Type = ComponentTypeEnum.Custom;
            newSkill.EnvType = _currentTenantService.CurrentEnvType;
            newSkill.CreatedByUserId = _userId;
            newSkill.LastModifiedByUserId = _userId;


            // Persist new skill.
            await _unitOfWork.SkillRepo.InsertAsync(newSkill);
            await _unitOfWork.SaveAsync();

            // Assign creator as resource owner.
            if (!await _resourceShareService.AssignOwnerAsync(_userId, newSkill.Id, ResourceTypeEnum.Skill))
            {
                _logger.LogWarning("Failed assigning owner access for skill {SkillId}", newSkill.Id);
                return serviceResponse;
            }

            // Map persisted entity to DTO.
            var resultDto = newSkill.Adapt<SkillDto>();

            // Load creator username for the response.
            var createdByUser = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(u => u.Id == _userId)
                .FirstOrDefaultAsync();
            resultDto.CreatedBy = createdByUser?.UserName;

            // Set ownership access level (Personal: created by the caller).
            resultDto.AccessLevel = ResourceAccessTypeEnum.Personal;

            serviceResponse.Update("Skill created successfully", 201, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inserting skill for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Updates an existing skill.
    /// </summary>
    public async Task<ServiceResponse<SkillDto>> UpdateSkillAsync(SkillDto skillDto)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<SkillDto>.Create("Failed to update skill. Please try again", 400);

        try
        {
            // Normalize DTO string properties before validation and persistence.
            skillDto = TrimDtoStringPropsUtil.TrimDtoStringProps(skillDto);

            // Validate that skill ID is provided.
            if (skillDto.Id == Guid.Empty)
            {
                serviceResponse.Message = "A valid skill ID is required to update a skill";
                return serviceResponse;
            }

            // Validate that skill name is provided.
            if (string.IsNullOrWhiteSpace(skillDto.Name))
            {
                serviceResponse.Message = "Skill name is required to update a skill";
                return serviceResponse;
            }

            // Retrieve the existing skill for update.
            var existingSkill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w => w.Id == skillDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            // Return when skill is missing.
            if (existingSkill == null)
            {
                serviceResponse.Message = "Skill not found";
                return serviceResponse;
            }

            // Verify user has edit or owner permission.
            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                existingSkill.Id,
                ResourceTypeEnum.Skill,
                existingSkill.CreatedByUserId,
                existingSkill.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // Return forbidden when user lacks update permission.
            if (!canEdit)
            {
                _logger.LogWarning("User {UserId} attempted unauthorized skill update {SkillId}", _userId, existingSkill.Id);
                serviceResponse.Message = "You do not have access to update this skill";
                return serviceResponse;
            }

            // Reject any attempt to rename an existing skill; names are immutable after creation.
            if (!string.Equals(existingSkill.Name, skillDto.Name, StringComparison.Ordinal))
            {
                serviceResponse.Message = "Skill name cannot be changed after creation";
                return serviceResponse;
            }

            if (existingSkill.Description != skillDto.Description)
            {
                existingSkill.Description = skillDto.Description;
            }

            if (existingSkill.IsTenantWideAccess != skillDto.IsTenantWideAccess)
            {
                existingSkill.IsTenantWideAccess = skillDto.IsTenantWideAccess;
            }

            if (existingSkill.IsActive != skillDto.IsActive)
            {
                existingSkill.IsActive = skillDto.IsActive;
            }

            if (skillDto.IsDisabled.HasValue && existingSkill.IsDisabled != skillDto.IsDisabled.Value)
            {
                existingSkill.IsDisabled = skillDto.IsDisabled.Value;
            }

            // Update audit metadata.
            existingSkill.LastModifiedByUserId = _userId;
            existingSkill.LastModifiedOn = DateTimeOffset.UtcNow;

            // Persist changes.
            _unitOfWork.SkillRepo.Update(existingSkill);
            await _unitOfWork.SaveAsync();

            // Map updated entity to DTO.
            var resultDto = existingSkill.Adapt<SkillDto>();

            // Load last modifier username for the response.
            var lastModifiedUser = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(u => u.Id == existingSkill.LastModifiedByUserId)
                .FirstOrDefaultAsync();
            resultDto.LastModifiedBy = lastModifiedUser?.UserName;

            // Determine access level based on ownership.
            resultDto.AccessLevel = existingSkill.CreatedByUserId == _userId
                ? ResourceAccessTypeEnum.Personal
                : ResourceAccessTypeEnum.Edit;

            serviceResponse.Update("Skill updated successfully", 200, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating skill for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Deletes a skill by its ID.
    /// </summary>
    public async Task<ServiceResponse<bool>> DeleteSkillAsync(Guid skillId)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete skill. Please try again", 400, false);

        try
        {
            // Validate the provided skill ID.
            if (skillId == Guid.Empty)
            {
                serviceResponse.Message = "A valid skill ID is required to delete a skill";
                return serviceResponse;
            }

            // Retrieve the skill for deletion.
            var skill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w => w.Id == skillId && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            // Return 404 when skill does not exist.
            if (skill == null)
            {
                serviceResponse.Message = "Skill not found";
                return serviceResponse;
            }

            // PROD-guard: block deletion of PROD skills or skills with a same-name PROD twin.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.SkillRepo,
                skill.EnvType,
                skill.Name,
                w => w.Name.ToLower() == skill.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == skill.TenantId &&
                     w.SpaceId == skill.SpaceId,
                "skill");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            // Verify owner permission for deletion.
            var (canDelete, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                skill.Id,
                ResourceTypeEnum.Skill,
                skill.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            // Return forbidden when user lacks delete permission.
            if (!canDelete)
            {
                _logger.LogWarning("User {UserId} attempted unauthorized skill deletion {SkillId}", _userId, skill.Id);
                serviceResponse.Message = "You do not have access to delete this skill";
                return serviceResponse;
            }

            // Remove resource shares before deleting the skill.
            await _resourceShareService.DeleteResourceSharesAsync(skill.Id, ResourceTypeEnum.Skill);

            // Delete skill and save changes.
            _unitOfWork.SkillRepo.Delete(skill);
            await _unitOfWork.SaveAsync();

            serviceResponse.Update("Skill deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting skill {SkillId} for user {UserId}", skillId, _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Deletes multiple skills by their IDs.
    /// </summary>
    public async Task<ServiceResponse<bool>> DeleteSkillsAsync(List<Guid> skillIds)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete skills. Please try again", 400, false);

        try
        {
            // Validate the input list.
            if (skillIds == null || skillIds.Count == 0)
            {
                serviceResponse.Message = "No skills specified for deletion";
                return serviceResponse;
            }

            // Filter out empty GUIDs and remove duplicates.
            var requestedIds = skillIds
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            // Return error if no valid IDs remain.
            if (requestedIds.Count == 0)
            {
                serviceResponse.Message = "No valid skill IDs were provided";
                return serviceResponse;
            }

            // Load all requested skills from the database.
            var allMatchedSkills = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w => requestedIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            // Ensure every requested ID matches an existing skill.
            if (allMatchedSkills.Count != requestedIds.Count)
            {
                serviceResponse.Message = "One or more skills were not found";
                return serviceResponse;
            }

            // Validate owner access + PROD-guard for every skill before deletion.
            var blockedNames = new List<string>();
            foreach (var skill in allMatchedSkills)
            {
                var (canDelete, _) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    skill.Id,
                    ResourceTypeEnum.Skill,
                    skill.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                    }
                );

                // Return forbidden if any skill cannot be deleted by the user.
                if (!canDelete)
                {
                    _logger.LogWarning("User {UserId} attempted unauthorized bulk skill deletion", _userId);
                    serviceResponse.Message = "You do not have access to delete one or more skills";
                    return serviceResponse;
                }

                // PROD-guard: block the whole batch if any skill is PROD or has a same-name PROD twin.
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.SkillRepo,
                    skill.EnvType,
                    skill.Name,
                    w => w.Name.ToLower() == skill.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == skill.TenantId &&
                         w.SpaceId == skill.SpaceId,
                    "skill");
                if (guardBlock != null)
                {
                    blockedNames.Add(skill.Name);
                }
            }

            // Reject the entire batch when any selected skill is protected by the PROD guard.
            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following skill(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            // Remove all associated resource shares for the skills.
            await _resourceShareService.DeleteResourceSharesAsync(requestedIds, ResourceTypeEnum.Skill);

            // Delete each skill from the repository.
            foreach (var skill in allMatchedSkills)
            {
                _unitOfWork.SkillRepo.Delete(skill);
            }

            // Persist deletions.
            await _unitOfWork.SaveAsync();

            serviceResponse.Update($"{allMatchedSkills.Count} skill(s) deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting multiple skills for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Retrieves all skills accessible to the current user for desktop sync.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<SkillSyncDto>>> GetSkillsForSyncAsync()
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<IEnumerable<SkillSyncDto>>.Create("Failed to retrieve skills for sync. Please try again", 400);

        try
        {
            // Validate input identifiers.
            if (_currentTenantService.CurrentTenantId == Guid.Empty)
            {
                serviceResponse.Message = "A valid tenant ID is required";
                return serviceResponse;
            }

            if (_currentTenantService.CurrentUserId == Guid.Empty)
            {
                serviceResponse.Message = "A valid user ID is required";
                return serviceResponse;
            }

            // Shares granted to the target user, folded into the skill query as an EXISTS
            // subquery so personal + shared skills are read in a single database round trip.
            var sharedShares = _unitOfWork.ResourceShareRepo.GetByConditionAsync(rs =>
                rs.UserId == _currentTenantService.CurrentUserId &&
                rs.ResourceType == ResourceTypeEnum.Skill &&
                (
                    rs.AccessLevel == ResourceAccessTypeEnum.Owner ||
                    rs.AccessLevel == ResourceAccessTypeEnum.View ||
                    rs.AccessLevel == ResourceAccessTypeEnum.Edit
                ));

            // Load skills within the tenant that are global, tenant-wide, explicitly shared, or owned by the user.
            var skills = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    (
                        w.CreatedByUserId == _currentTenantService.CurrentUserId ||
                        w.IsTenantWideAccess ||
                        sharedShares.Any(rs => rs.ResourceId == w.Id)
                    )
                )
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.Files)
                .ThenInclude(i2 => i2.CreatedByUser)
                .ToListAsync();

            // Project entities to sync DTOs preserving full file content.
            var syncDtoList = skills.Select(skill => new SkillSyncDto
            {
                Name = skill.Name,
                Description = skill.Description,
                Files = skill.Files?.Select(file => new SkillFileDto
                {
                    Id = file.Id,
                    SkillId = file.SkillId,
                    FileName = file.FileName,
                    Content = file.Content,
                    FileType = file.FileType,
                    CreatedBy = file.CreatedByUser != null
                        ? file.CreatedByUser.FirstName + " " + file.CreatedByUser.LastName
                        : null,
                    CreatedOn = file.CreatedOn,
                }).ToList() ?? new List<SkillFileDto>(),
            }).ToList();

            serviceResponse.Update("Skills retrieved for sync successfully", 200, syncDtoList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving skills for sync for tenant {TenantId} and user {UserId}", _currentTenantService.CurrentTenantId, _currentTenantService.CurrentUserId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Retrieves all platform (library) skills available to the current tenant.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<SkillDto>>> GetLibrarySkillsAsync()
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<IEnumerable<SkillDto>>.Create("Failed to retrieve library skills. Please try again", 400);

        try
        {
            // Load platform-managed skills for the current tenant.
            var librarySkills = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w => w.Type == ComponentTypeEnum.Platform)
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .IgnoreQueryFilters()
                .ToListAsync();

            // Map entities to DTOs and attach file counts without loading file content.
            var skillDtoList = librarySkills.Adapt<List<SkillDto>>();
            skillDtoList.ForEach(fe => fe.AccessLevel = ResourceAccessTypeEnum.View);

            var libraryFileCounts = await GetFileCountsAsync(librarySkills.Select(s => s.Id));
            skillDtoList.ForEach(dto => dto.FileCount = libraryFileCounts.GetValueOrDefault(dto.Id, 0));

            serviceResponse.Update("Library skills retrieved successfully", 200, skillDtoList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving library skills for tenant {TenantId}", _currentTenantService.CurrentTenantId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Retrieves skills accessible to the current user in selectable option format.
    /// Includes personal, shared, and platform (library) skills that are active and not disabled.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableSkillOptionsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to retrieve skill options. Please try again"
        };

        try
        {
            // Shares granted to the current user, folded into the skill query as an EXISTS
            // subquery so personal + shared skills are read in a single database round trip.
            var sharedShares = _unitOfWork.ResourceShareRepo.GetByConditionAsync(rs =>
                rs.UserId == _userId &&
                rs.ResourceType == ResourceTypeEnum.Skill &&
                (
                    rs.AccessLevel == ResourceAccessTypeEnum.Owner ||
                    rs.AccessLevel == ResourceAccessTypeEnum.View ||
                    rs.AccessLevel == ResourceAccessTypeEnum.Edit
                ));

            // Platform/library skills are environment-agnostic (read-only, no EnvType),
            // so they are matched regardless of the current environment.
            var options = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.IsDisabled == false &&
                    w.IsActive &&
                    (
                        w.Type == ComponentTypeEnum.Platform ||
                        (
                            w.EnvType == _currentTenantService.CurrentEnvType &&
                            (
                                w.CreatedByUserId == _userId ||
                                w.IsTenantWideAccess ||
                                sharedShares.Any(rs => rs.ResourceId == w.Id)
                            )
                        )
                    )
                )
                .OrderBy(s => s.Name)
                .Select(s => new SelectOption
                {
                    Value = s.Name,
                    Label = s.Name,
                    Description = s.Description,
                })
                .ToListAsync();

            serviceResponse.Data = options;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Skill options retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving skill options for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Counts files per skill without materialising file content.
    /// </summary>
    private async Task<Dictionary<Guid, int>> GetFileCountsAsync(IEnumerable<Guid> skillIds)
    {
        // Avoid a query for an empty set.
        var ids = skillIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return new Dictionary<Guid, int>();
        }

        // Single grouped count; never selects the Content column.
        return await _unitOfWork.SkillFileRepo
            .GetByConditionAsync(f => ids.Contains(f.SkillId))
            .GroupBy(f => f.SkillId)
            .Select(g => new { SkillId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.SkillId, x => x.Count);
    }
}
