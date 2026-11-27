namespace NodeLibrary.FlowControlNodes;

[DisplayName("Continue Loop")]
[Description("Skips to the next iteration of the current loop in the workflow execution.")]
[NodeMetadata(nodeType: "continueLoopNode", icon: "/assets/BreakLoop.svg")]
public class ContinueLoopNode : BaseNode
{
    [DisplayName("Conditions")]
    [Description("Skip to the next iteration only while these conditions are true. Leave empty to always skip the rest of the iteration.")]
    [NodeFieldType(NodeFieldTypeEnum.ConditionGroups)]
    public InArgument<string>? Conditions { get; set; }

    protected override void Execute(INodeContext context)
    {
        // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
    }
}
