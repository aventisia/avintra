namespace AccountsAPIs.MappingProfiles;

public class TenantAccountMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Used when retrieving tenant preferences.
        config.NewConfig<Tenant, TenantPreferenceDto>()
            .Map(dest => dest.TenantName, src => src.Name);

        // Used when fetching tenant billing details.
        config.NewConfig<BillingDetail, TenantOrganizationBillingDto>();

        // Used when inserting or updating a subscription plan record.
        config.NewConfig<TenantPreferenceDto, Tenant>()
            .Ignore(dest => dest.Id)
            .IgnoreNullValues(true);

        // Used when updating billing details (e.g., name).
        config.NewConfig<TenantOrganizationBillingDto, BillingDetail>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.Country)
            .IgnoreNullValues(true);
    }
}
