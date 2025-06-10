
namespace MLModelBuilderAPIs.MappingProfiles;

public class SentimentAnalyticsMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extraction setup to show on the UI.
        config.NewConfig<MLModel, SentimentAnalyticDto>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Deserialize<SentimentAnalyticSetupDto>(
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
        config.NewConfig<SentimentAnalyticDto, MLModel>()
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
        config.NewConfig<ExtractedData, SentimentAnalyticsExtractedDataDto>()
            .Map(dest => dest.ExtractedData, src => !string.IsNullOrEmpty(src.DataObject) ? JsonSerializer.Deserialize<List<SentimentAnalyticsSetupData>>(
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

        config.NewConfig<SentimentAnalyticsExtractedDataDto, ExtractedData>()
            .Map(dest => dest.DataObject, src => JsonSerializer.Serialize(src.ExtractedData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.MLModelId)
            .Ignore(dest => dest.DocId)
            .Ignore(dest => dest.ExecutionCount)
            .Ignore(dest => dest.ExecutionTime)            .Ignore(dest => dest.TokenCount)
            .Ignore(dest => dest.FailedCount)
            .IgnoreNullValues(true);

        // Mapping of DTO to get list of extracted review data.
        config.NewConfig<ExtractedData, SentimentAnalyticsReviewDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeSentimentAnalyticsSetupDto(src.DataObject) : null)
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
        config.NewConfig<ExtractedData, SentimentAnalyticsFineTuningDataDto>()
            .Map(dest => dest.Columns, src => !string.IsNullOrEmpty(src.DataObject) ? DeserializeSentimentAnalyticsSetupDto(src.DataObject) : null)
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

    // Deserializes a JSON string into a list of SentimentAnalyticsSetupData objects and converts it into a list of ColumnsDto objects
    private static List<ColumnsDto>? DeserializeSentimentAnalyticsSetupDto(string dataObject)
    {
        // Deserialize the JSON string into a list of SentimentAnalyticsSetupData objects.
        var extractedData = JsonSerializer.Deserialize<List<SentimentAnalyticsSetupData>>(
            dataObject,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // If deserialization fails or the list is empty, return null.
        if (extractedData == null || !extractedData.Any())
            return null;

        // Convert the deserialized data into a list of ColumnsDto objects.
        return extractedData.Select(s => new ColumnsDto
        {
            Name = s.Name,
            Value = s.Value
        }).ToList();
    }
}