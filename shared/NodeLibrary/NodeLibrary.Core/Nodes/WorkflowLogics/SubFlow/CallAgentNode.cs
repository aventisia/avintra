namespace NodeLibrary.SubFlowNodes;

[DisplayName("Call Agent")]
[Description("Use this to call another agent within the current agent")]
[NodeMetadata(nodeType: "callAgentNode", icon: "CallAgentIcon")]
public class CallAgentNode : BaseNode
{
    protected override void Execute(INodeContext context)
    {
        // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
    }
}
