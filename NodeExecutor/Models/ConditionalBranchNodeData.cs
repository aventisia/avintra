using System.Collections.Generic;
using CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities;

namespace NodeExecutor.Models
{
    public class ConditionalBranchNodeData
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string NodeName { get; set; }
        public string CodeActivityName { get; set; }
        public List<List<ConditionGroup>> Conditions { get; set; }
        public string ConditionalNodeId { get; set; }
        public string NextNodeId { get; set; }
    }

    public class ConditionGroup
    {
        public string Id { get; set; }
        public string FirstValue { get; set; }
        public ComparisonOperatorEnum ComparisonOperator { get; set; }
        public string SecondValue { get; set; }
    }
}
