using System.Runtime.InteropServices;
using System.Threading;

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

            return (dynamic)Activator.CreateInstance(type)!;
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

    /// <summary>
    /// Retries a late-bound COM call a small number of times when the callee rejects it
    /// with RPC_E_CALL_REJECTED (0x80010001). This is transient — Excel (and other Office
    /// apps) are typically busy with a modal dialog or a save/sync operation.
    ///
    /// Important: this helper uses an STA-friendly wait so it does not block the message
    /// pump. Calling Thread.Sleep on an STA thread while Office is busy will deadlock the
    /// very COM apartment we're trying to make responsive again.
    /// </summary>
    public static T RetryComCall<T>(Func<T> call, int maxRetries = 5, int retryDelayMs = 300)
    {
        var attempt = 0;
        while (true)
        {
            try
            {
                return call();
            }
            catch (COMException ex) when (ex.HResult == unchecked((int)0x80010001))
            {
                attempt++;
                if (attempt > maxRetries)
                {
                    throw;
                }

                PumpAndWait(retryDelayMs);
            }
        }
    }

    /// <summary>
    /// Void variant of <see cref="RetryComCall{T}"/> for late-bound COM methods.
    /// </summary>
    public static void RetryComCall(Action call, int maxRetries = 5, int retryDelayMs = 300)
        => RetryComCall(() => { call(); return true; }, maxRetries, retryDelayMs);

    /// <summary>
    /// Waits without blocking the COM message pump when running on an STA thread.
    /// Falls back to Thread.Sleep on MTA threads where no pump is required.
    /// </summary>
    private static void PumpAndWait(int milliseconds)
    {
        if (Thread.CurrentThread.GetApartmentState() != ApartmentState.STA)
        {
            Thread.Sleep(milliseconds);
            return;
        }

        // On an STA thread we must keep pumping messages so that COM can complete the
        // rejected call in its own apartment. Thread.Sleep would freeze the pump and
        // guarantee the next retry fails too.
        var deadline = DateTime.UtcNow.AddMilliseconds(milliseconds);
        while (DateTime.UtcNow < deadline)
        {
            var remaining = (int)(deadline - DateTime.UtcNow).TotalMilliseconds;
            if (remaining <= 0)
            {
                break;
            }

            // MsgWaitForMultipleObjects waits for either a message or the timeout.
            // Wake the wait one message at a time, dispatch it, then continue waiting.
            var result = NativeMethods.MsgWaitForMultipleObjects(
                0, null, false, remaining, NativeMethods.QS_ALLEVENTS);

            if (result == NativeMethods.WAIT_OBJECT_0)
            {
                // A message arrived — pump it.
                while (NativeMethods.PeekMessage(out var msg, IntPtr.Zero, 0, 0, NativeMethods.PM_REMOVE))
                {
                    NativeMethods.TranslateMessage(ref msg);
                    NativeMethods.DispatchMessage(ref msg);
                }
            }
        }
    }

    private static class NativeMethods
    {
        public const uint QS_ALLEVENTS = 0x04BF;
        public const uint PM_REMOVE = 0x0001;
        public const uint WAIT_OBJECT_0 = 0x0000;

        [DllImport("user32.dll")]
        public static extern uint MsgWaitForMultipleObjects(
            uint nCount, IntPtr[]? pHandles, bool bWaitAll, int dwMilliseconds, uint dwWakeMask);

        [DllImport("user32.dll")]
        public static extern bool TranslateMessage(ref MSG lpMsg);

        [DllImport("user32.dll")]
        public static extern IntPtr DispatchMessage(ref MSG lpMsg);

        [DllImport("user32.dll")]
        public static extern bool PeekMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax, uint wRemoveMsg);

        [StructLayout(LayoutKind.Sequential)]
        public struct MSG
        {
            public IntPtr hwnd;
            public uint message;
            public IntPtr wParam;
            public IntPtr lParam;
            public uint time;
            public Point pt;
        }

        [StructLayout(LayoutKind.Sequential)]
        public struct Point
        {
            public int x;
            public int y;
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
