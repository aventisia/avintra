

namespace MLModelBuilderAPIs.MappingProfiles;

public class MLModelMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of ML model to show on the UI.
        config.NewConfig<MLModel, MLModelDto>()
        .Map(dest => dest.LLMs, src => GetLlmList(src))
        .Map(dest => dest.ExecutionCount,
            src => src.ExtractedData != null ? src.ExtractedData.Sum(s => s.ExecutionCount) : 0)
        .Map(dest => dest.FailedCount,
            src => src.ExtractedData != null ? src.ExtractedData.Sum(s => s.FailedCount) : 0)
        .Map(dest => dest.TokenCount,
            src => src.ExtractedData != null ? src.ExtractedData.Sum(s => s.TokenCount) : 0)
        .Map(dest => dest.ExecutionTime,
            src => src.ExtractedData != null ? src.ExtractedData.Sum(s => s.ExecutionTime) : 0)
        .Map(dest => dest.DocsProcessed,
            src => src.ExtractedData != null ? src.ExtractedData.Count : 0)
        .Map(dest => dest.CreatedBy,
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null);

        //Mapping entity to insert or update the record
        config.NewConfig<MLModelDto, MLModel>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.SetupStatus)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

    }

    private static List<string>? GetLlmList(MLModel src)
    {
        return src.Type switch
        {
            ModelTypesEnum.Inferencing => src.Tasks?.Select(t => t.LLM).Distinct().ToList(),
            ModelTypesEnum.Conversation => new List<string> { src.ConversationalModel?.LLM },
            ModelTypesEnum.Generative => new List<string> { src.GenerativeModel?.LLM },
            _ => null
        };
    }
}