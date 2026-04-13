namespace ExecutorLibrary.FlowProcessor.Models;

public class FlowExecutionResult
{
    public bool IsSuccess { get; set; }

    public FlowExecutionStatus Status { get; set; } = FlowExecutionStatus.Completed;

    public DateTimeOffset StartTime { get; set; }

    public DateTimeOffset EndTime { get; set; }

    public double DurationSeconds => (EndTime - StartTime).TotalSeconds;

    public IReadOnlyList<NodeExecutionLog> NodeLogs { get; set; } = new List<NodeExecutionLog>();

    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Snapshot of non-sensitive flow execution context variables at the end of execution.
    /// Used to extract outputs like _ChatLLMResult for chat-triggered flows.
    /// </summary>
    public Dictionary<string, object?>? OutputVariables { get; set; }
}
