namespace AccountsAPIs.Services;

public class AddressService : IAddressService
{
    private readonly ILogger<AddressService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public AddressService(
        ILogger<AddressService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract user ID from the authenticated user's claims
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of all addresses.
    public async Task<ServiceResponse<IEnumerable<AddressDto>>> GetAddressListAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AddressDto>>
        {
            Data = null,
            Message = "Failed to retrieve addresses. Please try again."
        };

        try
        {
            _logger.LogInformation("Fetching address list for tenant: {TenantId}", _tenantId);

            // Fetch tenant based on tenant ID
            var tenant = await _unitOfWork.TenantRepo
                        .GetByConditionAsync(w => w.Id == _tenantId)
                        .FirstOrDefaultAsync();

            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found for TenantId: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Fetch all address records from the database
            var addresses = await _unitOfWork.AddressRepo
                        .GetByConditionAsync(w =>
                            w.AddressRefId == (tenant.Name == DefaultTenantsEnum.IndividualUsers.ToString() ? _userId : _tenantId)
                        )
                        .ToListAsync();

            // Map to DTO and return success response
            serviceResponse.Data = addresses.Adapt<IEnumerable<AddressDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Addresses retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {AddressCount} addresses for TenantId: {TenantId}", addresses.Count, _tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving addresses for TenantId: {TenantId}.", _tenantId);
        }

        return serviceResponse;
    }

    // Retrieves an address by its unique identifier.
    public async Task<ServiceResponse<AddressDto>> GetAddressByIdAsync(Guid addressId)
    {
        var serviceResponse = new ServiceResponse<AddressDto>
        {
            Data = null,
            Message = "Failed to retrieve address. Please try again."
        };

        try
        {
            _logger.LogInformation("Fetching address by ID: {AddressId}", addressId);

            var address = await _unitOfWork.AddressRepo
                .GetByConditionAsync(x => x.Id == addressId)
                .SingleOrDefaultAsync();

            if (address == null)
            {
                _logger.LogWarning("Address not found for AddressId: {AddressId}", addressId);
                serviceResponse.Message = "Address not found.";
                return serviceResponse;
            }

            serviceResponse.Data = address.Adapt<AddressDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Address retrieved successfully.";

            _logger.LogInformation("Successfully retrieved address: {AddressId}", addressId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving address by ID: {AddressId}.", addressId);
        }

        return serviceResponse;
    }

    // Creates a new address.
    public async Task<ServiceResponse<AddressDto>> InsertAddressAsync(AddressDto addressDto)
    {
        var serviceResponse = new ServiceResponse<AddressDto>
        {
            Data = null,
            Message = "Failed to insert address. Please try again."
        };

        try
        {
            _logger.LogInformation("Inserting new address for user: {UserId}", _userId);

            var tenant = await _unitOfWork.TenantRepo
                        .GetByConditionAsync(w => w.Id == _tenantId)
                        .FirstOrDefaultAsync();

            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found for TenantId: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            var newAddress = addressDto.Adapt<Address>();
            newAddress.AddressRefId = tenant.Name.Equals(DefaultTenantsEnum.IndividualUsers.ToString()) ? _userId : _tenantId;
            newAddress.CreatedByUserId = _userId;
            newAddress.LastModifiedByUserId = _userId;

            await _unitOfWork.AddressRepo.InsertAsync(newAddress);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save new address for UserId: {UserId}.", _userId);
                return serviceResponse;
            }

            serviceResponse.Data = newAddress.Adapt<AddressDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Address added successfully.";

            _logger.LogInformation("Successfully inserted new address for UserId: {UserId}", _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting a new address for UserId: {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Updates an existing address.
    public async Task<ServiceResponse<AddressDto>> UpdateAddressAsync(AddressDto addressDto)
    {
        var serviceResponse = new ServiceResponse<AddressDto>
        {
            Data = null,
            Message = "Failed to update address. Please try again."
        };

        try
        {
            _logger.LogInformation("Updating address with ID: {AddressId} for UserId: {UserId}", addressDto.Id, _userId);

            var address = await _unitOfWork.AddressRepo
                .GetByConditionAsync(v => v.Id == addressDto.Id)
                .SingleOrDefaultAsync();

            if (address == null)
            {
                _logger.LogWarning("Address not found for AddressId: {AddressId}", addressDto.Id);
                serviceResponse.Message = "Address does not exist.";
                return serviceResponse;
            }

            var updatedAddress = addressDto.Adapt(address);
            updatedAddress.LastModifiedByUserId = _userId;

            _unitOfWork.AddressRepo.Update(updatedAddress);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save updated address with ID: {AddressId}.", addressDto.Id);
                return serviceResponse;
            }

            serviceResponse.Data = updatedAddress.Adapt<AddressDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Address updated successfully.";

            _logger.LogInformation("Successfully updated address with ID: {AddressId} for UserId: {UserId}", addressDto.Id, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating address with ID: {AddressId} for UserId: {UserId}.", addressDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Deletes an address by its unique identifier.
    public async Task<ServiceResponse<bool>> DeleteAddressAsync(Guid addressId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete address. Please try again."
        };

        try
        {
            _logger.LogInformation("Deleting address with ID: {AddressId} for UserId: {UserId}", addressId, _userId);

            var address = await _unitOfWork.AddressRepo
                .GetByConditionAsync(v => v.Id == addressId)
                .SingleOrDefaultAsync();

            if (address == null)
            {
                _logger.LogWarning("Address not found for AddressId: {AddressId}", addressId);
                serviceResponse.Message = "Address not found.";
                return serviceResponse;
            }

            _unitOfWork.AddressRepo.Delete(address);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save changes after deleting address with ID: {AddressId}.", addressId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Address deleted successfully.";

            _logger.LogInformation("Successfully deleted address with ID: {AddressId} for UserId: {UserId}", addressId, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting address with ID: {AddressId} for UserId: {UserId}.", addressId, _userId);
        }

        return serviceResponse;
    }
}