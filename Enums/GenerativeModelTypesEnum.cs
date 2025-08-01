
namespace AspNetToolkit.Enums;

/// <summary>
/// Defines the different types of generative models.
/// Each type corresponds to a specific task or purpose that the generative model is designed to fulfill.
/// </summary>
public enum GenerativeModelTypesEnum
{
    /// <summary>
    /// Thought Leadership model type for generating insights, articles, and high-level content for establishing expertise.
    /// </summary>
    [Description("Thought Leadership")]
    ThoughtLeadership,

    /// <summary>
    /// Company Deep Dive model type for generating in-depth research and analysis about a particular company.
    /// </summary>
    [Description("Company Deep Dive")]
    CompanyDeepDive,

    /// <summary>
    /// Persona Research model type used for generating research reports or insights about a particular persona or target audience.
    /// </summary>
    [Description("Persona Research")]
    PersonaResearch,

    /// <summary>
    /// RFP/RPI Response Generator model type designed to automatically generate responses to Request For Proposals (RFP) or Request for Information (RPI).
    /// </summary>
    [Description("RFP/RPI Response Generator")]
    RFPResponseGenerator,

    /// <summary>
    /// Document Drafting model type for generating initial drafts of documents such as reports, proposals, and other business documents.
    /// </summary>
    [Description("Document Drafting")]
    DocumentDrafting
}
