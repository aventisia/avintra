namespace NodeLibrary.WindowsInterop.Tests;

public interface IInteropTest
{
    string Name { get; }
    string Category { get; }
    Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default);
}

public sealed record InteropTestResult(bool Success, string Message);
