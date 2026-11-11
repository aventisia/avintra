namespace AccountsAPIs.MappingProfiles;

public class TenantSubscriptionMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for subscription plan records.
        config.NewConfig<TenantSubscription, TenantSubscriptionDto>()
            .Map(dest => dest.Name, src => src.Plan != null ? src.Plan.Name : null)
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName : null);

        // Mapping for inserting or updating a subscription plan record.
        config.NewConfig<TenantSubscriptionDto, TenantSubscription>()
                   .Ignore(dest => dest.Id)
                   .Ignore(dest => dest.CreatedOn)
                   .Ignore(dest => dest.LastModifiedOn)
                   .IgnoreNullValues(true);
    }
}