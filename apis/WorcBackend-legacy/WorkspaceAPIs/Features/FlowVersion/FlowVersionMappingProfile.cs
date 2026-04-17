namespace WorkspaceAPIs.MappingProfiles;

public class FlowVersionMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<FlowVersion, FlowVersionDto>()
        .Map(dest => dest.CreatedBy,
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null)
        .Map(dest => dest.CreatedByUserInitials, src => src.CreatedByUser != null
            ? GetUserInitialsUtil.GetUserInitials(src.CreatedByUser.FirstName, src.CreatedByUser.LastName)
            : null);

        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<FlowVersion, FlowAgentTableDto>()
            .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : null)
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}" : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}" : null);

        config.NewConfig<FlowVersionDto, FlowVersion>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.IsDisabled)
            .Ignore(dest => dest.IsLocked)
            .Ignore(dest => dest.IsDraft)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.VersionNumber)
            .IgnoreNullValues(true);

    }
}