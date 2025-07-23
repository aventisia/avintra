

namespace MLModelBuilderAPIs.MappingProfiles;

public class MLModelTemplateMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of ML model template to show on the UI.
        config.NewConfig<MLModelTemplate, MLModelTemplateDto>()
            .Map(dest => dest.Name, src => src.MLModelVersion.MLModel != null ? src.MLModelVersion.MLModel.Name : null)
            .Map(dest => dest.Type, src => src.MLModelVersion.MLModel != null ? src.MLModelVersion.MLModel.Type : null)
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        config.NewConfig<MLModelTemplate, TrendingMLModelTemplateDto>()
            .Map(dest => dest.Name, src => src.MLModelVersion.MLModel != null ? src.MLModelVersion.MLModel.Name : null)
            .Map(dest => dest.Type, src => src.MLModelVersion.MLModel != null ? src.MLModelVersion.MLModel.Type : null)
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);


        //Mapping entity to insert or update the record
        config.NewConfig<MLModelTemplateDto, MLModelTemplate>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}