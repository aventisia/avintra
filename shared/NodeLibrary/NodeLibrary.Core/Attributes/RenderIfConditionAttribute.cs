namespace NodeLibrary.Attributes;

/// <summary>
/// Specifies the logical operator to use when multiple RenderIf conditions are applied to a property
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class RenderIfOperatorAttribute : Attribute
{
    public LogicalOperatorEnum Operator { get; }

    public RenderIfOperatorAttribute(LogicalOperatorEnum logicalOperator = LogicalOperatorEnum.AND)
    {
        Operator = logicalOperator;
    }
}

/// <summary>
/// Conditionally renders a property based on another property's value
/// Can be applied multiple times to a single property for complex conditions
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = true)]
public class RenderIfConditionAttribute : Attribute
{
    public string Field { get; }
    public new object? Equals { get; }

    public RenderIfConditionAttribute(string field, object equals)
    {
        Field = field;
        // If equals is an Enum, store its string name; otherwise, store as is
        if (equals != null && equals.GetType().IsEnum)
        {
            Equals = equals.ToString();
        }
        else
        {
            Equals = equals;
        }
    }
}