namespace NodeLibrary.WindowsInterop.Tests.Tests.System;

public class EnvironmentVariableTest : IInteropTest
{
    public string Name => "Read and write user environment variable";
    public string Category => "System";

    public Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default)
    {
        const string name = "AVINTRAWINDOWSINTEROPTEST";
        string original = Environment.GetEnvironmentVariable(name, EnvironmentVariableTarget.User) ?? string.Empty;
        const string value = "test-value-123";

        try
        {
            Environment.SetEnvironmentVariable(name, value, EnvironmentVariableTarget.User);
            string read = Environment.GetEnvironmentVariable(name, EnvironmentVariableTarget.User) ?? string.Empty;

            if (read != value)
            {
                return Task.FromResult(new InteropTestResult(
                    false,
                    $"Wrote '{value}' but read back '{read}'."));
            }

            Environment.SetEnvironmentVariable(name, original, EnvironmentVariableTarget.User);
            return Task.FromResult(new InteropTestResult(
                true,
                $"Set and read user env variable '{name}'='{value}', then restored original value."));
        }
        catch (Exception ex)
        {
            return Task.FromResult(new InteropTestResult(false, $"Environment variable test failed: {ex.Message}"));
        }
    }
}
