using MLModelBuilderAPIs.DTOs;

namespace MLModelBuilderAPIs.MappingProfiles;

public class ModelBuilderUserMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Get record
        config.NewConfig<ModelBuilderUser, ModelBuilderUserDto>();

        // Mapping for inserting or updating model builder user record
        config.NewConfig<ModelBuilderUserDto, ModelBuilderUser>();
    }
}