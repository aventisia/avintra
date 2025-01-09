namespace AccountsAPIs.MappingProfiles;

public class InvoiceMappingProfile : IRegister
{
    public void Register (TypeAdapterConfig config)
    {
        // Mapping for Insert or update Invoice Record.
        config.NewConfig<InvoiceDto,Invoice>()
        .Ignore(dest => dest.Id)
        .IgnoreNullValues(true);

        // Mapping for Get the Invoice Record.
        config.NewConfig<Invoice , InvoiceDto>();

        // Mapping for Generate invoice Record.
        config.NewConfig<GenerateInvoiceDto,Invoice>()
        .Ignore(dest => dest.Id)
        .Ignore(dest => dest.TenantId)
        .IgnoreNullValues(true);
        
    }
}