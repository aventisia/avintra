namespace WorkspaceAPIs.MappingProfiles;

public class WorcTemplateMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Request mapping for inserting or updating a worc template record
        config.NewConfig<WorcTemplateDto, WorcTemplate>()
        .Ignore(dest => dest.Id)
        .IgnoreNullValues(true);

        //Request mapping for publishing flow as a template record
        config.NewConfig<FlowVersion, WorcTemplate>()
        .Map(dest => dest.RefId, src => src.Id)
        .IgnoreNullValues(true);

        // Request mapping for getting worc template record
        config.NewConfig<WorcTemplate, WorcTemplateDto>();

        // Request mapping for getting worc template record
        config.NewConfig<WorcTemplate, SearchWorcTemplateDto>();

        config.NewConfig<TrendingTemplateDto, Flow>()
            .Ignore(dest => dest.Id)
            .IgnoreNullValues(true);

        config.NewConfig<TrendingTemplateDto, FlowVersion>()
            .Ignore(dest => dest.Id)
            .IgnoreNullValues(true);
            
        // Request mapping for getting  trending flow template record
        config.NewConfig<WorcTemplate, TrendingTemplateDto>()
            .Map(dest => dest.RefId, src => src.RefId)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername,
                src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        // Request mapping for getting  trending flow template record
        config.NewConfig<FlowVersion, TrendingTemplateDto>()
            .Map(dest => dest.RefId, src => src.FlowId)
            .Map(dest => dest.Name, src => src.Flow.Name)
            .Map(dest => dest.Description, src => src.Flow.Description)
            .Map(dest => dest.Type, src => src.Flow.Type)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername,
                src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        // Request mapping for getting worc template record by category and name
        config.NewConfig<WorcTemplate, WorcTemplateCategoryBySearchQueryDto>();

    }
}