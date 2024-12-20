namespace AccountsAPIs.Services;

public interface IInvoiceService
{
    Task<ServiceResponse<InvoiceDto>> InsertInvoiceAsync (InvoiceDto invoiceDto);

    Task<ServiceResponse<InvoiceDto>> UpdateInvoiceAsync (InvoiceDto invoiceDto);
}