
namespace MLModelBuilderAPIs.MappingProfiles;

public class AIPersonaMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extraction setup to show on the UI.
        config.NewConfig<MLModel, AIPersonaDto>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Deserialize<AIPersonaSetupDto>(
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
        config.NewConfig<AIPersonaDto, MLModel>()
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
        config.NewConfig<ExtractedData, AIPersonaExtractedDataDto>()
            .Map(dest => dest.ExtractedData, src => !string.IsNullOrEmpty(src.DataObject) ? JsonSerializer.Deserialize<AIPersonaSetupData>(
                src.DataObject, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) : null)
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

        config.NewConfig<AIPersonaExtractedDataDto, ExtractedData>()
            .Map(dest => dest.DataObject, src => JsonSerializer.Serialize(src.ExtractedData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.MLModelId)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.DocId)
            .IgnoreNullValues(true);

        // Mapping of DTO to get list of extracted review data.
        config.NewConfig<ExtractedData, AIPersonaReviewDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeAIPersonaSetupDto(src.DataObject) : null)
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

        // Mapping of DTO to get list of fine tuning data.
        config.NewConfig<ExtractedData, AIPersonaFineTuningDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeAIPersonaSetupDto(src.DataObject) : null)
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

    // Deserializes a JSON string into a list of AIPersonaSetupData objects and converts it into a list of ColumnsDto objects
    private static List<ColumnsDto>? DeserializeAIPersonaSetupDto(string dataObject)
    {
        // Deserialize the JSON string into a AIPersonaSetupData object with case-insensitive property matching.
        var extractedData = JsonSerializer.Deserialize<AIPersonaSetupData>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // Return null if deserialization fails or if the "Summary" property is missing.
        if (extractedData?.Data == null)
            return null;

        // Create a ColumnsDto with the "Summary" value and return it in a list.
        return new List<ColumnsDto>
    {
        new ColumnsDto { Name = "Summary", Value = extractedData.Data }
    };
    }
}