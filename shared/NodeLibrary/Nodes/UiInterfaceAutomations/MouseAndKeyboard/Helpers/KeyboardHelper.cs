using System.Runtime.InteropServices;

namespace NodeLibrary.MouseAndKeyboardNodes.Helpers;

internal static class KeyboardHelper
{
    private const uint InputKeyboard = 1;
    private const uint KeyeventfKeyup = 0x0002;
    private const uint KeyeventfUnicode = 0x0004;

    private const ushort VkShift = 0x10;
    private const ushort VkControl = 0x11;
    private const ushort VkMenu = 0x12;

    [StructLayout(LayoutKind.Sequential)]
    private struct INPUT
    {
        public uint type;
        public InputUnion U;
    }

    [StructLayout(LayoutKind.Explicit)]
    private struct InputUnion
    {
        [FieldOffset(0)]
        public KEYBDINPUT ki;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct KEYBDINPUT
    {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public nint dwExtraInfo;
    }

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll")]
    private static extern short VkKeyScan(char ch);

    internal static void KeyDown(ushort virtualKey)
    {
        SendKeyboardInput(virtualKey, 0, 0);
    }

    internal static void KeyUp(ushort virtualKey)
    {
        SendKeyboardInput(virtualKey, 0, KeyeventfKeyup);
    }

    internal static void KeyPress(ushort virtualKey)
    {
        KeyDown(virtualKey);
        KeyUp(virtualKey);
    }

    internal static void SendText(string text, int delayBetweenKeys, bool hardware)
    {
        foreach (var token in Tokenize(text))
        {
            if (TryMapTokenToVirtualKey(token, out var virtualKey))
            {
                KeyPress(virtualKey);
            }
            else if (hardware)
            {
                SendHardwareCharacter(token, delayBetweenKeys);
            }
            else
            {
                SendUnicodeToken(token, delayBetweenKeys);
            }

            if (delayBetweenKeys > 0)
            {
                Thread.Sleep(delayBetweenKeys);
            }
        }
    }

    private static void SendUnicodeToken(string token, int delayBetweenKeys)
    {
        foreach (var ch in token)
        {
            SendKeyboardInput(0, ch, KeyeventfUnicode);
            SendKeyboardInput(0, ch, KeyeventfUnicode | KeyeventfKeyup);

            if (delayBetweenKeys > 0)
            {
                Thread.Sleep(delayBetweenKeys);
            }
        }
    }

    private static void SendHardwareCharacter(string token, int delayBetweenKeys)
    {
        foreach (var ch in token)
        {
            var vkResult = VkKeyScan(ch);
            if (vkResult == -1)
            {
                SendUnicodeToken(ch.ToString(), delayBetweenKeys);
                continue;
            }

            var modifiers = (vkResult >> 8) & 0xFF;
            var virtualKey = (ushort)(vkResult & 0xFF);

            if ((modifiers & 1) != 0) KeyDown(VkShift);
            if ((modifiers & 2) != 0) KeyDown(VkControl);
            if ((modifiers & 4) != 0) KeyDown(VkMenu);

            KeyPress(virtualKey);

            if ((modifiers & 4) != 0) KeyUp(VkMenu);
            if ((modifiers & 2) != 0) KeyUp(VkControl);
            if ((modifiers & 1) != 0) KeyUp(VkShift);

            if (delayBetweenKeys > 0)
            {
                Thread.Sleep(delayBetweenKeys);
            }
        }
    }

    private static void SendKeyboardInput(ushort virtualKey, ushort scanCode, uint flags)
    {
        var inputs = new[]
        {
            new INPUT
            {
                type = InputKeyboard,
                U = new InputUnion
                {
                    ki = new KEYBDINPUT
                    {
                        wVk = virtualKey,
                        wScan = scanCode,
                        dwFlags = flags,
                        time = 0,
                        dwExtraInfo = nint.Zero
                    }
                }
            }
        };

        var sent = SendInput(1, inputs, Marshal.SizeOf<INPUT>());
        if (sent != 1)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to send keyboard input.");
        }
    }

    private static IEnumerable<string> Tokenize(string text)
    {
        var tokens = new List<string>();

        for (var i = 0; i < text.Length; i++)
        {
            if (text[i] != '{')
            {
                tokens.Add(text[i].ToString());
                continue;
            }

            var closeIndex = text.IndexOf('}', i + 1);
            if (closeIndex <= i)
            {
                tokens.Add(text[i].ToString());
                continue;
            }

            var token = text.Substring(i, closeIndex - i + 1);
            tokens.Add(token);
            i = closeIndex;
        }

        return tokens;
    }

    private static bool TryMapTokenToVirtualKey(string token, out ushort virtualKey)
    {
        virtualKey = 0;
        if (!token.StartsWith("{") || !token.EndsWith("}"))
        {
            return false;
        }

        var key = token[1..^1].Trim().ToUpperInvariant();

        return key switch
        {
            "ENTER" => SetKey(0x0D, out virtualKey),
            "TAB" => SetKey(0x09, out virtualKey),
            "BACKSPACE" => SetKey(0x08, out virtualKey),
            "ESC" or "ESCAPE" => SetKey(0x1B, out virtualKey),
            "SPACE" => SetKey(0x20, out virtualKey),
            "LEFT" => SetKey(0x25, out virtualKey),
            "UP" => SetKey(0x26, out virtualKey),
            "RIGHT" => SetKey(0x27, out virtualKey),
            "DOWN" => SetKey(0x28, out virtualKey),
            "DELETE" or "DEL" => SetKey(0x2E, out virtualKey),
            "HOME" => SetKey(0x24, out virtualKey),
            "END" => SetKey(0x23, out virtualKey),
            "PGUP" => SetKey(0x21, out virtualKey),
            "PGDN" => SetKey(0x22, out virtualKey),
            _ => false
        };
    }

    private static bool SetKey(ushort source, out ushort destination)
    {
        destination = source;
        return true;
    }
}
