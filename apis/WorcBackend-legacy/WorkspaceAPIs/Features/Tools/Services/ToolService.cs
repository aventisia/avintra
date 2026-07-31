using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Services;

public class ToolService : IToolService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ToolService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IResourceShareService _resourceShareService;
    private readonly IAppSecretService _appSecretService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _currentUserId;

    public ToolService(
        IUnitOfWork unitOfWork,
        ILogger<ToolService> logger,
        IHttpContextAccessor httpContextAccessor,
        IResourceShareService resourceShareService,
        IAppSecretService appSecretService,
        IHttpClientFactory httpClientFactory,
        EnvironmentConfig environmentConfig)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _resourceShareService = resourceShareService;
        _appSecretService = appSecretService;
        _httpClientFactory = httpClientFactory;
        _environmentConfig = environmentConfig;
        _currentUserId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves list of tools based on ownership scope.
    public async Task<ServiceResponse<IEnumerable<ToolDto>>> GetToolsAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ToolDto>>
        {
            Message = "Failed to fetch tools."
        };

        try
        {
            List<Tool> toolList;
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccessMap = new();

            if (isPersonal)
            {
                // Fetch tools owned by the current user.
                toolList = await _unitOfWork.ToolRepo
                    .GetByConditionAsync(tool => tool.CreatedByUserId == _currentUserId)
                    .OrderByDescending(tool => tool.CreatedOn)
                    .Include(tool => tool.CreatedByUser)
                    .Include(tool => tool.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                // Resolve shared resource access for the current user.
                resourceAccessMap = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _currentUserId,
                    ResourceTypeEnum.Tool,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    });

                // Fetch shared and tenant-wide tools not owned by the current user.
                toolList = await _unitOfWork.ToolRepo
                    .GetByConditionAsync(tool =>
                        tool.CreatedByUserId != _currentUserId &&
                        (tool.IsTenantWideAccess || resourceAccessMap.Keys.Contains(tool.Id)))
                    .OrderByDescending(tool => tool.CreatedOn)
                    .Include(tool => tool.CreatedByUser)
                    .Include(tool => tool.LastModifiedByUser)
                    .ToListAsync();
            }

            // Map entities to DTOs and assign effective access level.
            var mappedTools = toolList.Adapt<IEnumerable<ToolDto>>().ToList();
            mappedTools.ForEach(toolDto =>
            {
                toolDto.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccessMap.GetValueOrDefault(toolDto.Id, ResourceAccessTypeEnum.View);
            });

            return serviceResponse.Update(
                "Tools retrieved successfully.",
                200,
                mappedTools);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tools.");
        }

        return serviceResponse;
    }

    // Checks whether a tool name is available for use.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsToolNameAvailableAsync(CheckAvailabilityDto availabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Message = "Failed to check tool name availability."
        };

        try
        {
            // Validate and normalize the provided tool name.
            var normalizedName = availabilityDto.UserInput?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
            {
                return serviceResponse.Update(
                    "Tool name cannot be empty.",
                    200,
                    new TrueFalseResultDto { Result = false });
            }

            // Search for an existing tool with the same name (case-insensitive).
            var existingToolWithSameName = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool =>
                    tool.Name.ToLower() == normalizedName.ToLower())
                .SingleOrDefaultAsync();

            if (existingToolWithSameName != null)
            {
                return serviceResponse.Update(
                    $"Tool name '{normalizedName}' already exists.",
                    200,
                    new TrueFalseResultDto { Result = false });
            }

            return serviceResponse.Update(
                $"Tool name '{normalizedName}' is available.",
                200,
                new TrueFalseResultDto { Result = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check tool name availability.");
        }

        return serviceResponse;
    }

    // Retrieves a tool by its ID.
    public async Task<ServiceResponse<ToolDto>> GetToolByIdAsync(Guid toolId)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to fetch tool."
        };

        try
        {
            // Fetch the requested tool.
            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => tool.Id == toolId)
                .Include(tool => tool.CreatedByUser)
                .SingleOrDefaultAsync();

            if (tool == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user can view the tool.
            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId,
                tool.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
            {
                return serviceResponse.Update("You do not have permission to view this tool.", 403);
            }

            return serviceResponse.Update(
                "Tool retrieved successfully.",
                200,
                tool.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tool with ID {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    // Inserts a new tool.
    public async Task<ServiceResponse<ToolDto>> InsertToolAsync(ToolDto toolDto)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to create tool."
        };

        try
        {
            // Normalize string properties to avoid case-sensitivity issues.
            toolDto = TrimDtoStringPropsUtil.TrimDtoStringProps(toolDto);

            // Ensure the tool name is unique.
            var toolWithSameName = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => tool.Name.ToLower() == toolDto.Name.ToLower())
                .SingleOrDefaultAsync();

            if (toolWithSameName != null)
            {
                return serviceResponse.Update($"Tool '{toolDto.Name}' already exists.", 409);
            }

            // Map DTO to entity, force custom type, and set audit fields.
            var toolToCreate = toolDto.Adapt<Tool>();
            toolToCreate.Type = ComponentTypeEnum.Custom;
            toolToCreate.CreatedByUserId = _currentUserId;
            toolToCreate.LastModifiedByUserId = _currentUserId;

            // Parse OpenAPI spec into an LLM-friendly schema when provided.
            if (!string.IsNullOrWhiteSpace(toolDto.OpenApiSpec))
            {
                toolToCreate.ParsedSchema = OpenApiSpecHelpers.FlattenOpenApiSpec(toolDto.OpenApiSpec);
            }

            // Persist the new tool.
            await _unitOfWork.ToolRepo.InsertAsync(toolToCreate);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save new tool '{ToolName}'.", toolDto.Name);
                return serviceResponse;
            }

            // Assign ownership for resource sharing.
            if (!await _resourceShareService.AssignOwnerAsync(_currentUserId, toolToCreate.Id, ResourceTypeEnum.Tool))
            {
                _logger.LogError("Failed to assign ownership for tool {ToolId}.", toolToCreate.Id);
                return serviceResponse.Update("Failed assigning ownership.", 500);
            }

            return serviceResponse.Update(
                "Tool created successfully.",
                200,
                toolToCreate.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create tool '{ToolName}'.", toolDto.Name);
        }

        return serviceResponse;
    }

    // Updates an existing tool.
    public async Task<ServiceResponse<ToolDto>> UpdateToolAsync(ToolDto toolDto)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to update tool."
        };

        try
        {
            // Normalize string properties.
            toolDto = TrimDtoStringPropsUtil.TrimDtoStringProps(toolDto);

            // Fetch the existing tool.
            var toolToUpdate = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => tool.Id == toolDto.Id)
                .SingleOrDefaultAsync();

            if (toolToUpdate == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user can edit the tool.
            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                toolToUpdate.Id,
                ResourceTypeEnum.Tool,
                toolToUpdate.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canEdit)
            {
                return serviceResponse.Update("You do not have access to update this tool.", 403);
            }

            // Ensure no other tool uses the requested name.
            var otherToolWithSameName = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => tool.Name.ToLower() == toolDto.Name.ToLower() && tool.Id != toolDto.Id)
                .SingleOrDefaultAsync();

            if (otherToolWithSameName != null)
            {
                return serviceResponse.Update($"Tool '{toolDto.Name}' already exists.", 409);
            }

            // Apply scalar updates.
            toolToUpdate.Name = toolDto.Name;
            toolToUpdate.Description = toolDto.Description;
            toolToUpdate.BaseUrl = toolDto.BaseUrl;
            toolToUpdate.AuthenticationType = toolDto.AuthenticationType;
            toolToUpdate.CredentialId = toolDto.CredentialId;
            toolToUpdate.IsTenantWideAccess = toolDto.IsTenantWideAccess;
            toolToUpdate.LastModifiedByUserId = _currentUserId;

            if (toolDto.IsDisabled.HasValue)
            {
                toolToUpdate.IsDisabled = toolDto.IsDisabled.Value;
            }

            // Re-parse OpenAPI spec when it changes.
            if (!string.IsNullOrWhiteSpace(toolDto.OpenApiSpec) && toolToUpdate.OpenApiSpec != toolDto.OpenApiSpec)
            {
                toolToUpdate.OpenApiSpec = toolDto.OpenApiSpec;
                toolToUpdate.ParsedSchema = OpenApiSpecHelpers.FlattenOpenApiSpec(toolDto.OpenApiSpec);
            }

            // Persist changes.
            _unitOfWork.ToolRepo.Update(toolToUpdate);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated tool {ToolId}.", toolDto.Id);
                return serviceResponse;
            }

            return serviceResponse.Update(
                "Tool updated successfully.",
                200,
                toolToUpdate.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update tool {ToolId}.", toolDto.Id);
        }

        return serviceResponse;
    }

    // Deletes an existing tool.
    public async Task<ServiceResponse<bool>> DeleteToolAsync(Guid toolId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tool."
        };

        try
        {
            // Fetch the tool to delete.
            var toolToDelete = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => tool.Id == toolId)
                .SingleOrDefaultAsync();

            if (toolToDelete == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user is the owner.
            var (canDelete, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                toolToDelete.Id,
                ResourceTypeEnum.Tool,
                toolToDelete.CreatedByUserId,
                false,
                new[] { ResourceAccessTypeEnum.Owner });

            if (!canDelete)
            {
                return serviceResponse.Update("You do not have access to delete this tool.", 403);
            }

            // Remove related resource shares and delete the tool.
            await _resourceShareService.DeleteResourceSharesAsync(toolToDelete.Id, ResourceTypeEnum.Tool);
            _unitOfWork.ToolRepo.Delete(toolToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete tool {ToolId}.", toolId);
                return serviceResponse;
            }

            return serviceResponse.Update("Tool deleted successfully.", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete tool {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    // Deletes multiple tools by their IDs.
    public async Task<ServiceResponse<bool>> DeleteToolsAsync(List<Guid> toolIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tools."
        };

        try
        {
            // Fetch all tools matching the provided identifiers.
            var toolsToDelete = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => toolIds.Contains(tool.Id))
                .ToListAsync();

            if (toolsToDelete.Count == 0)
            {
                return serviceResponse.Update("No tools found to delete.", 404);
            }

            // Verify ownership for every selected tool.
            foreach (var tool in toolsToDelete)
            {
                var (canDelete, _) = await _resourceShareService.GetResourceAccessAsync(
                    _currentUserId,
                    tool.Id,
                    ResourceTypeEnum.Tool,
                    tool.CreatedByUserId,
                    false,
                    new[] { ResourceAccessTypeEnum.Owner });

                if (!canDelete)
                {
                    return serviceResponse.Update("You do not have access to delete one or more selected tools.", 403);
                }
            }

            // Remove related resource shares and delete the tools.
            await _resourceShareService.DeleteResourceSharesAsync(toolIds, ResourceTypeEnum.Tool);
            _unitOfWork.ToolRepo.Delete(toolsToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete {Count} tools.", toolsToDelete.Count);
                return serviceResponse;
            }

            return serviceResponse.Update(
                $"{toolsToDelete.Count} tool(s) deleted successfully.",
                200,
                true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete multiple tools.");
        }

        return serviceResponse;
    }

    // Tests a tool by executing the specified operation.
    public async Task<ServiceResponse<TestToolResponseDto>> TestToolAsync(Guid toolId, TestToolDto testToolDto)
    {
        var serviceResponse = new ServiceResponse<TestToolResponseDto>
        {
            Message = "Failed to test tool."
        };

        try
        {
            // Fetch the tool to test.
            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => tool.Id == toolId)
                .SingleOrDefaultAsync();

            if (tool == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user can test the tool.
            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId,
                tool.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
            {
                return serviceResponse.Update("You do not have permission to test this tool.", 403);
            }

            // Resolve the API key from the credential override or the tool default.
            var credentialId = testToolDto.CredentialId ?? tool.CredentialId;
            var apiKey = await ResolveApiKeyAsync(credentialId);

            // Build the test payload for the LLM pipeline.
            var testPayload = new
            {
                baseUrl = tool.BaseUrl,
                operationId = testToolDto.OperationId,
                parameters = testToolDto.Parameters,
                authenticationType = tool.AuthenticationType?.ToString(),
                apiKey,
                openApiSpec = tool.OpenApiSpec,
            };

            var requestJson = System.Text.Json.JsonSerializer.Serialize(testPayload);
            var requestContent = new StringContent(requestJson, Encoding.UTF8);

            // Execute the test request and capture timing.
            var llmPipelineClient = _httpClientFactory.CreateClient();
            llmPipelineClient.Timeout = TimeSpan.FromSeconds(30);

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var llmResponse = await llmPipelineClient.PostAsync(
                $"{_environmentConfig.LlmPipelineApiBaseUrl}/api/custom-tools/test",
                requestContent);
            stopwatch.Stop();

            var responseBody = await llmResponse.Content.ReadAsStringAsync();

            var testResult = new TestToolResponseDto
            {
                Success = llmResponse.IsSuccessStatusCode,
                StatusCode = (int)llmResponse.StatusCode,
                Body = responseBody,
                DurationMs = stopwatch.Elapsed.TotalMilliseconds,
            };

            // Mark the tool as verified when the test succeeds.
            if (testResult.Success)
            {
                tool.IsVerified = true;
                _unitOfWork.ToolRepo.Update(tool);
                await _unitOfWork.SaveAsync();
            }

            return serviceResponse.Update(
                testResult.Success ? "Tool test completed successfully." : "Tool test failed.",
                200,
                testResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test tool {ToolId}.", toolId);
            serviceResponse.Data = new TestToolResponseDto
            {
                Success = false,
                Body = $"Exception: {ex.Message}",
            };
        }

        return serviceResponse;
    }

    // Activates a tool for use in flows.
    public async Task<ServiceResponse<ToolDto>> ActivateToolAsync(Guid toolId)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to activate tool."
        };

        try
        {
            // Fetch the tool to activate.
            var toolToActivate = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => tool.Id == toolId)
                .SingleOrDefaultAsync();

            if (toolToActivate == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user can edit the tool.
            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                toolToActivate.Id,
                ResourceTypeEnum.Tool,
                toolToActivate.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canEdit)
            {
                return serviceResponse.Update("You do not have access to activate this tool.", 403);
            }

            // Activation requires a prior successful playground test.
            if (!toolToActivate.IsVerified)
            {
                return serviceResponse.Update("Tool must pass the playground test before activation.", 400);
            }

            // Activate the tool and record the modifier.
            toolToActivate.IsActive = true;
            toolToActivate.LastModifiedByUserId = _currentUserId;
            _unitOfWork.ToolRepo.Update(toolToActivate);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to activate tool {ToolId}.", toolId);
                return serviceResponse;
            }

            return serviceResponse.Update(
                "Tool activated successfully.",
                200,
                toolToActivate.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to activate tool {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    // Retrieves all platform (library) tools available to the current tenant.
    public async Task<ServiceResponse<IEnumerable<ToolDto>>> GetLibraryToolsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ToolDto>>
        {
            Message = "Failed to fetch library tools."
        };

        try
        {
            // Step 1: Load platform-managed tools.
            var libraryTools = await _unitOfWork.ToolRepo
                .GetByConditionAsync(tool => tool.Type == ComponentTypeEnum.Platform)
                .OrderByDescending(tool => tool.CreatedOn)
                .Include(tool => tool.CreatedByUser)
                .Include(tool => tool.LastModifiedByUser)
                .ToListAsync();

            // Step 2: Map to DTOs and assign view access.
            var mappedTools = libraryTools.Adapt<IEnumerable<ToolDto>>().ToList();
            mappedTools.ForEach(toolDto => toolDto.AccessLevel = ResourceAccessTypeEnum.View);

            return serviceResponse.Update(
                "Library tools retrieved successfully.",
                200,
                mappedTools);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch library tools.");
        }

        return serviceResponse;
    }

    // Resolves and decrypts the API key from the specified credential.
    private async Task<string?> ResolveApiKeyAsync(Guid? credentialId)
    {
        if (!credentialId.HasValue)
        {
            return null;
        }

        // Fetch and decrypt the credential.
        var credentialResult = await _appSecretService.GetAppSecretDetailAsync(credentialId.Value);
        if (credentialResult.StatusCode != 200 || credentialResult.Data is null)
        {
            return null;
        }

        // Extract the API key from decrypted credential data.
        var credentialJson = System.Text.Json.JsonSerializer.Serialize(credentialResult.Data.Data);
        using var credentialDocument = JsonDocument.Parse(credentialJson);

        if (credentialDocument.RootElement.TryGetProperty("ApiKey", out var apiKeyElement))
        {
            return apiKeyElement.GetString();
        }

        return null;
    }
}
