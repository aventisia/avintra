namespace NodeLibrary.DataTableNodes.Enums;

/// <summary>
/// Case-conversion options used by data cleansing and text normalization nodes.
/// </summary>
public enum CleanseCaseEnum
{
    [Display(Name = "None", Description = "Leaves the text casing unchanged.")]
    None = 0,

    [Display(Name = "Lowercase", Description = "Converts all characters to lowercase.")]
    Lowercase = 1,

    [Display(Name = "Uppercase", Description = "Converts all characters to uppercase.")]
    Uppercase = 2,

    [Display(Name = "Title Case", Description = "Capitalizes the first letter of each word.")]
    TitleCase = 3
}
