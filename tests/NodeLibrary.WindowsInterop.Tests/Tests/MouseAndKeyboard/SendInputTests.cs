using System.ComponentModel;
using System.Runtime.InteropServices;
using NodeLibrary.WindowsInterop.Tests.Native;

namespace NodeLibrary.WindowsInterop.Tests.Tests.MouseAndKeyboard;

public class SendInputStructSizeTest : IInteropTest
{
    public string Name => "SendInput INPUT struct size";
    public string Category => "MouseAndKeyboard";

    public Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default)
    {
        int size = Marshal.SizeOf<INPUT>();
        int expected = Environment.Is64BitProcess ? 40 : 28;

        if (size != expected)
        {
            return Task.FromResult(new InteropTestResult(
                false,
                $"Marshal.SizeOf<INPUT>={size}, expected {expected} for {(Environment.Is64BitProcess ? "x64" : "x86")}."));
        }

        return Task.FromResult(new InteropTestResult(
            true,
            $"Marshal.SizeOf<INPUT>={size} matches native Windows INPUT size on {(Environment.Is64BitProcess ? "x64" : "x86")}."));
    }
}

public class SendSingleKeyTest : IInteropTest
{
    public string Name => "Send single key 'A'";
    public string Category => "MouseAndKeyboard";

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    public Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default)
    {
        var inputs = new INPUT[]
        {
            new()
            {
                type = Win32InputConstants.INPUT_KEYBOARD,
                ki = new KEYBDINPUT { wVk = 0x41, dwFlags = 0 }
            },
            new()
            {
                type = Win32InputConstants.INPUT_KEYBOARD,
                ki = new KEYBDINPUT { wVk = 0x41, dwFlags = Win32InputConstants.KEYEVENTF_KEYUP }
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

        return Task.FromResult(new InteropTestResult(true, $"Sent {sent} keyboard input(s) successfully."));
    }
}

public class SendTabKeyTest : IInteropTest
{
    public string Name => "Send Tab key";
    public string Category => "MouseAndKeyboard";

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    public Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default)
    {
        var inputs = new INPUT[]
        {
            new()
            {
                type = Win32InputConstants.INPUT_KEYBOARD,
                ki = new KEYBDINPUT { wVk = 0x09, dwFlags = 0 }
            },
            new()
            {
                type = Win32InputConstants.INPUT_KEYBOARD,
                ki = new KEYBDINPUT { wVk = 0x09, dwFlags = Win32InputConstants.KEYEVENTF_KEYUP }
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

        return Task.FromResult(new InteropTestResult(true, $"Sent Tab key successfully."));
    }
}

public class SendModifierCombinationTest : IInteropTest
{
    public string Name => "Send Ctrl+A";
    public string Category => "MouseAndKeyboard";

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    public Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default)
    {
        var inputs = new INPUT[]
        {
            new() { type = Win32InputConstants.INPUT_KEYBOARD, ki = new KEYBDINPUT { wVk = Win32InputConstants.VK_CONTROL } },
            new() { type = Win32InputConstants.INPUT_KEYBOARD, ki = new KEYBDINPUT { wVk = 0x41 } },
            new() { type = Win32InputConstants.INPUT_KEYBOARD, ki = new KEYBDINPUT { wVk = 0x41, dwFlags = Win32InputConstants.KEYEVENTF_KEYUP } },
            new() { type = Win32InputConstants.INPUT_KEYBOARD, ki = new KEYBDINPUT { wVk = Win32InputConstants.VK_CONTROL, dwFlags = Win32InputConstants.KEYEVENTF_KEYUP } }
        };

        uint sent = SendInput((uint)inputs.Length, inputs, Marshal.SizeOf<INPUT>());
        if (sent != inputs.Length)
        {
            int err = Marshal.GetLastWin32Error();
            return Task.FromResult(new InteropTestResult(
                false,
                $"SendInput returned {sent} (expected {inputs.Length}). Win32 error: {err} ({new Win32Exception(err).Message})."));
        }

        return Task.FromResult(new InteropTestResult(true, $"Sent Ctrl+A successfully."));
    }
}
