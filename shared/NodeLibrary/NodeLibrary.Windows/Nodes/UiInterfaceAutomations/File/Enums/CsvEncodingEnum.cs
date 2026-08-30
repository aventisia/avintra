namespace NodeLibrary.FileNodes.Enums;

public enum CsvEncodingEnum
{
    [Display(Name = "System Default", Description = "Uses the system's default encoding.")]
    SystemDefault,

    [Display(Name = "UTF-8", Description = "UTF-8 encoding with byte order mark.")]
    UTF8,

    [Display(Name = "Unicode", Description = "UTF-16 encoding (little-endian).")]
    Unicode,

    [Display(Name = "Unicode (big-endian)", Description = "UTF-16 encoding (big-endian).")]
    BigEndianUnicode,

    [Display(Name = "UTF-8 (no byte order mark)", Description = "UTF-8 encoding without byte order mark.")]
    UTF8NoBOM,

    [Display(Name = "ASCII", Description = "7-bit ASCII encoding.")]
    ASCII
}
