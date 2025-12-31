


namespace MLModelBuilderAPIs.MappingProfiles;

public class InferencingModelMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AIProject, InferencingModelDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null);

        config.NewConfig<VersionTask, DefaultModelSetupDto>();

        config.NewConfig<DefaultModelSetupDto, VersionTask>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);


        // Mapping DTO to Entity for insert or update
        config.NewConfig<InferencingModelDto, AIProject>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.Name)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn);

        config.NewConfig<TaskSetupCategoryDto, ClassificationTaskExtractedDataDto>();
        config.NewConfig<TaskSetupCategoryDto, SentimentAnalysisExtractedDataDto>();

        config.NewConfig<ExtractedData, InferencingModelExtractedDataDetailDto>()
            .Map(dest => dest.Id, src => src.AIProjectVersionId)
            .Map(dest => dest.DocId, src => src.VersionResourceId)
            .Map(dest => dest.DocName, src => src.VersionResource.Name)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null);
    }
}