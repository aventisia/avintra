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
        .Map(dest => dest.FlowVersionId, src => src.Id)
        .IgnoreNullValues(true);

        // Request mapping for getting worc template record
        config.NewConfig<WorcTemplate, WorcTemplateDto>();

        // Request mapping for getting worc template record
        config.NewConfig<WorcTemplate, SearchWorcTemplateDto>();

        // Request mapping for getting  trending flow template record
        config.NewConfig<WorcTemplate, TrendingWorcTemplateDto>();

        // Request mapping for getting worc template record by category and name
        config.NewConfig<WorcTemplate, WorcTemplateCategoryBySearchQueryDto>();

    }
}