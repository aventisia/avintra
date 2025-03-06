namespace MLModelBuilderAPIs.MappingProfiles;

public class AnnotationDataMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of fields to show on the UI.
        config.NewConfig<AnnotationData, AnnotationDataDto>()
        .Map(dest => dest.CreatedBy, 
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null);

        //Mapping entity to insert or update the record
        config.NewConfig<AnnotationDataDto, AnnotationData>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

    }
}