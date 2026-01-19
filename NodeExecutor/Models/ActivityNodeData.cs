using System.Collections.Generic;

namespace NodeExecutor.Models
{
    public class ActivityNodeData
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string NodeName { get; set; }
        public string CodeActivityName { get; set; }
        public List<NodeInput> NodeInputs { get; set; }
        public List<NodeOutput> NodeOutputs { get; set; }
        public string NextNodeId { get; set; }
    }

    public class NodeInput
    {
        public string Key { get; set; }
        public object Value { get; set; }
    }

    public class NodeOutputValue
    {
        public string Value { get; set; }
        public bool Enabled { get; set; }
    }

    public class NodeOutput
    {
        public string Key { get; set; }
        public NodeOutputValue Value { get; set; }
    }
}
