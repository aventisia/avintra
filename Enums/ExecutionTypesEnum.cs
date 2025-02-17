namespace AspNetToolkit.Enums;

/// <summary>
/// Defines the different methods for executing a flow.
/// </summary>
/// <remarks>
/// This enumeration specifies possible triggers for execution, such as user actions, automated scheduling, or external events.
/// </remarks>
public enum ExecutionTypesEnum
{
    [Description("The flow was initiated manually by a user.")]
    Manual,

    [Description("The flow was set to run automatically at a designated time.")]
    Scheduler,

    [Description("The flow was triggered by an external event or system alert.")]
    Event
}
