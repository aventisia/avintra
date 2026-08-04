namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// Configures object mappings for tools and flow version tools.
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

        // Maps ToolDto to Tool.
        config.NewConfig<ToolDto, Tool>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Maps FlowVersion_Tool to FlowVersionToolDto.
        config.NewConfig<FlowVersion_Tool, FlowVersionToolDto>();

        // Maps FlowVersionToolDto to FlowVersion_Tool.
        config.NewConfig<FlowVersionToolDto, FlowVersion_Tool>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}