namespace AccountsAPIs.Services;

/// <summary>
/// Defines the operations for processing top-up transactions, including creating and managing top-ups.
/// </summary>
public interface ITopUpService
{
    /// <summary>
    /// Initiates a new top-up transaction based on the provided request details.
    /// </summary>
    /// <param name="topUpDto">The details of the top-up request, including currency, credits, amount, and tax information.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation, with a result of type <see cref="ServiceResponse{TopUpDto}"/> containing the processed top-up transaction details.</returns>
    Task<ServiceResponse<TopUpDto>> CreateTopUpAsync(TopUpDto topUpDto);
}
