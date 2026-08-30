namespace NodeLibrary.CryptographyNodes.Enums;

public enum EncodingFormatEnum
{
    [Display(Name = "Base64", Description = "Base64 encoding")]
    Base64 = 0,

    [Display(Name = "Hex", Description = "Hexadecimal encoding")]
    Hex = 1,

    [Display(Name = "UTF8", Description = "UTF-8 encoding")]
    Utf8 = 2
}
