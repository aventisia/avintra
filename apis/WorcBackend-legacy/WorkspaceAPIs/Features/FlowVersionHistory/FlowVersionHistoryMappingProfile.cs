namespace WorkspaceAPIs.MappingProfiles;

public class FlowVersionHistoryMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping from FlowVersionHistory entity to FlowVersionHistoryDto for UI display
        config.NewConfig<FlowVersionHistory, FlowVersionHistoryDto>()
            // Map the Flow's name safely
            .Map(dest => dest.FlowName,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Name
                    : null)
            // Map the FlowId safely
            .Map(dest => dest.FlowId,
                src => src.FlowVersion != null
                    ? src.FlowVersion.FlowId
                    : Guid.Empty)
            // Map the VersionNumber safely
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersion != null
                    ? src.FlowVersion.VersionNumber
                    : 0)
            // Map the full name of the creator
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
            // Map the username of the creator
            .Map(dest => dest.CreatedByUsername,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.UserName
                    : null)
            // Map the initials of the creator
            .Map(dest => dest.CreatedByUserInitials,
                src => src.CreatedByUser != null
                    ? GetUserInitialsUtil.GetUserInitials(src.CreatedByUser.FirstName, src.CreatedByUser.LastName)
                    : null);

        // Mapping from FlowVersionHistory entity to FlowVersionHistoryDetailDto for UI display
        config.NewConfig<FlowVersionHistory, FlowVersionHistoryDetailDto>()
            // Map the Flow's name safely
            .Map(dest => dest.FlowName,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Name
                    : null)
            // Map the FlowId safely
            .Map(dest => dest.FlowId,
                src => src.FlowVersion != null
                    ? src.FlowVersion.FlowId
                    : Guid.Empty)
            // Map the VersionNumber safely
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersion != null
                    ? src.FlowVersion.VersionNumber
                    : 0)
            // Map the full name of the creator
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
            // Map the username of the creator
            .Map(dest => dest.CreatedByUsername,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.UserName
                    : null)
            // Map the initials of the creator
            .Map(dest => dest.CreatedByUserInitials,
                src => src.CreatedByUser != null
                    ? GetUserInitialsUtil.GetUserInitials(src.CreatedByUser.FirstName, src.CreatedByUser.LastName)
                    : null);

        // Mapping from FlowVersionHistoryDto back to entity for insert/update operations
        config.NewConfig<FlowVersionHistoryDto, FlowVersionHistory>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}