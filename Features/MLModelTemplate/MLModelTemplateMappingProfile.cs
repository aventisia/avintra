

namespace MLModelBuilderAPIs.MappingProfiles;

public class MLModelTemplateMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of ML model template to show on the UI.
        config.NewConfig<MLModelTemplate, MLModelTemplateDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        config.NewConfig<MLModelTemplate, TrendingTemplateDto>()
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        config.NewConfig<AIProject, TrendingTemplateDto>()
            .Map(dest => dest.RefId, src => src.Id)
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        config.NewConfig<InferencingModelDto, InferencingModelTemplateDto>()
            .AfterMapping((src, dest) =>
            {
                if (!dest.Summarization.IsBYOKEnabled)
                    dest.Summarization.CredentialId = null;

                if (!dest.Classification.IsBYOKEnabled)
                    dest.Summarization.CredentialId = null;

                if (!dest.SentimentAnalytics.IsBYOKEnabled)
                    dest.Summarization.CredentialId = null;

                if (!dest.Extraction.IsBYOKEnabled)
                    dest.Summarization.CredentialId = null;

                if (!dest.QuestionAnswer.IsBYOKEnabled)
                    dest.Summarization.CredentialId = null;
            });


        //Mapping entity to insert or update the record
        config.NewConfig<MLModelTemplateDto, MLModelTemplate>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}