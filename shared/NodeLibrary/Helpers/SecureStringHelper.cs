using System.Runtime.InteropServices;
using System.Security;

namespace NodeLibrary.Helpers;

/// <summary>
/// Helper class for SecureString conversions and operations
/// </summary>
public static class SecureStringHelper
{
    /// <summary>
    /// Converts a SecureString to a plain string. Use only when required by APIs.
    /// The returned string should be cleared from memory as soon as possible.
    /// </summary>
    public static string? ConvertSecureStringToString(SecureString secureString)
    {
        if (secureString == null || secureString.Length == 0)
            return string.Empty;

        IntPtr ptr = IntPtr.Zero;
        try
        {
            ptr = Marshal.SecureStringToGlobalAllocUnicode(secureString);
            return Marshal.PtrToStringUni(ptr);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error converting SecureString to string: {ex.Message}");
            return string.Empty;
        }
        finally
        {
            if (ptr != IntPtr.Zero)
                Marshal.ZeroFreeGlobalAllocUnicode(ptr);
        }
    }

    /// <summary>
    /// Converts a plain string to SecureString.
    /// </summary>
    public static SecureString ConvertStringToSecureString(string plainString)
    {
        if (string.IsNullOrEmpty(plainString))
            return new SecureString();

        var secure = new SecureString();
        foreach (char c in plainString)
        {
            secure.AppendChar(c);
        }
        secure.MakeReadOnly();
        return secure;
    }
}