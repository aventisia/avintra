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
}
