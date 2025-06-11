using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities.Enums
{
    public enum XmlFileEncodingEnum
    {
        [Description("Uses the system's default encoding.")]
        SystemDefault,

        [Description("Uses UTF-8 encoding.")] UTF8,

        [Description("Uses UTF-16 encoding with a BOM (Byte Order Mark).")]
        Unicode,

        [Description("Uses UTF-16 encoding without a BOM.")]
        BigEndianUnicode,

        [Description("Uses UTF-8 encoding without a BOM.")]
        UTF8NoBOM,
        [Description("Uses ASCII encoding.")] ASCII
    }
}