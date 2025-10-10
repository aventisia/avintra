


namespace MLModelBuilderAPIs.MappingProfiles;

public class AIProjecMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of ML model to show on the UI.
        config.NewConfig<AIProject, AIProjectDto>()
        .Map(dest => dest.LLMs, src => GetLlmList(src.Versions))
        // .Map(dest => dest.ExecutionCount,
        //     src => src.ExtractedData != null ? src.ExtractedData.Sum(s => s.ExecutionCount) : 0)
        // .Map(dest => dest.FailedCount,
        //     src => src.ExtractedData != null ? src.ExtractedData.Sum(s => s.FailedCount) : 0)
        // .Map(dest => dest.TokenCount,
        //     src => src.ExtractedData != null ? src.ExtractedData.Sum(s => s.TokenCount) : 0)
        // .Map(dest => dest.ExecutionTime,
        //     src => src.ExtractedData != null ? src.ExtractedData.Sum(s => s.ExecutionTime) : 0)
        // .Map(dest => dest.DocsProcessed,
        //     src => src.ExtractedData != null ? src.ExtractedData.Count : 0)
        .Map(dest => dest.LatestVersionId,
            src => src.Versions != null && src.Versions.Any()
                ? src.Versions.OrderByDescending(v => v.CreatedOn).First().Id
                : Guid.Empty)
        .Map(dest => dest.CreatedBy,
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null);

        //Mapping entity to insert or update the record
        config.NewConfig<AIProjectDto, AIProject>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

    }

    private static List<string> GetLlmList(ICollection<AIProjectVersion>? versions)
    {
        // Return empty list if project bersions is null/empty
        if (versions == null || !versions.Any())
            return new List<string>();

        // Extract list of llm values from all versions
        var llms = versions
            .Where(v => v.Tasks != null)
            .SelectMany(sm => sm.Tasks!)
            .Where(w => !string.IsNullOrEmpty(w.LLM))
            .Select(s => s.LLM!)
            .ToList();

        return llms;
    }

}