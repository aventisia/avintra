
namespace MLModelBuilderAPIs.MappingProfiles;

public class QuestionAnswerMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extraction setup to show on the UI.
        config.NewConfig<MLModel, QuestionAnswerDto>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Deserialize<QuestionAnswerSetupDto>(
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
        config.NewConfig<QuestionAnswerDto, MLModel>()
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
        config.NewConfig<ExtractedData, QuestionAnswerExtractedDataDto>()
            .Map(dest => dest.ExtractedData, src => JsonSerializer.Deserialize<List<QuestionAnswerSetupData>>(
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

        config.NewConfig<QuestionAnswerExtractedDataDto, ExtractedData>()
            .Map(dest => dest.DataObject, src => JsonSerializer.Serialize(src.ExtractedData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.MLModelId)
            .Ignore(dest => dest.DocId)
            .IgnoreNullValues(true);

        // Mapping of DTO to get list of extracted review data.
        config.NewConfig<ExtractedData, QuestionAnswerReviewDataDto>()
            .Map(dest => dest.Columns, src => DeserializeQuestionAnswerSetupDto(src.DataObject))
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

    // Deserializes a JSON string into a list of QuestionAnswerSetupData objects and converts it into a list of ColumnsDto objects
    private static List<ColumnsDto>? DeserializeQuestionAnswerSetupDto(string dataObject)
    {
        // Deserialize the JSON string into a list of QuestionAnswerSetupData objects with case-insensitive key matching.
        var extractedData = JsonSerializer.Deserialize<List<QuestionAnswerSetupData>>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // Return null if deserialization fails or the list is empty.
        if (extractedData == null || !extractedData.Any())
            return null;

        // Convert the list of QuestionAnswerSetupData to a list of ColumnsDto, 
        // mapping each Question to its corresponding Answer.
        return extractedData.Select(s => new ColumnsDto
        {
            Name = s.Question,
            Value = s.Answer
        }).ToList();
    }
}