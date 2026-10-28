namespace NodeLibrary.FlowControlNodes;

[DisplayName("Break Loop")]
[Description("Breaks out of the current loop in the workflow execution.")]
[NodeMetadata(nodeType: "breakLoopNode", icon: "/assets/BreakLoop.svg")]
public class BreakLoopNode : BaseNode
{
    [DisplayName("Conditions")]
    [Description("Break out of the loop only while these conditions are true. Leave empty to always break.")]
    [NodeFieldType(NodeFieldTypeEnum.ConditionGroups)]
    public InArgument<string>? Conditions { get; set; }

    protected override void Execute(INodeContext context)
    {
        // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
    }
}
