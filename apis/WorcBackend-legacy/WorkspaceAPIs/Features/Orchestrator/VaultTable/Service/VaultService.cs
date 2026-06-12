namespace WorkspaceAPIs.Services;

public class VaultService : IVaultService
{
    private readonly ILogger<VaultService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly IResourceShareService _resourceShareService;

    public VaultService(
        ILogger<VaultService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IStringEncryptionService stringEncryptionService,
        IResourceShareService resourceShareService)
    {
        // Extract the user ID from the HTTP context, default to Guid.Empty if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _stringEncryptionService = stringEncryptionService;
        _resourceShareService = resourceShareService;
    }

    // Method to check if the vault name is available for the current user
    public async Task<ServiceResponse<TrueFalseResultDto>> IsVaultNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check vault name availability. Please try again."
        };

        try
        {
            // Check if a vault with the same name already exists for the current user
            var existingVault = await _unitOfWork.VaultRepo
                .GetByConditionAsync(w =>
                    w.CreatedByUserId == _userId &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a message indicating it's unavailable
            if (existingVault != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A vault with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // If no conflict is found, the name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Vault name is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to retrieve all vaults created by the current user
    public async Task<ServiceResponse<IEnumerable<VaultDto>>> GetVaultsAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<VaultDto>>
        {
            Data = null,
            Message = "Failed to retrieve vaults. Please try again."
        };

        try
        {
            List<Vault> vaults = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            // Return only vaults owned by current user
            if (isPersonal)
            {
                vaults = await _unitOfWork.VaultRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId == _userId)
                    .OrderByDescending(w => w.CreatedOn)
                    .ToListAsync();
            }
            else
            {
                // Retrieve accessible vault IDs with their permissions
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.Vault,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.Delete
                    }
                );

                // Retrieve tenant-wide or explicitly shared vaults
                vaults = await _unitOfWork.VaultRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        (
                            w.IsTenantWideAccess ||
                            resourceAccess.Keys.Contains(w.Id)
                        )
                    )
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .OrderByDescending(o => o.CreatedOn)
                    .ToListAsync();
            }

            // Map to DTOs
            var vaultDtoList = vaults.Adapt<List<VaultDto>>();

            // Assign access levels:
            // - Personal vaults are always owned by the current user.
            // - Shared/tenant-wide vaults use granted permissions, defaulting to View.
            vaultDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            serviceResponse.Data = vaultDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Vaults retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to retrieve a specific vault by its ID for the current user
    public async Task<ServiceResponse<VaultDto>> GetVaultByIdAsync(Guid vaultId)
    {
        var serviceResponse = new ServiceResponse<VaultDto>
        {
            Data = null,
            Message = "Failed to retrieve the vault. Please try again."
        };

        try
        {
            // Fetch the vault by ID, ensuring it's created by the current user
            var vault = await _unitOfWork.VaultRepo
                .GetByConditionAsync(w => w.Id == vaultId)
                .SingleOrDefaultAsync();

            // Validate vault exists
            if (vault == null)
            {
                _logger.LogInformation("Vault not found.");
                serviceResponse.Message = "Vault not found.";
                return serviceResponse;
            }

            // Validate access permission
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                vault.Id,
                ResourceTypeEnum.Vault,
                vault.CreatedByUserId,
                vault.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.Delete,
                }
            );

            // Reject unauthorized access
            if (!canView)
            {
                _logger.LogWarning("User {UserId} attempted unauthorized vault access.", _userId);
                serviceResponse.Message = "You do not have access to view this vault.";
                return serviceResponse;
            }

            // Convert entity into DTO response
            serviceResponse.Data = vault.Adapt<VaultDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Vault retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to insert a new vault for the current user
    public async Task<ServiceResponse<VaultDto>> InsertVaultAsync(VaultDto vaultDto)
    {
        var serviceResponse = new ServiceResponse<VaultDto>
        {
            Data = null,
            Message = "Failed to add the vault. Please try again."
        };

        try
        {
            // Check if a vault with the same name already exists for the user
            var existingVault = await _unitOfWork.VaultRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == vaultDto.Name.ToLower() &&
                    w.CreatedByUserId == _userId)
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a conflict response
            if (existingVault != null)
            {
                _logger.LogInformation("Vault already exists.");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A vault with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO for consistency
            vaultDto = TrimDtoStringPropsUtil.TrimDtoStringProps(vaultDto);

            // Map DTO to entity and set user-related properties
            var newVault = vaultDto.Adapt<Vault>();
            newVault.CreatedByUserId = _userId;
            newVault.LastModifiedByUserId = _userId;

            // Encrypt the credential values (username and password) before saving them
            newVault.Username = _stringEncryptionService.EncryptString(newVault.Username);
            newVault.Password = _stringEncryptionService.EncryptString(newVault.Password);

            // Insert the new vault into the repository
            await _unitOfWork.VaultRepo.InsertAsync(newVault);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new vault.");
                return serviceResponse;
            }

            // Assign creator owner access
            if (!await _resourceShareService.AssignOwnerAsync(
                _userId,
                newVault.Id,
                ResourceTypeEnum.Vault))
            {
                serviceResponse.Message = "Failed assigning ownership.";
                return serviceResponse;
            }

            // Return the created vault in the response
            serviceResponse.Data = newVault.Adapt<VaultDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Vault created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to update an existing vault for the current user
    public async Task<ServiceResponse<VaultDto>> UpdateVaultAsync(VaultDto vaultDto)
    {
        var serviceResponse = new ServiceResponse<VaultDto>
        {
            Data = null,
            Message = "Failed to update the vault. Please try again."
        };

        try
        {
            // Fetch the existing vault
            var vault = await _unitOfWork.VaultRepo
                .GetByConditionAsync(w => w.Id == vaultDto.Id)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (vault == null)
            {
                _logger.LogInformation("Vault does not exist.");
                serviceResponse.Message = "Vault does not exist.";
                return serviceResponse;
            }

            // Validate update access
            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                vault.Id,
                ResourceTypeEnum.Vault,
                vault.CreatedByUserId,
                vault.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                serviceResponse.Message = "You do not have access to update this vault.";
                return serviceResponse;
            }

            // Check if another vault with the same name exists
            var existingVault = await _unitOfWork.VaultRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == vaultDto.Name.ToLower() &&
                    w.CreatedByUserId == vault.CreatedByUserId &&
                    w.Id != vaultDto.Id)
                .FirstOrDefaultAsync();

            // If a conflict is found, return a conflict response
            if (existingVault != null)
            {
                _logger.LogInformation("Vault name already exists.");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A vault with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO for consistency
            vaultDto = TrimDtoStringPropsUtil.TrimDtoStringProps(vaultDto);

            // Check if the username or password in the vault has changed compared to the DTO
            if (vault.Username != vaultDto.Username || vault.Password != vaultDto.Password)
            {
                // Encrypt the username and password before saving them to ensure security
                vaultDto.Username = _stringEncryptionService.EncryptString(vaultDto.Username);
                vaultDto.Password = _stringEncryptionService.EncryptString(vaultDto.Password);
            }

            vaultDto.Adapt(vault);

            // Update the vault in the repository
            _unitOfWork.VaultRepo.Update(vault);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating vault.");
                return serviceResponse;
            }

            // Return the updated vault in the response
            serviceResponse.Data = vault.Adapt<VaultDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Vault updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to delete a vault by its ID
    public async Task<ServiceResponse<bool>> DeleteVaultAsync(Guid vaultId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the vault. Please try again."
        };

        try
        {
            // Fetch the vault to be deleted
            var vault = await _unitOfWork.VaultRepo
                .GetByConditionAsync(w => w.Id == vaultId)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (vault == null)
            {
                _logger.LogInformation("Vault does not exist.");
                serviceResponse.Message = "Vault does not exist.";
                return serviceResponse;
            }

            // Validate delete permission
            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    vault.Id,
                    ResourceTypeEnum.Vault,
                    vault.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.Delete,
                    }
                );

            if (!canDelete)
            {
                serviceResponse.Message = "You do not have access to delete this vault.";
                return serviceResponse;
            }

            // Remove access mappings
            await _resourceShareService.DeleteResourceSharesAsync(
                vaultId,
                ResourceTypeEnum.Vault);

            // Delete the vault from the repository
            _unitOfWork.VaultRepo.Delete(vault);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting vault.");
                return serviceResponse;
            }

            // Return a success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Vault deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to delete multiple vaults by their IDs
    public async Task<ServiceResponse<bool>> DeleteVaultsAsync(IEnumerable<Guid> vaultIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the vaults. Please try again."
        };

        try
        {
            // Fetch the vaults to be deleted
            var vaults = await _unitOfWork.VaultRepo
                .GetByConditionAsync(w => vaultIds.Contains(w.Id))
                .ToListAsync();

            // If no items are found, return an error message
            if (vaults.Count == 0)
            {
                _logger.LogInformation("Vaults do not exist.");
                serviceResponse.Message = "Vaults do not exist.";
                return serviceResponse;
            }

            // Validate permissions
            foreach (var vault in vaults)
            {
                var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    vault.Id,
                    ResourceTypeEnum.Vault,
                    vault.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.Delete,
                    }
                );

                if (!canDelete)
                {
                    serviceResponse.Message = "You do not have access to delete one or more vaults.";
                    return serviceResponse;
                }
            }
            // Remove access mappings
            await _resourceShareService.DeleteResourceSharesAsync(
                vaultIds,
                ResourceTypeEnum.Vault);


            // Delete the vaults from the repository
            _unitOfWork.VaultRepo.Delete(vaults);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting vaults.");
                return serviceResponse;
            }


            // Return a success message with the count of deleted items
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{vaultIds.Count()} vaults deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to retrieve the decrypted value of an encrypted vault
    public async Task<ServiceResponse<VaultDto>> RetrieveDecryptedVaultValueAsync(Guid vaultId)
    {
        var serviceResponse = new ServiceResponse<VaultDto>
        {
            Data = null,
            Message = "Unable to decrypt the vault. Please try again later."
        };

        try
        {
            // Fetch the encrypted vault by its ID
            var vault = await _unitOfWork.VaultRepo
                .GetByConditionAsync(w => w.Id == vaultId)
                .SingleOrDefaultAsync();

            // Return an error response if the vault does not exist
            if (vault == null)
            {
                _logger.LogInformation("Vault not found.");
                serviceResponse.Message = "Vault not found.";
                return serviceResponse;
            }


            // Validate access permission
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    vault.Id,
                    ResourceTypeEnum.Vault,
                    vault.CreatedByUserId,
                    vault.IsTenantWideAccess,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.Delete,
                    }
                );

            // Block unauthorized access
            if (!canView)
            {
                _logger.LogWarning("User {UserId} attempted unauthorized vault access.", _userId);
                serviceResponse.Message = "You do not have access to view this vault.";
                return serviceResponse;
            }

            var vaultDto = vault.Adapt<VaultDto>();

            // Decrypt the username and password
            vaultDto.Username = _stringEncryptionService.DecryptString(vault.Username);
            vaultDto.Password = _stringEncryptionService.DecryptString(vault.Password);

            // Set the decrypted vault data in the response
            serviceResponse.Data = vaultDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Vault decrypted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurred while decrypting the vault.";
        }

        return serviceResponse;
    }
}
