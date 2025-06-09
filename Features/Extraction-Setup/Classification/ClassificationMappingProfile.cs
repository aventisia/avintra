
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
            .Map(dest => dest.ExtractedData, src => !string.IsNullOrEmpty(src.DataObject) ? JsonSerializer.Deserialize<List<ClassificationSetupData>>(
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

        config.NewConfig<ClassificationExtractedDataDto, ExtractedData>()
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
        config.NewConfig<ExtractedData, ClassificationReviewDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeClassificationSetupDto(src.DataObject) : null)
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
        config.NewConfig<ExtractedData, ClassificationFineTuningDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeClassificationSetupDto(src.DataObject) : null)
            .Map(dest => dest.ScheduledOn,
                    src => src.ScheduledModels != null && src.ScheduledModels.Any()
                        ? (DateTimeOffset?)src.ScheduledModels.First().ScheduledAt
                : null)
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

    // Deserializes a JSON string into a list of ClassificationSetupData objects and converts it into a list of ColumnsDto, where each Name is mapped to its corresponding Value.
    private static List<ColumnsDto>? DeserializeClassificationSetupDto(string dataObject)
    {
        // Deserialize the JSON string into a list of ClassificationSetupData objects with case-insensitive key matching.
        var extractedData = JsonSerializer.Deserialize<List<ClassificationSetupData>>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // Return null if deserialization fails or the list is empty.
        if (extractedData == null || !extractedData.Any())
            return null;

        // Map each item to a ColumnsDto using Name as the key and Value as the value.
        return extractedData.Select(s => new ColumnsDto
        {
            Name = s.Name,
            Value = s.Value
        }).ToList();
    }
}