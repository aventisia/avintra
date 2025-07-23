

namespace MLModelBuilderAPIs.MappingProfiles;

public class MLModelVersionMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of ML model to show on the UI.
        config.NewConfig<MLModelVersion, MLModelVersionDto>()
        .Map(dest => dest.Name, src => src.MLModel != null ? src.MLModel.Name : null)
        .Map(dest => dest.Type, src => src.MLModel != null ? src.MLModel.Type : null)
        .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        //Mapping entity to insert or update the record
        config.NewConfig<MLModelVersionDto, MLModelVersion>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}