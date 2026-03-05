using System;

namespace CodeActivitiesLibrary.Extensions
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class RenderIfOperatorAttribute : Attribute
    {
        public string Operator { get; } = "AND"; // Default is AND
        public RenderIfOperatorAttribute(string _operator)
        {
            Operator = _operator.ToUpperInvariant();
        }
    }

    [AttributeUsage(AttributeTargets.Property, AllowMultiple = true)]
    public class RenderIfConditionAttribute : Attribute
    {
        public string Field { get; }
        public new object Equals { get; }

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
}
