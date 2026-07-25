namespace AccountsAPIs.MappingProfiles;

public class SubscriptionPlanMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for subscription plan records.
        config.NewConfig<SubscriptionPlan, SubscriptionPlanDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a subscription plan record.
        config.NewConfig<SubscriptionPlanDto, SubscriptionPlan>()
            .Ignore(dest => dest.UniqueName)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Get subscription plans in SelectOptionDto format
        config.NewConfig<SubscriptionPlan, SelectOptionDto>()
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.Value, src => src.Id);
    }
}