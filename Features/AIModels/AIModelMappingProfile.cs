namespace MLModelBuilderAPIs.MappingProfiles;

public class AIModelMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Create a new mapping configuration from MLModel to AIModelDto.
        // This allows automatic property mapping between the two types.
        config.NewConfig<MLModel, AIModelDto>();
    }
}
