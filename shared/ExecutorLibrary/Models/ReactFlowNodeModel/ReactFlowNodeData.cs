namespace ExecutorLibrary.Models;

public class ReactFlowNodeData
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public List<ReactFlowNodeInput> Inputs { get; set; } = [];
    public List<ReactFlowNodeOutput> Outputs { get; set; } = [];
    public bool? IsDisabled { get; set; } = false;
    public HashSet<SupportedPlatformEnum>? SupportedPlatforms { get; set; }

    // --- TODO: yet to confirm and test of below properties

    // Required on conditionalNode to iterate branch nodes
    public List<string>? Branches { get; set; }

    // Required on conditionalNode and forLoopNode to specify the node where branches will be merged back.
    public string? MergeBranchesNodeId { get; set; }

    // Required on branchEndNode to specify the parent conditional or loop node.
    public string? CustomParentId { get; set; }

    // Required on branchEndNode to distinguish between ConditionalBranch and LoopBranch.
    public string? GroupType { get; set; }

    // Required on callAgentNode to specify the selected agent (format: "flowId,id").
    public string? SelectedAgent { get; set; }

    // Required on blockNode to specify the selected block (format: "flowId,id").
    public string? SelectedBlock { get; set; }
}
