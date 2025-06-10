
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
            .Ignore(dest => dest.ExecutionCount)
            .Ignore(dest => dest.TokenCount)
            .Ignore(dest => dest.FailedCount)
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
            .Map(dest => dest.ScheduledOn,
                    src => src.ScheduledModels != null && src.ScheduledModels.Any()
                        ? (DateTimeOffset?)src.ScheduledModels.First().ScheduledAt
                : null)
            .Map(dest => dest.DocName,
                src => src.UploadedDoc != null
                ? src.UploadedDoc.Name
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

        // Mapping of DTO to get list of fine tuning data.
        config.NewConfig<FineTuningLog, FineTuningHistoryDto>()
            .Map(dest => dest.Version, src => src.ScheduledModel != null ? 1 : 0)
            .Map(dest => dest.ScheduledOn, src => src.ScheduledModel != null ? src.ScheduledModel.ScheduledAt : (DateTime?)null)
            .Map(dest => dest.Accuracy, src => src.ScheduledModel != null && src.ScheduledModel.MLModel != null ? src.ScheduledModel.MLModel.Accuracy : 0)
            .Map(dest => dest.Duration, src => src.EndedOn.HasValue ? (double?)(src.EndedOn.Value - src.StartedOn).TotalSeconds : null)
            .Map(dest => dest.FineTunedOn, src => src.EndedOn.HasValue ? src.StartedOn : (DateTime?)null)
            .Map(dest => dest.MLModelId, src => src.ScheduledModel != null ? src.ScheduledModel.MLModelId : Guid.Empty);
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