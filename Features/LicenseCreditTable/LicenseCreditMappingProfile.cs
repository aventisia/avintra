namespace AccountsAPIs.MappingProfiles;

public class LicenseCreditMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Configuration for mapping LicenseCredit to LicenseCreditDto.
        config.NewConfig<LicenseCredit, LicenseCreditDto>()
            .Map(dest => dest.PlanName, src => src.PlanPricing != null ? src.PlanPricing.Name : null)
            .Map(dest => dest.PlanId, src => src.PlanPricing != null ? src.PlanPricing.Id : Guid.Empty)
            .Map(dest => dest.TenantType, src => src.PlanPricing != null ? src.PlanPricing.TenantType : null)
            .Map(dest => dest.TenantId, src => src.PlanPricing != null ? src.PlanPricing.TenantId : null)
            .Map(dest => dest.TenantName, src => src.PlanPricing != null && src.PlanPricing.Tenant != null ? src.PlanPricing.Tenant.Name : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null);

        // Configuration for mapping LicenseCreditDto to LicenseCredit during insertion or update.
        config.NewConfig<LicenseCreditDto, LicenseCredit>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        config.NewConfig<RequestLicenseCreditDto, LicenseCredit>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}
