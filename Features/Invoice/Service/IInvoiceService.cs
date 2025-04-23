namespace AccountsAPIs.Services;

public interface IInvoiceService
{
    /// <summary>
    /// Retrieves a list of all invoices.
    /// </summary>
    /// <returns>A service response containing a collection of invoices.</returns>
    Task<ServiceResponse<IEnumerable<InvoiceDto>>> GetAllInvoicesAsync();

    /// <summary>
    /// Retrieves a list of invoices associated with a specific pricing plan ID.
    /// </summary>
    /// <param name="pricingPlanId">The ID of the pricing plan.</param>
    /// <returns>A service response containing a collection of invoices for the specified pricing plan.</returns>
    Task<ServiceResponse<IEnumerable<InvoiceDto>>> GetInvoicesByPricingPlanAsync(Guid pricingPlanId);

    /// <summary>
    /// Retrieves an invoice by its ID.
    /// </summary>
    /// <param name="id">The ID of the invoice.</param>
    /// <returns>A service response containing the requested invoice.</returns>
    Task<ServiceResponse<InvoiceDto>> GetInvoiceByIdAsync(Guid id);

    /// <summary>
    /// Creates a new invoice.
    /// </summary>
    /// <param name="invoiceDto">The invoice data transfer object.</param>
    /// <returns>A service response containing the created invoice.</returns>
    Task<ServiceResponse<InvoiceDto>> CreateInvoiceAsync(InvoiceDto invoiceDto);

    /// <summary>
    /// Updates an existing invoice.
    /// </summary>
    /// <param name="invoiceDto">The updated invoice data transfer object.</param>
    /// <returns>A service response containing the updated invoice.</returns>
    Task<ServiceResponse<GenerateInvoiceDto>> UpdateInvoiceAsync(GenerateInvoiceDto invoiceDto);

    /// <summary>
    /// Deletes an invoice by its ID.
    /// </summary>
    /// <param name="id">The ID of the invoice to delete.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteInvoiceAsync(Guid id);

    /// <summary>
    /// Generates an invoice based on the provided details.
    /// </summary>
    /// <param name="generateInvoiceRequest">The data required to generate the invoice.</param>
    /// <returns>A service response containing the generated invoice.</returns>
    Task<ServiceResponse<GenerateInvoiceDto>> GenerateInvoiceAsync(GenerateInvoiceDto generateInvoiceRequest);
}