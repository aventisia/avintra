namespace AccountsAPIs.Services;

public interface IInvoiceService
{
    /// <summary>
    /// Get invoice list.
    /// </summary>
    /// <returns>A list of invoice</returns>
    Task<ServiceResponse<IEnumerable<InvoiceDto>>> GetAllInvoiceAsync();

    /// <summary>
    /// Get invoice list by subscriptionId
    /// </summary>
    /// <param name="SubscriptionId">Invoice Id</param>
    /// <returns>A list of invoice by subscriptionId record </returns>
    Task<ServiceResponse<IEnumerable<InvoiceDto>>> GetInvoiceBySubscriptionAsync(Guid subscriptionId);
   
    /// <summary>
    /// Get invoice by Id
    /// </summary>
    /// <param name="InvoiceId">Invoice Id</param>
    /// <returns>A invoice record </returns>
    Task<ServiceResponse<InvoiceDto>> GetInvoiceAsync(Guid id);

    /// <summary>
    /// Inserts a Invoice
    /// </summary>
    /// <param name="InvoiceDto">Invoice DTO</param>
    /// <returns>A newly created Invoice</returns>
    Task<ServiceResponse<InvoiceDto>> InsertInvoiceAsync(InvoiceDto invoiceDto);

    /// <summary>
    /// Update a Invoice
    /// </summary>
    /// <param name="InvoiceDto">Invoice DTO</param>
    /// <returns>A updated Invoice</returns>
    Task<ServiceResponse<InvoiceDto>> UpdateInvoiceAsync(InvoiceDto invoiceDto);

    /// <summary>
    /// Deletes a Invoice
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True, if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteInvoiceAsync(Guid id);
    Task<ServiceResponse<GenerateInvoiceDto>> GenerateInvoiceAsync(GenerateInvoiceDto generateInvoiceRequest);
}