namespace GlobalAdminAPIs.MappingProfiles;

/// <summary>
/// This class defines the mapping configurations for mapping between OnPremInstanceDataDto 
/// and OnPremInstanceData entities using Mapster.
/// </summary>
public class OnPremInstanceDataMappingProfile : IRegister
{
    //Registers the mappings between DTOs and entities for OnPremInstanceData.
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating an OnPremInstanceData entity (from OnPremInstanceDataDto to OnPremInstanceData)
        config.NewConfig<OnPremInstanceDataDto, OnPremInstanceData>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.ValidatedOn)
            .IgnoreNullValues(true);

        // Mapping for getting OnPremInstanceData record (from OnPremInstanceData to OnPremInstanceDataDto)
        config.NewConfig<OnPremInstanceData, OnPremInstanceDataDto>();
    }
}