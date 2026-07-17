namespace WorkspaceAPIs.MappingProfiles;

public class MachinesTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // For - Retrieves list of machines or Retrieve machine by its ID
        config.NewConfig<Machine, MachinesTableRowDto>()
            .Map(dest => dest.FlowVersionCount, src => src.MachineFlowVersions != null ? src.MachineFlowVersions.Count : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // For - Retrieves machine by its ID
        config.NewConfig<Machine, MachineRecordDto>()
            .Map(dest => dest.MachineFlowVersions, src => src.MachineFlowVersions)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // For - Retrieves machine by its ID (assigned flow versions)
        config.NewConfig<Machine_FlowVersion, MachineFlowVersion>()
            .Map(dest => dest.FlowVersionId, src => src.FlowVersionId)
            .Map(dest => dest.FlowId, src => src.FlowVersion != null ? src.FlowVersion.FlowId : Guid.Empty)
            .Map(dest => dest.FlowName,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Name
                    : string.Empty)
            .Map(dest => dest.VersionNumber, src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
            .Map(dest => dest.IsPublished, src => src.FlowVersion != null && src.FlowVersion.IsPublished);

        // For - Insert new machine
        config.NewConfig<AddMachineDto, Machine>()
            .Map(dest => dest.OsID, src => src.OsID.Trim().ToLowerInvariant())
            .Map(dest => dest.Username, src => src.Username.Trim().ToLowerInvariant())
            .Map(dest => dest.Hostname, src => src.Hostname.Trim().ToLowerInvariant())
            .Map(dest => dest.IpAddress, src => src.IpAddress != null ? src.IpAddress.Trim().ToLowerInvariant() : null)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.Name)
            .Ignore(dest => dest.Status)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);

        // For - Update existing machine
        config.NewConfig<UpdateMachineDto, Machine>()
            .Ignore(dest => dest.Name)
            .Ignore(dest => dest.Status)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);

        // Mapping to get flow version list
        config.NewConfig<Machine_FlowVersion, AssignFlowVersionDto>()
            .Map(dest => dest.Id, src => src.FlowVersionId)
            .Map(dest => dest.Name, src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : null)
            .Map(dest => dest.MachineId, src => src.MachineId)
            .Map(dest => dest.VersionNumber, src => src.FlowVersion.VersionNumber)
            .Map(dest => dest.IsAssigned, src => true)
            .Map(dest => dest.CreatedBy, src => (string?)null)
            .Map(dest => dest.LastModifiedBy, src => (string?)null)
            .Map(dest => dest.CreatedByUserInitials, src => (string?)null)
            .Map(dest => dest.CreatedOn, src => (DateTimeOffset?)null)
            .Map(dest => dest.LastModifiedOn, src => (DateTimeOffset?)null);

        // New Mapping for Machine to SelectOptionDto(For dropdowns or select lists)
        config.NewConfig<Machine, SelectOptionDto>()
                .Map(dest => dest.Value, src => src.Id)
                .Map(dest => dest.Label, src => src.Name)
                .Map(dest => dest.Description, src => src.Hostname)
                .Map(dest => dest.Disabled, src => src.IsDisabled);
    }
}
