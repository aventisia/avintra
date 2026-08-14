using System.Runtime.InteropServices;

using NodeLibrary.ExcelNodes.Helpers;

namespace NodeLibrary.Office;

/// <summary>
/// Late-binding helper for automating Microsoft Office desktop applications (Excel, Word)
/// without compile-time interop assembly references. This allows the RunnerApp to work with
/// whatever version of Office is installed on the user's Windows machine.
/// </summary>
public static class OfficeAutomationHelper
{
    /// <summary>
    /// Activates a new instance of the requested Office application via COM ProgID.
    /// </summary>
    public static dynamic CreateApplication(OfficeApplication application)
    {
        var progid = GetProgId(application);
        var operation = $"create a new {GetDisplayName(application)} instance";

        try
        {
            var type = Type.GetTypeFromProgID(progid)
                ?? throw new InvalidOperationException($"The COM ProgID '{progid}' is not registered.");

            return Activator.CreateInstance(type);
        }
        catch (Exception ex) when (ex is COMException or InvalidComObjectException or InvalidOperationException or MemberAccessException)
        {
            throw new OfficeAutomationException(application, operation, ex);
        }
    }

    /// <summary>
    /// Attaches to an already-running Office application instance. If none is running,
    /// falls back to creating a new instance.
    /// </summary>
    public static dynamic GetActiveApplication(OfficeApplication application, bool createIfMissing = true)
    {
        var progid = GetProgId(application);
        var operation = $"attach to a running {GetDisplayName(application)} instance";

        try
        {
            return ComHelper.GetActiveObject(progid);
        }
        catch (COMException ex) when (ex.HResult == unchecked((int)0x800401E3) || ex.HResult == unchecked((int)0x800401FD))
        {
            // MK_E_UNAVAILABLE / CO_E_OBJNOTREG / RPC_E_SERVER_UNAVAILABLE — no running instance.
            if (!createIfMissing)
            {
                throw new OfficeAutomationException(application, operation, ex);
            }

            return CreateApplication(application);
        }
        catch (Exception ex) when (ex is COMException or InvalidComObjectException or InvalidOperationException)
        {
            throw new OfficeAutomationException(application, operation, ex);
        }
    }

    /// <summary>
    /// Safely releases a COM object, ignoring null or already-released wrappers.
    /// </summary>
    public static void Release(object? comObject)
    {
        if (comObject is null)
        {
            return;
        }

        try
        {
            while (Marshal.ReleaseComObject(comObject) > 0)
            {
                // Release all RCW references.
            }
        }
        catch (InvalidComObjectException)
        {
            // Already released or not a COM object.
        }
        catch (Exception)
        {
            // Best-effort cleanup; do not throw from release helpers.
        }
    }

    private static string GetProgId(OfficeApplication application) => application switch
    {
        OfficeApplication.Excel => "Excel.Application",
        OfficeApplication.Word => "Word.Application",
        _ => throw new ArgumentOutOfRangeException(nameof(application), application, "Unknown Office application."),
    };

    private static string GetDisplayName(OfficeApplication application) => application switch
    {
        OfficeApplication.Excel => "Excel",
        OfficeApplication.Word => "Word",
        _ => application.ToString(),
    };
}
