
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
            .Map(dest => dest.ExtractedData, src => !string.IsNullOrEmpty(src.DataObject) ? JsonSerializer.Deserialize<ExtractionSetupData>(
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

        config.NewConfig<ExtractedDataResponseDto, ExtractedData>()
            .Map(dest => dest.DataObject, src => JsonSerializer.Serialize(src.ExtractedData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.MLModelId)
            .Ignore(dest => dest.DocId)
            .Ignore(dest => dest.ExecutionCount)
            .Ignore(dest => dest.TokenCount)
            .Ignore(dest => dest.FailedCount)
            .IgnoreNullValues(true);
            
        // Mapping of DTO to get list of extracted review data.
        config.NewConfig<ExtractedData, ExtractionReviewDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeExtractionSetupDto(src.DataObject) : null)
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
        config.NewConfig<ExtractedData, ExtractionFineTuningDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeExtractionSetupDto(src.DataObject) : null)
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

    // Deserializes a JSON string into an ExtractionSetupData object and converts its fields into a list of ColumnsDto, where each item contains a field name and its corresponding value.
    private static List<ColumnsDto>? DeserializeExtractionSetupDto(string dataObject)
    {
        // Deserialize the JSON string into an ExtractionSetupData object with case-insensitive property matching.
        var extractedData = JsonSerializer.Deserialize<ExtractionSetupData>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // Return null if deserialization fails or if the Fields property is null.
        if (extractedData == null || extractedData.Fields == null)
            return null;

        // Map each field to a ColumnsDto object and return the list.
        return extractedData.Fields.Select(s => new ColumnsDto
        {
            Name = s.Name,
            Value = s.Value
        }).ToList();
    }
}