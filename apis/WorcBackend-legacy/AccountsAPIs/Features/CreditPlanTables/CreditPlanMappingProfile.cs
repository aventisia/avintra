namespace AccountsAPIs.MappingProfiles;

public class CreditPlanMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for credit plan records.
        config.NewConfig<CreditPlan, CreditPlanDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName : null);

        // Mapping for inserting or updating a credit plan record.
        config.NewConfig<CreditPlanDto, CreditPlan>()
                   .Ignore(dest => dest.Id)
                   .Ignore(dest => dest.CreatedOn)
                   .Ignore(dest => dest.LastModifiedOn)
                   .IgnoreNullValues(true);

        // Get credit plans in SelectOption format
        config.NewConfig<CreditPlan, SelectOption>()
            .Map(dest => dest.Label, src => src.ServiceType.ToString())
            .Map(dest => dest.Value, src => src.Id)
            .Map(dest => dest.Description, src => GetEnumDescriptionUtil.GetEnumDescription(src.ServiceType));
    }
}
