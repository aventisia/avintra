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
                    : null)
            .Map(dest => dest.TotalChunks,
                src => src.Files != null
                    ? src.Files.Sum(f => f.ChunksCount)
                    : 0);
    }
}
