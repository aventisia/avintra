namespace NodeLibrary.WorkflowLogics.SubFlowsActivities;

[DisplayName("Call Block")]
[Description("Use to add custom block")]
[NodeMetadata(nodeType: "blockNode", icon: "BlockNodeIcon")]
public class CallBlockNode : BaseNode
{
    protected override void Execute(INodeContext context)
    {
        // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
    }
}
