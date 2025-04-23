namespace AccountsAPIs.MappingProfiles;

public class InvoiceMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for Insert or update Invoice Record.
        config.NewConfig<InvoiceDto, Invoice>()
        .Ignore(dest => dest.InvoiceNumber)
        .Ignore(dest => dest.Id)
        .IgnoreNullValues(true);

        // Mapping for Get the Invoice Record.
        config.NewConfig<Invoice, InvoiceDto>()
            .Map(dest => dest.PricingPlanId, src => src.LicenseCredit != null ? src.LicenseCredit.PlanId : Guid.Empty);

        // Mapping for Generate invoice Record.
        config.NewConfig<GenerateInvoiceDto, Invoice>()
        .Ignore(dest => dest.Id)
        .Ignore(dest => dest.TenantId)
        .IgnoreNullValues(true);
    }
}