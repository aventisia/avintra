namespace NodeLibrary.XmlNodes.Enums;

public enum XmlFileEncodingEnum
{
    [Display(Name = "System Default", Description = "Uses the system's default encoding.")]
    SystemDefault,

    [Display(Name = "UTF-8", Description = "Uses UTF-8 encoding.")]
    UTF8,

    [Display(Name = "Unicode (UTF-16)", Description = "Uses UTF-16 encoding with a BOM (Byte Order Mark).")]
    Unicode,

    [Display(Name = "Big Endian Unicode", Description = "Uses UTF-16 encoding without a BOM.")]
    BigEndianUnicode,

    [Display(Name = "UTF-8 (No BOM)", Description = "Uses UTF-8 encoding without a BOM.")]
    UTF8NoBOM,

    [Display(Name = "ASCII", Description = "Uses ASCII encoding.")]
    ASCII
}
