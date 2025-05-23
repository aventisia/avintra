
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

    // Deserializes a JSON string representing a list of QuestionAnswerSetupData objects, and returns a dictionary mapping each Question to its corresponding Answer.
    private static Dictionary<string, string>? DeserializeQuestionAnswerSetupDto(string dataObject)
    {
        // Deserialize the input JSON string into a list of QuestionAnswerSetupData objects.
        // Case-insensitive deserialization ensures matching JSON keys regardless of casing.
        var extractedData = JsonSerializer.Deserialize<List<QuestionAnswerSetupData>>(
            dataObject,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        // If deserialization fails or the resulting list is empty, return null.
        if (extractedData == null || !extractedData.Any())
            return null;

        // Convert the list into a dictionary using Question as the key and Answer as the value.
        // The null-forgiving operator (!) is used because null has already been checked above.
        return extractedData.ToDictionary(s => s.Question, s => s.Answer)!;
    }
}