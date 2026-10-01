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
                    : null);

        config.NewConfig<SkillDto, Skill>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        config.NewConfig<SkillFile, SkillFileDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null);

        config.NewConfig<Skill, SkillSyncDto>();
    }
}
