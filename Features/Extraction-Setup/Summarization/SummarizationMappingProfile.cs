
namespace MLModelBuilderAPIs.MappingProfiles;

public class SummarizationMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extraction setup to show on the UI.
        config.NewConfig<MLModel, SummarizationDto>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Deserialize<SummarizationSetupDto>(
                src.SetupObject, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }))
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null);

        // Mapping DTO to Entity for insert or update
        config.NewConfig<SummarizationDto, MLModel>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Serialize(src.SetupObject, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.Name)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn);
            
        // Mapping of DTO to get list of extracted data.
        config.NewConfig<ExtractedData, SummarizationExtractedDataDto>()
            .Map(dest => dest.ExtractedData, src => JsonSerializer.Deserialize<SummarizationSetupData>(
                src.DataObject, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }))
            .Map(dest => dest.DocName,
                src => src.UploadedDoc != null
                ? src.UploadedDoc.Name
                : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null);

        // Mapping of DTO to get list of extracted review data.
        config.NewConfig<ExtractedData, SummarizationReviewDataDto>()
            .Map(dest => dest.Columns, src => DeserializeSummarizationSetupDto(src.DataObject))
            .Map(dest => dest.DocName,
                src => src.UploadedDoc != null
                ? src.UploadedDoc.Name
                : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null);
    }

    // Deserializes a JSON string into a SummarizationSetupData object,
    private static Dictionary<string, string>? DeserializeSummarizationSetupDto(string dataObject)
    {
        // Attempt to deserialize the input JSON string into a SummarizationSetupData object.
        // PropertyNameCaseInsensitive allows matching JSON keys regardless of casing.
        var extractedData = JsonSerializer.Deserialize<SummarizationSetupData>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // If deserialization fails or the Summary property is null, return null.
        if (extractedData == null || extractedData?.Summary == null)
            return null;

        // Return a dictionary containing the "Summary" property from the deserialized object.
        return new Dictionary<string, string>
        {
            { "Summary", extractedData.Summary }
        };
    }
}