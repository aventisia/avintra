namespace WorkspaceAPIs.MappingProfiles;

public class MachinesMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get machine list of machine records
        config.NewConfig<Machine, ProjectsTableDto>()
            .Map(dest => dest.CreatedBy, 
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy, 
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating project record
        config.NewConfig<MachineDto, Machine>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}