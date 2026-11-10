namespace ExecutorLibrary.Tests;

internal static class TestHarness
{
    internal static int RunCase(string name, Action test)
    {
        try
        {
            test();
            Console.WriteLine($"  PASS: {name}");
            return 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"  FAIL: {name}");
            Console.WriteLine($"        {ex.Message}");
            return 1;
        }
    }

    internal static void AssertEqual<T>(T expected, T actual, string? message = null)
    {
        if (!EqualityComparer<T>.Default.Equals(expected, actual))
            throw new InvalidOperationException($"{(message is null ? string.Empty : message + ": ")}Expected '{expected}', got '{actual}'.");
    }

    internal static void AssertTrue(bool condition, string? message = null)
    {
        if (!condition)
            throw new InvalidOperationException(message ?? "Assertion failed.");
    }
}
