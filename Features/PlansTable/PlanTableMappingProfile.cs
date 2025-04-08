namespace AccountsAPIs.MappingProfiles;

public class PlanTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for flow record or records.
        config.NewConfig<PlanPricing, PlanTableDto>()
            .Map(dest => dest.TenantId, src => src.Tenant != null ? src.Tenant.Id : Guid.Empty)
            .Map(dest => dest.TenantType, src => src.Tenant != null ? src.Tenant.Type : TenantTypesEnum.NA)
            .Map(dest => dest.TenantName, src => src.Tenant != null ? src.Tenant.Name : "Default")
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a plan record.
        config.NewConfig<PlanTableDto, PlanPricing>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Get plans in SelectOptionDto format
        config.NewConfig<PlanPricing, SelectOptionDto>()
            .Map(dest => dest.Label, src => src.PricingComponent == PricingComponentsEnum.GPUCompute 
                                ? GetEnumDescriptionUtil.GetEnumDescription(src.PricingComponent) 
                                : $"{GetEnumDescriptionUtil.GetEnumDescription(src.PricingComponent)} ({src.Frequency})")
            .Map(dest => dest.Value, src => src.Id)
            .Map(dest => dest.Disabled, src => src.IsDisabled);
    }
}