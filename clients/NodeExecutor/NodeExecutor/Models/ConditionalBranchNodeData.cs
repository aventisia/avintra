using CodeActivitiesLibrary.Models;
using System.Collections.Generic;

namespace NodeExecutor.Models
{
    public class ConditionalBranchNodeData
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string NodeName { get; set; }
        public string CodeActivityName { get; set; }
        public List<List<UnresolvedConditionObj>> Conditions { get; set; }
        public string ConditionalNodeId { get; set; }
        public string NextNodeId { get; set; }
    }
}
