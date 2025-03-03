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

        config.NewConfig<FlowVersionDto, FlowVersion>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.IsLocked)
            .Ignore(dest => dest.IsDraft)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.VersionNumber)
            .IgnoreNullValues(true);

        // Mapping to get agent list
        config.NewConfig<Machine, AssignMachineDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null)
            .Map(dest => dest.CreatedByUserInitials,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName.First() + "" + src.CreatedByUser.LastName.First()
                    : null);

        // New Mapping for Agents to SelectOptionDto (For dropdowns or select lists)
        config.NewConfig<FlowVersion, SelectOptionDto>()
            .Map(dest => dest.Value, src => src.Id)
            .Map(dest => dest.Label, src => src.Flow != null ? src.Flow.Name : string.Empty)
            .Map(dest => dest.Description, src => src.Flow != null ? src.Flow.Description : string.Empty)
            .Map(dest => dest.Disabled, src => src.IsDisabled);
    }
}