namespace AccountsAPIs.Services;

/// <summary>
/// Defines operations for managing addresses.
/// </summary>
public interface IAddressService
{
    /// <summary>
    /// Retrieves a list of all addresses.
    /// </summary>
    /// <returns>A service response containing a collection of addresses.</returns>
    Task<ServiceResponse<IEnumerable<AddressDto>>> GetAddressListAsync();

    /// <summary>
    /// Retrieves an address by its unique identifier.
    /// </summary>
    /// <param name="addressId">The unique identifier of the address.</param>
    /// <returns>A service response containing the address, if found.</returns>
    Task<ServiceResponse<AddressDto>> GetAddressByIdAsync(Guid addressId);

    /// <summary>
    /// Creates a new address.
    /// </summary>
    /// <param name="addressDto">The address data transfer object.</param>
    /// <returns>A service response containing the newly created address.</returns>
    Task<ServiceResponse<AddressDto>> InsertAddressAsync(AddressDto addressDto);

    /// <summary>
    /// Updates an existing address.
    /// </summary>
    /// <param name="addressDto">The address data transfer object with updated information.</param>
    /// <returns>A service response containing the updated address.</returns>
    Task<ServiceResponse<AddressDto>> UpdateAddressAsync(AddressDto addressDto);

    /// <summary>
    /// Deletes an address by its unique identifier.
    /// </summary>
    /// <param name="addressId">The unique identifier of the address to delete.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteAddressAsync(Guid addressId);
}
