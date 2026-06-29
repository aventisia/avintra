using System;
using System.Collections.Generic;
namespace NodeExecutor.Services
{
    public class NodeExecutionLog
    {
        public string NodeExecutionId { get; set; }
        public int RetryAttempt { get; set; } = 0;
        public string NodeId { get; set; }
        public string NodeName { get; set; }
        public string NodeUniqueName { get; set; }
        public bool IsSuccess { get; set; }
        public double Duration { get; set; } // Duration in seconds
        public List<NodeLogKeyValue> Inputs { get; set; }
        public List<NodeLogKeyValue> Outputs { get; set; }
    }

    public class NodeLogKeyValue
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }
}
