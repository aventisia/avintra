
namespace MLModelBuilderAPIs.MappingProfiles;

public class ExtractionSetupMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extraction setup to show on the UI.
        config.NewConfig<MLModel, MLModelSetupDto>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Deserialize<ExtractionSetupDto>(
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
        config.NewConfig<MLModelSetupDto, MLModel>()
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
        config.NewConfig<ExtractedData, ExtractedDataResponseDto>()
            .Map(dest => dest.ExtractedData, src => JsonSerializer.Deserialize<ExtractionSetupData>(
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
        config.NewConfig<ExtractedData, ExtractionReviewDataDto>()
            .Map(dest => dest.Columns, src => DeserializeExtractionSetupDto(src.DataObject))
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

    // Deserializes a JSON string into an ExtractionSetupData object, and returns a dictionary containing field names and values if present.
    private static Dictionary<string, string>? DeserializeExtractionSetupDto(string dataObject)
    {
        // Attempt to deserialize the input JSON string into an ExtractionSetupData object.
        // Case-insensitive property matching is enabled for flexibility with JSON input.
        var extractedData = JsonSerializer.Deserialize<ExtractionSetupData>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // If deserialization fails or the Fields property is null, return null.
        if (extractedData == null || extractedData.Fields == null)
            return null;

        // Convert the list of fields into a dictionary using Name as the key and Value as the value.
        // The null-forgiving operator (!) is used here since we've already checked for null.
        return extractedData.Fields.ToDictionary(s => s.Name, s => s.Value)!;
    }
}