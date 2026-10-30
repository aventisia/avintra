namespace GlobalAdminAPIs.Services;

/// <summary>
/// Provides methods for validating and saving on-prem instance data.
/// </summary>
public interface IOnPremInstanceValidationService
{
    /// <summary>
    /// Retrieves metadata information for the on-premise tenant and instance asynchronously.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing the instance metadata.</returns>
    Task<ServiceResponse<OnPremDeploymentMetaDataDto>> GetOnPremInstanceMetadataAsync();

    /// <summary>
    /// Validates and stores data for an on-prem instance asynchronously.
    /// </summary>
    /// <param name="onPremInstanceRequestDto">The data to validate and store.</param>
    /// <returns>A task representing the asynchronous operation, with the validation and storage result.</returns>
    Task<ServiceResponse<OnPremInstanceResponseDto>> ValidateAndSaveInstanceAsync(OnPremInstanceRequestDto onPremInstanceRequestDto);
}
