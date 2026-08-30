using System.Runtime.InteropServices;

namespace NodeLibrary.ClipboardNodes.Helpers;

/// <summary>
/// Windows clipboard interop helper using P/Invoke.
/// Provides .NET 8 compatible clipboard operations without System.Windows.Forms dependency.
/// </summary>
internal static class ClipboardInteropHelpers
{
    private const int CF_UNICODETEXT = 13;
    private const int CF_TEXT = 1;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool OpenClipboard(IntPtr hWndNewOwner);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool CloseClipboard();

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool EmptyClipboard();

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr GetClipboardData(uint uFormat);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetClipboardData(uint uFormat, IntPtr hMem);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GlobalAlloc(uint uFlags, UIntPtr dwBytes);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GlobalLock(IntPtr hMem);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GlobalUnlock(IntPtr hMem);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern UIntPtr GlobalSize(IntPtr hMem);

    private const uint GMEM_MOVEABLE = 0x0002;

    /// <summary>
    /// Clears all contents from the clipboard with retry logic.
    /// </summary>
    public static bool ClearClipboard(int maxAttempts = 3)
    {
        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            try
            {
                if (OpenClipboard(IntPtr.Zero))
                {
                    try
                    {
                        if (EmptyClipboard())
                        {
                            return true;
                        }
                    }
                    finally
                    {
                        CloseClipboard();
                    }
                }

                if (attempt < maxAttempts - 1)
                {
                    Thread.Sleep(100);
                }
            }
            catch
            {
                if (attempt < maxAttempts - 1)
                {
                    Thread.Sleep(100);
                }
            }
        }

        return false;
    }

    /// <summary>
    /// Retrieves text from the clipboard.
    /// </summary>
    public static string? GetText()
    {
        try
        {
            if (!OpenClipboard(IntPtr.Zero))
            {
                return null;
            }

            try
            {
                // Try Unicode first (preferred)
                IntPtr hGlobal = GetClipboardData(CF_UNICODETEXT);
                if (hGlobal != IntPtr.Zero)
                {
                    IntPtr lpwcstr = GlobalLock(hGlobal);
                    if (lpwcstr != IntPtr.Zero)
                    {
                        try
                        {
                            return Marshal.PtrToStringUni(lpwcstr);
                        }
                        finally
                        {
                            GlobalUnlock(hGlobal);
                        }
                    }
                }

                // Fallback to ANSI text
                hGlobal = GetClipboardData(CF_TEXT);
                if (hGlobal != IntPtr.Zero)
                {
                    IntPtr lpstr = GlobalLock(hGlobal);
                    if (lpstr != IntPtr.Zero)
                    {
                        try
                        {
                            return Marshal.PtrToStringAnsi(lpstr);
                        }
                        finally
                        {
                            GlobalUnlock(hGlobal);
                        }
                    }
                }

                return null;
            }
            finally
            {
                CloseClipboard();
            }
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Sets text to the clipboard with retry logic.
    /// </summary>
    public static bool SetText(string? text, int maxAttempts = 3)
    {
        if (string.IsNullOrEmpty(text))
        {
            return ClearClipboard(maxAttempts);
        }

        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            try
            {
                if (OpenClipboard(IntPtr.Zero))
                {
                    try
                    {
                        if (EmptyClipboard())
                        {
                            // Allocate memory for Unicode text
                            byte[] bytes = Encoding.Unicode.GetBytes(text + "\0");
                            IntPtr hGlobal = GlobalAlloc(GMEM_MOVEABLE, new UIntPtr((uint)bytes.Length));

                            if (hGlobal != IntPtr.Zero)
                            {
                                IntPtr lpTarget = GlobalLock(hGlobal);
                                if (lpTarget != IntPtr.Zero)
                                {
                                    try
                                    {
                                        Marshal.Copy(bytes, 0, lpTarget, bytes.Length);
                                        GlobalUnlock(hGlobal);

                                        if (SetClipboardData(CF_UNICODETEXT, hGlobal) != IntPtr.Zero)
                                        {
                                            return true;
                                        }
                                    }
                                    catch
                                    {
                                        GlobalUnlock(hGlobal);
                                    }
                                }
                            }
                        }
                    }
                    finally
                    {
                        CloseClipboard();
                    }
                }

                if (attempt < maxAttempts - 1)
                {
                    Thread.Sleep(100);
                }
            }
            catch
            {
                if (attempt < maxAttempts - 1)
                {
                    Thread.Sleep(100);
                }
            }
        }

        return false;
    }
}
