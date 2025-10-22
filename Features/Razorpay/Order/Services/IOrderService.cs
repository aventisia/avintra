namespace AccountsAPIs.Services;

/// <summary>
/// Defines operations for managing orders, including creating, retrieving, and listing orders.
/// </summary>
public interface IOrderService
{
    /// <summary>
    /// Creates a new order using the provided order data.
    /// </summary>
    /// <param name="request">The details of the order to be created.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation, with a result of type <see cref="OrderResponseDto"/> containing the created order's details.</returns>
    /// <remarks>
    /// This method processes the order creation request and returns the details of the newly created order, including the order ID, status, and receipt (if applicable).
    /// </remarks>
    Task<ServiceResponse<OrderResponseDto>> CreateOrderAsync(OrderRequestDto request);

    /// <summary>
    /// Retrieves the details of an order using its unique identifier.
    /// </summary>
    /// <param name="orderId">The unique identifier of the order to retrieve.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation, with a result of type <see cref="OrderResponseDto"/> containing the details of the specified order.</returns>
    /// <remarks>
    /// This method fetches the current details of the order, including the amount, currency, status, and receipt (if applicable).
    /// </remarks>
    Task<ServiceResponse<OrderResponseDto>> GetOrderAsync(string orderId);

    /// <summary>
    /// Retrieves the details of all orders.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation, with a result of type <see cref="List{OrderResponseDto}"/> containing the details of all orders.</returns>
    /// <remarks>
    /// This method returns a list of all orders along with their details, such as amount, currency, status, and receipt (if applicable).
    /// </remarks>
    Task<ServiceResponse<List<OrderResponseDto>>> GetAllOrdersAsync();
}