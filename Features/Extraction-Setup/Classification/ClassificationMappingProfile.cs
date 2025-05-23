
namespace MLModelBuilderAPIs.MappingProfiles;

public class ClassificationMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extraction setup to show on the UI.
        config.NewConfig<MLModel, ClassificationDto>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Deserialize<ClassificationSetupDto>(
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
        config.NewConfig<ClassificationDto, MLModel>()
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
        config.NewConfig<ExtractedData, ClassificationExtractedDataDto>()
            .Map(dest => dest.ExtractedData, src => JsonSerializer.Deserialize<List<ClassificationSetupData>>(
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
        config.NewConfig<ExtractedData, ExtractedReviewDataDto>()
            .Map(dest => dest.Columns, src => DeserializeClassificationSetupDto(src.DataObject))
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

    // Deserializes a JSON string representing a list of ClassificationSetupData objects, and returns a dictionary mapping each Name to its corresponding Value.
    private static Dictionary<string, string>? DeserializeClassificationSetupDto(string dataObject)
    {
        // Deserialize the input JSON string into a list of ClassificationSetupData objects.
        // PropertyNameCaseInsensitive enables case-insensitive property name matching during deserialization.
        var extractedData = JsonSerializer.Deserialize<List<ClassificationSetupData>>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // Corrected: Check if extractedData is null or empty.
        if (extractedData == null || !extractedData.Any())
            return null;

        // Convert the list into a dictionary using Name as the key and Value as the value.
        return extractedData.ToDictionary(s => s.Name, s => s.Value)!;
    }
}