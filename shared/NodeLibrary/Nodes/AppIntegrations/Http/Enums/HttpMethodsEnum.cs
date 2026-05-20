namespace NodeLibrary.HttpNodes.Enums;

public enum HttpMethodsEnum
{
    [Display(Name = "GET", Description = "Retrieves data from the specified resource.")]
    GET,

    [Display(Name = "POST", Description = "Submits data to be processed to the specified resource.")]
    POST,

    [Display(Name = "PUT", Description = "Updates a current resource with new data.")]
    PUT,

    [Display(Name = "DELETE", Description = "Deletes the specified resource.")]
    DELETE,

    [Display(Name = "PATCH", Description = "Applies partial modifications to a resource.")]
    PATCH
}
