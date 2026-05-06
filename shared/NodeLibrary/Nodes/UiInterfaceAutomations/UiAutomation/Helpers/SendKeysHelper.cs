using FlaUI.Core.Input;
using System.Runtime.InteropServices;

namespace NodeLibrary.UiAutomationNodes.Helpers;

public static class SendKeysHelper
{
    // Win32 clipboard constants and P/Invoke declarations
    private const uint CF_UNICODETEXT = 13;
    private const uint GMEM_MOVEABLE = 0x0002;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool OpenClipboard(IntPtr hWndNewOwner);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool CloseClipboard();

    [DllImport("user32.dll")]
    private static extern bool EmptyClipboard();

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetClipboardData(uint uFormat, IntPtr hMem);

    [DllImport("kernel32.dll")]
    private static extern IntPtr GlobalAlloc(uint uFlags, UIntPtr dwBytes);

    [DllImport("kernel32.dll")]
    private static extern IntPtr GlobalLock(IntPtr hMem);

    [DllImport("kernel32.dll")]
    private static extern bool GlobalUnlock(IntPtr hMem);

    /// <summary>
    /// Simulates typing text character by character with a delay between each character using FlaUI keyboard input.
    /// </summary>
    /// <param name="text">The text to type.</param>
    /// <param name="delayMs">Delay in milliseconds between each character.</param>
    public static void SendKeysTyping(string text, int delayMs)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(text))
            {
                foreach (char letter in text)
                {
                    Keyboard.Type(letter.ToString());
                    Thread.Sleep(delayMs);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.ToString());
        }
    }

    /// <summary>
    /// Sets the system clipboard to the specified text using Win32 P/Invoke.
    /// </summary>
    public static void SetClipboardText(string text)
    {
        if (!OpenClipboard(IntPtr.Zero))
            return;
        try
        {
            EmptyClipboard();
            if (!string.IsNullOrEmpty(text))
            {
                var bytes = Encoding.Unicode.GetBytes(text + '\0');
                var hMem = GlobalAlloc(GMEM_MOVEABLE, (UIntPtr)bytes.Length);
                var ptr = GlobalLock(hMem);
                Marshal.Copy(bytes, 0, ptr, bytes.Length);
                GlobalUnlock(hMem);
                SetClipboardData(CF_UNICODETEXT, hMem);
            }
        }
        finally
        {
            CloseClipboard();
        }
    }

    /// <summary>
    /// Clears the system clipboard using Win32 P/Invoke.
    /// </summary>
    public static void ClearClipboard()
    {
        if (!OpenClipboard(IntPtr.Zero))
            return;
        try
        {
            EmptyClipboard();
        }
        finally
        {
            CloseClipboard();
        }
    }
}
