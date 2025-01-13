namespace AccountsAPIs.Services;

public interface IBillingAccountService
{
    /// <summary>
    /// Get billing account list
    /// </summary>
    /// <returns>List of billing accounts</returns>
    Task<ServiceResponse<IEnumerable<BillingAccountDto>>> GetBillingAccountListAsync();

    /// <summary>
    /// Insert billing account 
    /// </summary>
    /// <param name="billingAccountDto">Billing Account Dto</param>
    /// <returns>a newly created billing account</returns>
    Task<ServiceResponse<BillingAccountDto>> InsertBillingAccountAsync(BillingAccountDto billingAccountDto);

    /// <summary>
    /// Update billing account
    /// </summary>
    /// <param name="billingAccountDto"></param>
    /// <returns>An updated billing account</returns>
    Task<ServiceResponse<BillingAccountDto>> UpdateBillingAccountAsync(BillingAccountDto billingAccountDto);

    /// <summary>
    /// Delete a billing account
    /// </summary>
    /// <param name="id">Billing account identifier</param>
    /// <returns>True, if deleted successfully. else false</returns>
    Task<ServiceResponse<bool>> DeleteBillingAccountAsync(Guid id);
}