namespace NodeLibrary.Attributes;

/// <summary>
/// Declares the input field whose value the rendered form control depends on.
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class DependsOnAttribute : Attribute
{
    public string FieldName { get; }

    public DependsOnAttribute(string fieldName)
    {
        FieldName = fieldName;
    }
}
