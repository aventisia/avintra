using CodeActivitiesLibrary.Models;
using System.Collections.Generic;

namespace NodeExecutor.Models
{
    public class WpfLoopNodeData
    {
        public string Id { get; set; } // Loop node id
        public string Type { get; set; }
        public string NodeName { get; set; }
        public string LoopType { get; set; } // "ConditionalLoop" or "ForEachLoop"
        public string MergeBranchesNodeId { get; set; }
        public List<List<UnresolvedConditionObj>> Conditions { get; set; }
        public string ListVariableName { get; set; }
        public string ItemVariableName { get; set; }
        public string ItemIndexVariableName { get; set; }
        public string NextNodeId { get; set; }
    }
}
