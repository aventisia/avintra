using System.Runtime.InteropServices;

namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Wait for Mouse"), Description("Suspends the execution of the flow until the mouse pointer changes to or from the specified cursor.")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class WaitForMouseNode : BaseNode
{
    [DisplayName("Wait for Mouse Pointer To"), Description("Specifies whether to wait until the mouse pointer becomes or stops being the specified type.")]
    public required InArgument<WaitActionEnum> WaitAction { get; set; }

    [DisplayName("Mouse Pointer"), Description("The type of mouse pointer to wait for (e.g., Arrow, Hourglass).")]
    public required InArgument<CursorTypeEnum> CursorType { get; set; }

    [DisplayName("Fail with Timeout Error"), Description("If true, throws an error if the timeout is reached without the expected cursor change.")]
    public InArgument<bool> FailWithTimeoutError { get; set; } = new InArgument<bool>(false);

    [DisplayName("Duration"), Description("Maximum time in seconds to wait for the cursor change.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(5);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var waitAction = WaitAction.Get(context);
            var cursorType = CursorType.Get(context);
            var failOnError = FailWithTimeoutError.Get(context);
            var timeoutSeconds = TimeoutSeconds.Get(context);

            if (timeoutSeconds <= 0)
            {
                throw new ArgumentException("Timeout must be greater than zero.");
            }

            var timeout = TimeSpan.FromSeconds(timeoutSeconds);
            var targetCursorHandle = GetCursorHandle(cursorType);

            var success = waitAction switch
            {
                WaitActionEnum.Become => WaitForCursorChangeTo(targetCursorHandle, timeout),
                WaitActionEnum.BecomeNot => WaitForCursorChangeFrom(targetCursorHandle, timeout),
                _ => throw new ArgumentOutOfRangeException(nameof(waitAction))
            };

            if (!success && failOnError)
            {
                throw new TimeoutException($"Timeout exceeded while waiting for cursor to {waitAction} '{cursorType}'.");
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context,
                success
                    ? $"Successfully waited for cursor to {waitAction} '{cursorType}'."
                    : $"No cursor change detected for {waitAction} '{cursorType}' within timeout.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error waiting for cursor: {ex.Message}");
        }
    }

    private static nint GetCursorHandle(CursorTypeEnum cursorType)
    {
        var cursorId = cursorType switch
        {
            CursorTypeEnum.Arrow => NativeMethods.IDC_ARROW,
            CursorTypeEnum.AppStarting => NativeMethods.IDC_APPSTARTING,
            CursorTypeEnum.Cross => NativeMethods.IDC_CROSS,
            CursorTypeEnum.Hand => NativeMethods.IDC_HAND,
            CursorTypeEnum.Help => NativeMethods.IDC_HELP,
            CursorTypeEnum.IBeam => NativeMethods.IDC_IBEAM,
            CursorTypeEnum.WaitCursor => NativeMethods.IDC_WAIT,
            _ => throw new ArgumentOutOfRangeException(nameof(cursorType))
        };

        var handle = NativeMethods.LoadCursor(nint.Zero, cursorId);
        if (handle == nint.Zero)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), $"Failed to load cursor '{cursorType}'.");
        }

        return handle;
    }

    private static bool WaitForCursorChangeTo(nint targetCursorHandle, TimeSpan timeout)
    {
        var startTime = DateTime.UtcNow;
        while (DateTime.UtcNow - startTime < timeout)
        {
            if (GetActiveCursorHandle() == targetCursorHandle)
            {
                return true;
            }

            Thread.Sleep(100);
        }

        return false;
    }

    private static bool WaitForCursorChangeFrom(nint targetCursorHandle, TimeSpan timeout)
    {
        var startTime = DateTime.UtcNow;
        while (DateTime.UtcNow - startTime < timeout)
        {
            if (GetActiveCursorHandle() != targetCursorHandle)
            {
                return true;
            }

            Thread.Sleep(100);
        }

        return false;
    }

    private static nint GetActiveCursorHandle()
    {
        var cursorInfo = new NativeMethods.CURSORINFO
        {
            cbSize = Marshal.SizeOf<NativeMethods.CURSORINFO>()
        };

        if (!NativeMethods.GetCursorInfo(ref cursorInfo))
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get current cursor information.");
        }

        return cursorInfo.hCursor;
    }

    private static class NativeMethods
    {
        [StructLayout(LayoutKind.Sequential)]
        public struct POINT
        {
            public int X;
            public int Y;
        }

        [StructLayout(LayoutKind.Sequential)]
        public struct CURSORINFO
        {
            public int cbSize;
            public int flags;
            public nint hCursor;
            public POINT ptScreenPos;
        }

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool GetCursorInfo(ref CURSORINFO pci);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern nint LoadCursor(nint hInstance, int lpCursorName);

        public const int IDC_ARROW = 32512;
        public const int IDC_APPSTARTING = 32650;
        public const int IDC_CROSS = 32515;
        public const int IDC_HAND = 32649;
        public const int IDC_HELP = 32651;
        public const int IDC_IBEAM = 32513;
        public const int IDC_WAIT = 32514;
    }
}

public enum WaitActionEnum
{
    [Display(Name = "Become", Description = "Waits until the mouse pointer becomes the specified type.")]
    Become,

    [Display(Name = "Become Not", Description = "Waits until the mouse pointer stops being the specified type.")]
    BecomeNot
}

public enum CursorTypeEnum
{
    [Display(Name = "Arrow", Description = "Standard arrow cursor.")]
    Arrow,

    [Display(Name = "App starting", Description = "Hourglass cursor indicating application startup.")]
    AppStarting,

    [Display(Name = "Cross", Description = "Crosshair cursor.")]
    Cross,

    [Display(Name = "Hand", Description = "Hand cursor typically used for links.")]
    Hand,

    [Display(Name = "Help", Description = "Help cursor often used for tooltips.")]
    Help,

    [Display(Name = "I-Beam", Description = "Vertical bar cursor used in text fields.")]
    IBeam,

    [Display(Name = "Wait cursor", Description = "Hourglass cursor indicating a process is ongoing.")]
    WaitCursor
}
