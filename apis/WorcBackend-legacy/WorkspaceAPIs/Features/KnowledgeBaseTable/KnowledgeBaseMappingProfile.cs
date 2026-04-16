namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// Mapping profile for Knowledge Base entity to DTO conversions using Mapster.
/// </summary>
public class KnowledgeBaseMappingProfile : IRegister
{
    /// <summary>
    /// Registers mappings between Knowledge Base entity and DTO.
    /// </summary>
    public void Register(TypeAdapterConfig config)
    {
        // Map KnowledgeBase entity to KnowledgeBaseDto
        config.NewConfig<KnowledgeBase, KnowledgeBaseDto>()
            .Map(dest => dest.CreatedBy, 
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy, 
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a knowledge base record
        config.NewConfig<FlowsTableDto, Flow>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}
