namespace WorkspaceAPIs.MappingProfiles;

public class ProjectsTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get project list of project records
        config.NewConfig<Project, ProjectsTableDto>()
            .Map(dest => dest.FlowCount, 
                src => src.Flows != null
                    ? src.Flows.Count
                    : 0)
            .Map(dest => dest.CreatedBy, 
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy, 
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating project record
        config.NewConfig<ProjectsTableDto, Project>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.IsDisabled)
            .IgnoreNullValues(true);
    }
}