using System.Runtime.InteropServices;

namespace NodeLibrary.WindowsInterop.Tests.Native;

// Native INPUT struct definitions must exactly match the Windows ABI.
// On x64: INPUT is 40 bytes (4 type + 4 padding + 32 union).
// On x86: INPUT is 28 bytes (4 type + 24 union).
[StructLayout(LayoutKind.Explicit)]
public struct INPUT
{
    [FieldOffset(0)]
    public uint type;

    [FieldOffset(8)]
    public KEYBDINPUT ki;

    [FieldOffset(8)]
    public MOUSEINPUT mi;

    [FieldOffset(8)]
    public HARDWAREINPUT hi;
}

[StructLayout(LayoutKind.Sequential)]
public struct KEYBDINPUT
{
    public ushort wVk;
    public ushort wScan;
    public uint dwFlags;
    public uint time;
    public nint dwExtraInfo;
}

[StructLayout(LayoutKind.Sequential)]
public struct MOUSEINPUT
{
    public int dx;
    public int dy;
    public uint mouseData;
    public uint dwFlags;
    public uint time;
    public nint dwExtraInfo;
}

[StructLayout(LayoutKind.Sequential)]
public struct HARDWAREINPUT
{
    public uint uMsg;
    public ushort wParamL;
    public ushort wParamH;
}

public static class Win32InputConstants
{
    public const uint INPUT_KEYBOARD = 1;
    public const uint KEYEVENTF_KEYUP = 0x0002;
    public const uint KEYEVENTF_UNICODE = 0x0004;
    public const uint MOUSEEVENTF_MOVE = 0x0001;
    public const uint MOUSEEVENTF_ABSOLUTE = 0x8000;
    public const ushort VK_SHIFT = 0x10;
    public const ushort VK_CONTROL = 0x11;
    public const ushort VK_MENU = 0x12;
}
