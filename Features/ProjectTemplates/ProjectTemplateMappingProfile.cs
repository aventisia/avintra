namespace WorkspaceAPIs.MappingProfiles;

public class ProjectTemplateMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Request mapping for inserting or updating a Project template record
        config.NewConfig<ProjectTemplateDto, ProjectTemplate>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.RefId)
            .IgnoreNullValues(true);

        // Request mapping for getting Project template record
        config.NewConfig<ProjectTemplate, ProjectTemplateDto>()
            .Map(dest => dest.Resources, src =>  src.TemplateResources.Adapt<IEnumerable<TemplateResourceDto>>());

        // Request mapping for getting Project template record
        config.NewConfig<ProjectTemplate, SearchProjectTemplateDto>();

        config.NewConfig<PublishProjectTemplateDto, ProjectTemplate>();

        // Request mapping for getting  trending flow template record
        config.NewConfig<ProjectTemplate, TrendingTemplateDto>()
            .Map(dest => dest.RefId, src => src.RefId)
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);
    }
}