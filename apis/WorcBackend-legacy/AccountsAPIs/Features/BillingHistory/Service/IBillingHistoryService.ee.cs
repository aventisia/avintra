namespace AccountsAPIs.Services;

public interface IBillingHistoryService
{
    /// <summary>
    /// Get billing history list
    /// </summary>
    /// <returns>List of billing histories</returns>
    Task<ServiceResponse<IEnumerable<BillingHistoryDto>>> GetBillingHistoryListAsync();

    /// <summary>
    /// Insert billing history
    /// </summary>
    /// <param name="BillingHistoryDto">Billing History Dto</param>
    /// <returns>A newly created billing history</returns>
    Task<ServiceResponse<BillingHistoryDto>> InsertBillingHistoryAsync(BillingHistoryDto billingHistoryDto);

    /// <summary>
    /// Update billing history
    /// </summary>
    /// <param name="BillingHistoryDto">Updated billing history details</param>
    /// <returns>An updated billing history</returns>
    Task<ServiceResponse<BillingHistoryDto>> UpdateBillingHistoryAsync(BillingHistoryDto billingHistoryDto);

    /// <summary>
    /// Delete a billing history entry
    /// </summary>
    /// <param name="id">Billing history identifier</param>
    /// <returns>True, if deleted successfully. Otherwise, false</returns>
    Task<ServiceResponse<bool>> DeleteBillingHistoryAsync(Guid id);
}
