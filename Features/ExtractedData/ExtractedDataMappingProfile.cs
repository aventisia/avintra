using MLModelBuilderAPIs.DTOs;

namespace MLModelBuilderAPIs.MappingProfiles;

public class ExtractedDataMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extracted data to show on the UI.
        config.NewConfig<ExtractedData, ExtractedDataDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null)
            .Map(dest => dest.Accuracy, src => src.Accuracy != null 
                ? Math.Round(src.Accuracy.Value, 2) : 0)
            .Map(dest => dest.DocName, src => src.UploadedDoc != null ? src.UploadedDoc.Name : null);


        //Mapping entity to insert or update the record
        config.NewConfig<ExtractedDataDto, ExtractedData>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true)
            .Map(dest => dest.Accuracy, src => src.Accuracy != null 
                ? Math.Round(src.Accuracy.Value, 2) : 0);

    }
}