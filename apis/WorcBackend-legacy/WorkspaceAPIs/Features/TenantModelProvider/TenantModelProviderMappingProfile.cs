namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// This class defines the mapping configurations for mapping between TenantModelProviderDto
/// and TenantModelProvider entities using Mapster.
/// </summary>
public class TenantModelProviderMappingProfile : IRegister
{
    // Registers the mappings between DTOs and entities for TenantModelProvider.
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating a TenantModelProvider entity (from DTO to entity)
        config.NewConfig<TenantModelProviderDto, TenantModelProvider>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Mapping for getting a TenantModelProvider record (from entity to DTO)
        config.NewConfig<TenantModelProvider, TenantModelProviderDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);
    }
}
