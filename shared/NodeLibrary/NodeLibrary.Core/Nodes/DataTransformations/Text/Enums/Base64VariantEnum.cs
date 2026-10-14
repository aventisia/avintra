namespace NodeLibrary.TextNodes.Enums;

/// <summary>Base64 alphabet variants accepted or produced by the Base64 text nodes.</summary>
public enum Base64VariantEnum
{
    [Display(Name = "Standard", Description = "Standard Base64 alphabet (A-Z, a-z, 0-9, '+' and '/') with '=' padding.")]
    Standard = 0,

    [Display(Name = "URL-safe", Description = "URL-safe Base64 alphabet ('-' and '_' in place of '+' and '/'), without '=' padding.")]
    UrlSafe = 1,

    [Display(Name = "Auto", Description = "Decode-only: accepts both alphabets; on encode behaves as Standard.")]
    Auto = 2
}
