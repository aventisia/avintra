namespace GlobalAdminAPIs.MappingProfiles;

/// <summary>
/// This class defines the mapping configurations for mapping between OnPremTenantDto 
/// and OnPremTenant entities using Mapster.
/// </summary>
public class OnPremTenantMappingProfile : IRegister
{
    //Registers the mappings between DTOs and entities for OnPremTenant.
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating an OnPremTenant entity (from OnPremTenantDto to OnPremTenant)
        config.NewConfig<OnPremTenantDto, OnPremTenant>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Mapping for getting OnPremTenant record (from OnPremTenant to OnPremTenantDto)
        config.NewConfig<OnPremTenant, OnPremTenantDto>()
            .Map(dest => dest.IsAnyInstanceFailed,
                 src => src.OnPremInstances.Any(w => w.NoOfInvalidCheck != 0)) // Check if any instance has invalid checks
            .Map(dest => dest.ConsumedExecutionTime,
                 src => src.OnPremInstances
                         .SelectMany(instance => instance.OnPremInstanceData)
                         .Sum(data => data.ExecutionTime));

    }
}