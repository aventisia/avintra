namespace NodeLibrary.Attributes;

/// <summary>
/// Indicates the field type for an argument property.
/// Should only be applied to properties of type InArgument.
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class NodeFieldTypeAttribute : Attribute
{
    public NodeFieldTypeEnum FieldType { get; }

    public NodeFieldTypeAttribute(NodeFieldTypeEnum fieldType)
    {
        FieldType = fieldType;
    }
}