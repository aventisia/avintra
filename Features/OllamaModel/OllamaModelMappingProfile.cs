namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// This class defines the mapping configurations for mapping between OllamaModelDto 
/// and OllamaModel entities using Mapster.
/// </summary>
public class OllamaModelMappingProfile : IRegister
{
    //Registers the mappings between DTOs and entities for OllamaModel.
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating an OllamaModel entity (from OllamaModelDto to OllamaModel)
        config.NewConfig<OllamaModelDto, OllamaModel>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Mapping for getting OllamaModel record (from OllamaModel to OllamaModelDto)
        config.NewConfig<OllamaModel, OllamaModelDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);
    }
}