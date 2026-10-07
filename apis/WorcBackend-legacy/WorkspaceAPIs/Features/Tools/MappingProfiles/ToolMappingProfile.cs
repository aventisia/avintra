namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// Configures object mappings for tools.
/// </summary>
public class ToolMappingProfile : IRegister
{
    /// <summary>
    /// Registers the mapping configurations.
    /// </summary>
    /// <param name="config">The Mapster configuration.</param>
    public void Register(TypeAdapterConfig config)
    {
        // Maps Tool to ToolDto.
        config.NewConfig<Tool, ToolDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null)
            .Map(dest => dest.IsVerified, src => src.IsVerified);

        // Maps Tool to UsableToolDto.
        config.NewConfig<Tool, UsableToolDto>();

        // Maps ToolDto to Tool.
        config.NewConfig<ToolDto, Tool>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}