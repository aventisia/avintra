namespace MLModelBuilderAPIs.MappingProfiles;

public class AIModelMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Create a new mapping configuration from MLModel to AIModelDto.
        // This allows automatic property mapping between the two types.
        config.NewConfig<AIProjectVersion, AIModelDto>()
            .Map(dest => dest.Name, src => src.AIProject.Name)
            .Map(dest => dest.Type, src => src.AIProject.Type)
            .Map(dest => dest.Description, src => src.AIProject.Description)
            .Map(dest => dest.LLMs, src => src.Tasks.Select(s=>s.LLM).Distinct().ToList());
    }
}
