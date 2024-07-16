namespace WorkspaceAPIs.MappingProfiles;

public class ProjectsTableMappingProfile : Profile
{
    public ProjectsTableMappingProfile()
    {
        // Mapping to get project list of project records
        CreateMap<Project, ProjectsTableDto>()
            .ForMember(dest => dest.FlowCount, opt => opt.MapFrom(src => src.Flows.Count))
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName))
            .ForMember(dest => dest.LastModifiedBy, opt => opt.MapFrom(src => src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName));

        // Mapping for inserting or updating project record
        CreateMap<ProjectsTableDto, Project>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
            .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
            .ForMember(dest => dest.IsDisabled, opt => opt.Ignore())
            .ForAllMembers(x => x.Condition((src, dest, srcMember) => srcMember != null));
    }
}