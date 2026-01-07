namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// This class defines the mapping configurations for mapping between OnPremModelDto 
/// and OnPremModel entities using Mapster.
/// </summary>
public class OnPremModelMappingProfile : IRegister
{
    // Registers the mappings between DTOs and entities for OnPremModel.
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating an OnPremModel entity (from OnPremModelDto to OnPremModel)
        config.NewConfig<OnPremModelDto, OnPremModel>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Mapping for getting OnPremModel record (from OnPremModel to OnPremModelDto)
        config.NewConfig<OnPremModel, OnPremModelDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);
    }
}