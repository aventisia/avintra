namespace AccountsAPIs.MappingProfiles;

public class InvoiceMappingProfile : IRegister
{
    public void Register (TypeAdapterConfig config)
    {
        // Mapping for Insert or update Invoice Record.
        config.NewConfig<InvoiceDto,Invoice>()
        .Ignore(dest => dest.Id)
        .IgnoreNullValues(true);
        
    }
}