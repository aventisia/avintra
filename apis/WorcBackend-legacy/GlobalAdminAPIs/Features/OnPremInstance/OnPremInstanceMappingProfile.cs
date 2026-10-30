namespace GlobalAdminAPIs.MappingProfiles;

/// <summary>
/// This class defines the mapping configurations for mapping between OnPremInstanceDto 
/// and OnPremInstance entities using Mapster.
/// </summary>
public class OnPremInstanceMappingProfile : IRegister
{
    //Registers the mappings between DTOs and entities for OnPremInstance.
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating an OnPremInstance entity (from OnPremInstanceDto to OnPremInstance)
        config.NewConfig<OnPremInstanceDto, OnPremInstance>()
            .Ignore(dest => dest.Id)
            .IgnoreNullValues(true);

        // Mapping for getting OnPremInstance record (from OnPremInstance to OnPremInstanceDto)
        config.NewConfig<OnPremInstance, OnPremInstanceDto>();
    }
}