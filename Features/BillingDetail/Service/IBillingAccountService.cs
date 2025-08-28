namespace AccountsAPIs.Services;

public interface IBillingDetailService
{
    /// <summary>
    /// Get billing account list
    /// </summary>
    /// <returns>List of billing accounts</returns>
    Task<ServiceResponse<IEnumerable<BillingAccountDetailsDto>>> GetBillingDetailListAsync();

    /// <summary>
    /// Insert billing account 
    /// </summary>
    /// <param name="BillingDetailDto">Billing Account Dto</param>
    /// <returns>a newly created billing account</returns>
    Task<ServiceResponse<BillingDetailDto>> InsertBillingDetailAsync(BillingDetailDto BillingDetailDto);

    /// <summary>
    /// Update billing account
    /// </summary>
    /// <param name="BillingDetailDto"></param>
    /// <returns>An updated billing account</returns>
    Task<ServiceResponse<BillingDetailDto>> UpdateBillingDetailAsync(BillingDetailDto BillingDetailDto);

    /// <summary>
    /// Delete a billing account
    /// </summary>
    /// <param name="id">Billing account identifier</param>
    /// <returns>True, if deleted successfully. else false</returns>
    Task<ServiceResponse<bool>> DeleteBillingDetailAsync(Guid id);
}