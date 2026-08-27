using System.ComponentModel;
using System.Runtime.InteropServices;
using NodeLibrary.WindowsInterop.Tests.Native;

namespace NodeLibrary.WindowsInterop.Tests.Tests.MouseAndKeyboard;

public class MoveMouseTest : IInteropTest
{
    public string Name => "Move mouse cursor right 10 px";
    public string Category => "MouseAndKeyboard";

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll")]
    private static extern bool GetCursorPos(out POINT lpPoint);

    public Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default)
    {
        if (!GetCursorPos(out var start))
        {
            return Task.FromResult(new InteropTestResult(false, "GetCursorPos failed."));
        }

        var inputs = new INPUT[]
        {
            new()
            {
                type = 0, // INPUT_MOUSE
                mi = new MOUSEINPUT
                {
                    dx = 10,
                    dy = 0,
                    dwFlags = Win32InputConstants.MOUSEEVENTF_MOVE,
                    mouseData = 0,
                    time = 0,
                    dwExtraInfo = nint.Zero
                }
            }
        };

        uint sent = SendInput((uint)inputs.Length, inputs, Marshal.SizeOf<INPUT>());
        if (sent != inputs.Length)
        {
            int err = Marshal.GetLastWin32Error();
            return Task.FromResult(new InteropTestResult(
                false,
                $"SendInput returned {sent} (expected {inputs.Length}). Win32 error: {err} ({new Win32Exception(err).Message})."));
        }

        GetCursorPos(out var end);
        return Task.FromResult(new InteropTestResult(
            true,
            $"Cursor moved from ({start.X},{start.Y}) to ({end.X},{end.Y})."));
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT
    {
        public int X;
        public int Y;
    }
}
