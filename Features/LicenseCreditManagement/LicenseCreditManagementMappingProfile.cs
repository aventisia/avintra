namespace AccountsAPIs.MappingProfiles;

public class LicenseCreditManagementMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Configuration for mapping LicenseCredit to LicenseCreditDto.
        config.NewConfig<LicenseCredit, ManageLicenseCreditDto>()
            .Map(dest => dest.PricingComponent, src => src.PlanPricing != null ? src.PlanPricing.PricingComponent.ToString() : null)
            .Map(dest => dest.PlanId, src => src.PlanPricing != null ? src.PlanPricing.Id : src.PlanId)
            .Map(dest => dest.Unit, src => src.PlanPricing != null ? (UnitTypesEnum?)src.PlanPricing.Unit : null)
            .Map(dest => dest.UnitPrice, src => src.PlanPricing != null ? src.PlanPricing.UnitPrice : 0)
            .Map(dest => dest.Currency, src => src.PlanPricing != null ? src.PlanPricing.Currency : 0)
            .Map(dest => dest.TenantType, src => src.PlanPricing != null ? src.PlanPricing.TenantType : null)
            .Map(dest => dest.TenantId, src => src.TenantId)
            .Map(dest => dest.TenantName, src => src.Tenant != null ? src.PlanPricing.Tenant.Name : null)
            .Map(dest => dest.OverdueBalance, src => src.Invoices != null ? src.Invoices.Sum(a => a.Amount - a.AmountReceived) : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null);

        config.NewConfig<LicenseCredit, SelectOptionDto>()
            .Map(dest => dest.Label, src => src.PlanPricing != null ? $"{src.PlanPricing.PricingComponent} - {src.Available}" : null)
            .Map(dest => dest.Disabled, src => src.IsDisabled)
            .Map(dest => dest.Value, src => src.Id);

        
        // Configuration for mapping LicenseCreditDto to LicenseCredit during insertion or update.
        config.NewConfig<ManageLicenseCreditDto, LicenseCredit>()
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
