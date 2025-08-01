namespace MLModelBuilderAPIs.Services;

public interface IConversationModelService
{
    /// <summary>
    /// Gets the model setup for a specific conversation model using its unique ML model ID.
    /// </summary>
    /// <param name="mlModelId">The unique ID of the ML model to fetch the setup for.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the model setup DTO for the specified ML model.</returns>
    Task<ServiceResponse<ConversationModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates the configuration for an conversation model setup.
    /// </summary>
    /// <param name="modelSetupDto">The new setup configuration to be applied to the conversation model.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the updated model setup DTO.</returns>
    Task<ServiceResponse<ConversationModelDto>> UpdateSetupAsync(ConversationModelDto modelSetupDto);

    /// <summary>
    /// Retrieves a list of available languages, each with associated voices. 
    /// This method returns the supported languages along with their corresponding voice options.
    /// </summary>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of SelectOptionDto objects, 
    /// each representing a language with a list of voices.
    /// </returns>
    ServiceResponse<IEnumerable<SelectOptionDto>> GetLanguageOptions();

    /// <summary>
    /// Retrieves a list of available languages. 
    /// This method returns the supported languages options.
    /// </summary>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of SelectOptionDto options.
    /// </returns>
    ServiceResponse<IEnumerable<SelectOptionDto>> GetAvailableLanguageOptions();

    /// <summary>
    /// Retrieves a list of voice options available for a specific language. 
    /// This method returns the voices that are supported for the provided language name.
    /// </summary>
    /// <param name="language">The name of the language for which voice options are to be retrieved.</param>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of SelectOptionDto objects, 
    /// each representing a voice option for the given language.
    /// </returns>
    ServiceResponse<IEnumerable<SelectOptionDto>> GetVoiceOptionsByLanguageName(string language);

    /// <summary>
    /// Retrieves a list of available Speech-to-Text options for a specific language.
    /// This method returns Speech-to-Text services with descriptions of their capabilities and processing.
    /// </summary>
    /// <param name="language">The name or code of the language to filter Speech-to-Text services.</param>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of SelectOptionDto objects,
    /// each representing a Speech-to-Text service with its description.
    /// </returns>
    ServiceResponse<IEnumerable<SelectOptionDto>> GetAvailableSpeechToTextOptions(string language);

    /// <summary>
    /// Retrieves a list of available voice options for a given Text-to-Speech service.
    /// This method returns all voices associated with the specified TTS service across supported languages,
    /// including details such as voice name and gender.
    /// </summary>
    /// <param name="serviceName">The name of the Text-to-Speech service (e.g., "Google TTS Wavenet").</param>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of SelectOptionDto objects,
    /// each representing a voice option available under the specified TTS service.
    /// </returns>
    ServiceResponse<IEnumerable<SelectOptionDto>> GetAvailableTextToSpeechVoicesOptions(string serviceName);

    /// <summary>
    /// Retrieves a list of available Text-to-Speech options for a specific language.
    /// This method returns Text-to-Speech services with descriptions of their capabilities and processing features.
    /// </summary>
    /// <param name="language">The name of the language to filter Text-to-Speech services.</param>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of SelectOptionDto objects,
    /// each representing a Text-to-Speech service with its description.
    /// </returns>
    ServiceResponse<IEnumerable<SelectOptionDto>> GetAvailableTextToSpeechOptions(string language);
}