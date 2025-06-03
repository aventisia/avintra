
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
            .Map(dest => dest.ExtractedData, src => !string.IsNullOrEmpty(src.DataObject) ? JsonSerializer.Deserialize<SummarizationSetupData>(
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

        config.NewConfig<SummarizationExtractedDataDto, ExtractedData>()
            .Map(dest => dest.DataObject, src => JsonSerializer.Serialize(src.ExtractedData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.MLModelId)
            .Ignore(dest => dest.DocId)
            .IgnoreNullValues(true);

        // Mapping of DTO to get list of extracted review data.
        config.NewConfig<ExtractedData, SummarizationReviewDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeSummarizationSetupDto(src.DataObject) : null)
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
        config.NewConfig<ExtractedData, SummarizationFineTuningDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeSummarizationSetupDto(src.DataObject) : null)
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

    // Deserializes a JSON string into a list of SummarizationSetupData objects and converts it into a list of ColumnsDto objects
    private static List<ColumnsDto>? DeserializeSummarizationSetupDto(string dataObject)
    {
        // Deserialize the JSON string into a SummarizationSetupData object with case-insensitive property matching.
        var extractedData = JsonSerializer.Deserialize<SummarizationSetupData>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // Return null if deserialization fails or if the "Summary" property is missing.
        if (extractedData?.Summary == null)
            return null;

        // Create a ColumnsDto with the "Summary" value and return it in a list.
        return new List<ColumnsDto>
    {
        new ColumnsDto { Name = "Summary", Value = extractedData.Summary }
    };
    }
}