namespace NodeLibrary.WindowsInterop.Tests.Tests.MouseAndKeyboard;

// Note: KeyboardHelper is internal to NodeLibrary, so this project tests the
// same SendInput interop code using its own native struct definitions. To test
// KeyboardHelper directly, it would need to be made public (or the test project
// would need InternalsVisibleTo), which is intentionally not done here.
public sealed class KeyboardHelperPlaceholder : IInteropTest
{
    public string Name => "KeyboardHelper note";
    public string Category => "MouseAndKeyboard";

    public Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new InteropTestResult(
            true,
            "KeyboardHelper is internal; use the SendInput tests above to verify the same interop path."));
    }
}
