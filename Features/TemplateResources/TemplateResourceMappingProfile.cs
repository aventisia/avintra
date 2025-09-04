namespace WorkspaceAPIs.MappingProfiles;

public class TemplateResourceMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of TemplateResources to show on the UI.
        config.NewConfig<TemplateResource, TemplateResourceDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName : null);

        config.NewConfig<TemplateResource, TemplateResourceFileDto>();

        // Mapping of DTO for inserting TemplateResource. Note: Update mapping is manual.
        config.NewConfig<TemplateResourceDto, TemplateResource>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}