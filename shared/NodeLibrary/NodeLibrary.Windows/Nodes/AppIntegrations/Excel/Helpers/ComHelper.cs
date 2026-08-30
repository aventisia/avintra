using System.Runtime.InteropServices;

namespace NodeLibrary.ExcelNodes.Helpers;

/// <summary>
/// Helper class providing COM interop functionality not available in .NET 8.
/// </summary>
public static class ComHelper
{
    [DllImport("oleaut32.dll", PreserveSig = false)]
    private static extern void GetActiveObject(ref Guid rclsid, IntPtr pvReserved, [MarshalAs(UnmanagedType.IUnknown)] out object ppunk);

    [DllImport("ole32.dll", PreserveSig = false)]
    private static extern void CLSIDFromProgIDEx([MarshalAs(UnmanagedType.LPWStr)] string lpszProgID, out Guid lpclsid);

    /// <summary>
    /// Gets an active COM object by its ProgID. Replacement for Marshal.GetActiveObject removed in .NET Core/.NET 5+.
    /// </summary>
    public static object GetActiveObject(string progId)
    {
        CLSIDFromProgIDEx(progId, out Guid clsid);
        GetActiveObject(ref clsid, IntPtr.Zero, out object obj);
        return obj;
    }
}
