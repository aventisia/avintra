using System.Drawing;
using System.Runtime.InteropServices;

namespace NodeLibrary.MouseAndKeyboardNodes.Helpers;

public static class MouseHelper
{
    [StructLayout(LayoutKind.Sequential)]
    private struct INPUT
    {
        public uint type;
        public InputUnion u;
    }

    [StructLayout(LayoutKind.Explicit)]
    private struct InputUnion
    {
        [FieldOffset(0)] public MOUSEINPUT mi;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MOUSEINPUT
    {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    private const uint INPUT_MOUSE = 0;
    private const uint MOUSEEVENTF_LEFTDOWN_SENDINPUT = 0x0002;
    private const uint MOUSEEVENTF_LEFTUP_SENDINPUT = 0x0004;
    private const uint MOUSEEVENTF_RIGHTDOWN_SENDINPUT = 0x0008;
    private const uint MOUSEEVENTF_RIGHTUP_SENDINPUT = 0x0010;
    private const uint MOUSEEVENTF_MIDDLEDOWN_SENDINPUT = 0x0020;
    private const uint MOUSEEVENTF_MIDDLEUP_SENDINPUT = 0x0040;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll")]
    private static extern bool SetCursorPos(int x, int y);

    [DllImport("user32.dll")]
    private static extern bool GetCursorPos(out POINT lpPoint);

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT
    {
        public int X;
        public int Y;
    }

    /// <summary>
    /// Moves cursor to specified position and performs a click
    /// </summary>
    public static void MouseClick(int x, int y, MouseButtonsEnum buttonEnum)
    {
        SetCursorPosition(x, y);
        switch (buttonEnum)
        {
            case MouseButtonsEnum.Left:
                MouseDown(x, y, MouseButtonsEnum.Left);
                MouseUp(x, y, MouseButtonsEnum.Left);
                break;
            case MouseButtonsEnum.Right:
                MouseDown(x, y, MouseButtonsEnum.Right);
                MouseUp(x, y, MouseButtonsEnum.Right);
                break;
            case MouseButtonsEnum.Middle:
                MouseDown(x, y, MouseButtonsEnum.Middle);
                MouseUp(x, y, MouseButtonsEnum.Middle);
                break;
        }
    }

    /// <summary>
    /// Moves cursor to specified position and performs a double click
    /// </summary>
    public static void MouseDoubleClick(int x, int y, MouseButtonsEnum buttonEnum)
    {
        SetCursorPosition(x, y);
        MouseClick(x, y, buttonEnum);
        System.Threading.Thread.Sleep(150); // Small delay between clicks
        MouseClick(x, y, buttonEnum);
    }

    /// <summary>
    /// Moves cursor to specified position and presses mouse button down
    /// </summary>
    public static void MouseDown(int x, int y, MouseButtonsEnum buttonEnum)
    {
        SetCursorPosition(x, y);

        // Modern approach using SendInput (recommended)
        var inputs = new INPUT[1];
        inputs[0].type = INPUT_MOUSE;

        switch (buttonEnum)
        {
            case MouseButtonsEnum.Left:
                inputs[0].u.mi.dwFlags = MOUSEEVENTF_LEFTDOWN_SENDINPUT;
                break;
            case MouseButtonsEnum.Right:
                inputs[0].u.mi.dwFlags = MOUSEEVENTF_RIGHTDOWN_SENDINPUT;
                break;
            case MouseButtonsEnum.Middle:
                inputs[0].u.mi.dwFlags = MOUSEEVENTF_MIDDLEDOWN_SENDINPUT;
                break;
        }

        var sent = SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
        if (sent != 1)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to send mouse button down input.");
        }
    }

    /// <summary>
    /// Moves cursor to specified position and releases mouse button
    /// </summary>
    public static void MouseUp(int x, int y, MouseButtonsEnum buttonEnum)
    {
        SetCursorPosition(x, y);

        // Modern approach using SendInput (recommended)
        var inputs = new INPUT[1];
        inputs[0].type = INPUT_MOUSE;

        switch (buttonEnum)
        {
            case MouseButtonsEnum.Left:
                inputs[0].u.mi.dwFlags = MOUSEEVENTF_LEFTUP_SENDINPUT;
                break;
            case MouseButtonsEnum.Right:
                inputs[0].u.mi.dwFlags = MOUSEEVENTF_RIGHTUP_SENDINPUT;
                break;
            case MouseButtonsEnum.Middle:
                inputs[0].u.mi.dwFlags = MOUSEEVENTF_MIDDLEUP_SENDINPUT;
                break;
        }

        var sent = SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
        if (sent != 1)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to send mouse button up input.");
        }
    }

    public static Point GetCursorPosition()
    {
        if (!GetCursorPos(out var point))
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get cursor position.");
        }

        return new Point(point.X, point.Y);
    }

    /// <summary>
    /// Sets the cursor position
    /// </summary>
    private static void SetCursorPosition(int x, int y)
    {
        if (!SetCursorPos(x, y))
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to set cursor position.");
        }
    }
}

public enum MouseButtonsEnum
{
    Left,
    Right,
    Middle
}



