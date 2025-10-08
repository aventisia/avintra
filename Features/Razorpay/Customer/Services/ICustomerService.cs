namespace AccountsAPIs.Services;

/// <summary>
/// Defines the contract for a service responsible for managing customer-related operations with Razorpay.
/// </summary>
public interface ICustomerService
{
    /// <summary>
    /// Asynchronously creates a new customer record in Razorpay.
    /// </summary>
    /// <param name="customerDto">A data transfer object (DTO) containing the necessary information to create a new customer.</param>
    /// <returns>A task that represents the asynchronous operation. The result contains the details of the newly created customer.</returns>
    Task<ServiceResponse<CustomerResponseDto>> CreateCustomerAsync(CustomerRequestDto customerDto);

    /// <summary>
    /// Asynchronously retrieves a customer record using the unique identifier of the customer.
    /// </summary>
    /// <param name="customerId">The unique identifier for the customer (e.g., "cust_xxxxxxxxxxxxxx").</param>
    /// <returns>A task representing the asynchronous operation. The result contains the details of the customer if found.</returns>
    Task<ServiceResponse<CustomerResponseDto>> GetCustomerByIdAsync(string customerId);

    /// <summary>
    /// Asynchronously retrieves a list of all customer records.
    /// </summary>
    /// <returns>A task representing the asynchronous operation. The result contains a list of all customers.</returns>
    Task<ServiceResponse<List<CustomerResponseDto>>> GetAllCustomersAsync();

    /// <summary>
    /// Asynchronously updates the information of an existing customer record.
    /// </summary>
    /// <param name="customerId">The unique identifier of the customer to update.</param>
    /// <param name="customerDto">A data transfer object (DTO) containing the updated customer details.</param>
    /// <returns>A task representing the asynchronous operation. The result contains the details of the updated customer.</returns>
    Task<ServiceResponse<CustomerResponseDto>> UpdateCustomerAsync(string customerId, CustomerRequestDto customerDto);
}