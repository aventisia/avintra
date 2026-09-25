namespace NodeLibrary.TextNodes.Enums;

public enum TextEncodingEnum
{
    [Display(Name = "UTF-8", Description = "Unicode UTF-8 encoding.")]
    Utf8 = 0,

    [Display(Name = "UTF-16", Description = "Unicode UTF-16 encoding, little-endian.")]
    Utf16 = 1,

    [Display(Name = "UTF-16 (Big Endian)", Description = "Unicode UTF-16 encoding, big-endian.")]
    Utf16BE = 2,

    [Display(Name = "UTF-32", Description = "Unicode UTF-32 encoding, little-endian.")]
    Utf32 = 3,

    [Display(Name = "ASCII", Description = "7-bit ASCII encoding.")]
    Ascii = 4
}
