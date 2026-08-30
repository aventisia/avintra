namespace NodeLibrary.HttpNodes.Enums;

public enum AuthenticationTypeEnum
{
    [Display(Name = "None", Description = "No authentication.")]
    None,

    [Display(Name = "Basic", Description = "Uses Basic authentication with username and password.")]
    Basic,

    [Display(Name = "Bearer", Description = "Uses Bearer token authentication for OAuth 2.0.")]
    Bearer
}
