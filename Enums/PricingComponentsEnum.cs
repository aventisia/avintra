namespace AccountsAPIs.Enums;

/// <summary>
/// Defines the various components utilized for pricing.
/// </summary>
public enum PricingComponentsEnum
{
    /// <summary>
    /// Indicates the AI Agent component.
    /// </summary>
    [Description("AI Agent")]
    AIAgent,

    /// <summary>
    /// Indicates the Automation Agent component.
    /// </summary>
    [Description("Automation Agent")]
    AutomationAgent,

    /// <summary>
    /// Indicates the GPU Compute component.
    /// </summary>
    [Description("GPU Compute")]
    GPUCompute
}