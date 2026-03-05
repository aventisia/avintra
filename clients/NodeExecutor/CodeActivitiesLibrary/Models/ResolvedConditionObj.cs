using CodeActivitiesLibrary.Enums;

namespace CodeActivitiesLibrary.Models
{
    public class ResolvedConditionObj
    {
        public object FirstValue { get; set; }
        public ComparisonOperatorEnum ComparisonOperator { get; set; }
        public object SecondValue { get; set; }
    }
}