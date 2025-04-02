namespace AccountsAPIs.MappingProfiles;

public class LicenseCreditMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Configuration for mapping LicenseCredit to LicenseCreditDto.
        config.NewConfig<LicenseCredit, LicenseCreditDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null);

        config.NewConfig<PlanPricing, LicenseCreditDto>()
            .Map(dest => dest.Allocated, src => src.LicenseCredits != null ? src.LicenseCredits.Sum(a => a.Allocated) : 0)
            .Map(dest => dest.Available, src => src.LicenseCredits != null ? src.LicenseCredits.Sum(a => a.Available) : 0)
            .Map(dest => dest.Consumed, src => src.LicenseCredits != null ? src.LicenseCredits.Sum(a => a.Consumed) : 0)
            .Map(dest => dest.PlanId, src => src.Id)
            .Map(dest => dest.PlanName, src => src.Name)
            .Map(dest => dest.TenantId, src => src.TenantId)
            .Map(dest => dest.TenantName, src => src.Tenant != null ? src.Tenant.Name : null)
            .Map(dest => dest.TenantType, src => src.TenantType)
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
    }
}
