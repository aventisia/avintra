namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// Mapping profile for skill registry entity to DTO conversions using Mapster.
/// </summary>
public class SkillMappingProfile : IRegister
{
    /// <summary>
    /// Registers mappings between skill registry entities and DTOs.
    /// </summary>
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Skill, SkillDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null)
            .Map(dest => dest.FileCount,
                src => src.Files != null ? src.Files.Count : 0);

        config.NewConfig<SkillFile, SkillFileDto>()
            .Map(dest => dest.Content, src => Encoding.UTF8.GetString(src.Content))
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null);

        config.NewConfig<Skill, SkillSyncDto>();
    }
}
