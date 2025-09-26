

namespace MLModelBuilderAPIs.MappingProfiles;

public class AIProjectUserMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of ML model to show on the UI.
        config.NewConfig<AIProject_User, AIProjectUserDto>()
            .Map(dest => dest.MLModelId, src => src.AIProjectId)
            .Map(dest => dest.UserFullName, src => src.User != null ? src.User.FirstName + " " + src.User.LastName : null)
            .Map(dest => dest.UserName, src => src.User != null ? src.User.UserName : null)
            .Map(dest => dest.AvatarSrc, src => src.User != null ? src.User.AvatarSrc : null)
            .Map(dest => dest.Initials, src => src.User != null ? src.User.FirstName.Substring(0, 1) + src.User.LastName.Substring(0, 1) : null);

        //Mapping entity to insert or update the record
        config.NewConfig<AIProjectUserDto, AIProject_User>()
            .Map(dest => dest.AIProjectId, src => src.MLModelId)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}