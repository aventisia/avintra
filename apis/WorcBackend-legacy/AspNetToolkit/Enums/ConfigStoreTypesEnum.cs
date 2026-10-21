namespace AspNetToolkit.Enums;

public enum ConfigStoreTypesEnum
{
    [Description("Represents a string of characters.")]
    TEXT,

    [Description("Represents a binary value (True/False).")]
    BOOLEAN,

    [Description("Represents sensitive authentication data.")]
    CREDENTIAL,

    [Description("Represents structured data in JavaScript Object Notation format.")]
    JSON
}