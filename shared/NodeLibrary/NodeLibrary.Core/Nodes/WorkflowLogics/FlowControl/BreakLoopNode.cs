namespace NodeLibrary.FlowControlNodes;

[DisplayName("Break Loop")]
[Description("Breaks out of the current loop in the workflow execution.")]
[NodeMetadata(nodeType: "breakLoopNode", icon: "/assets/BreakLoop.svg", doNotRenderIf: "production")]
public class BreakLoopNode : BaseNode
{
    protected override void Execute(INodeContext context)
    {
        // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
    }
}
