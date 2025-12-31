using CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities;

namespace NodeExecutor.Models
{
    public class ConditionGroup
    {
        public string Id { get; set; }
        public string FirstValue { get; set; }
        public ComparisonOperatorEnum ComparisonOperator { get; set; }
        public string SecondValue { get; set; }
    }
}
