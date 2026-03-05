using CodeActivitiesLibrary.Enums;

namespace CodeActivitiesLibrary.Models
{
    public class UnresolvedConditionObj
    {
        public string Id { get; set; }
        public string FirstValue { get; set; }
        public ComparisonOperatorEnum ComparisonOperator { get; set; }
        public string SecondValue { get; set; }
    }
}