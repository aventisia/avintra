

namespace MLModelBuilderAPIs.MappingProfiles;

public class AIProjectVersionMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of ML model to show on the UI.
        config.NewConfig<AIProjectVersion, AIProjectVersionDto>()
        .Map(dest => dest.Name, src => src.AIProject != null ? src.AIProject.Name : null)
        .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        //Mapping entity to insert or update the record
        config.NewConfig<AIProjectVersionDto, AIProjectVersion>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.VersionNumber)
            .IgnoreNullValues(true);
    }
}