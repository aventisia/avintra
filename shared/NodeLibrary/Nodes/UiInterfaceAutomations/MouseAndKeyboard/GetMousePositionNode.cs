using NodeLibrary.MouseAndKeyboardNodes.Enums;
using System.Drawing;
using System.Runtime.InteropServices;

namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Get Mouse Position"), Description("Retrieves the current position of the mouse cursor on the screen in pixel coordinates.")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class GetMousePositionNode : BaseNode
{
    [DisplayName("Relative To"), Description("Specifies whether the mouse position is relative to the Screen or Foreground Window.")]
    public InArgument<RelativeToEnum> RelativeTo { get; set; } = new InArgument<RelativeToEnum>(RelativeToEnum.Screen);

    [DisplayName("Mouse Pos X"), Description("The horizontal (X) value of the mouse position.")]
    public OutArgument<int> MousePosX { get; set; } = new OutArgument<int>();

    [DisplayName("Mouse Pos Y"), Description("The vertical (Y) value of the mouse position.")]
    public OutArgument<int> MousePosY { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Mouse position retrieved successfully.";

        try
        {
            var relativeTo = RelativeTo.Get(context);
            var mousePosition = GetCursorPosition(relativeTo);

            MousePosX.Set(context, mousePosition.X);
            MousePosY.Set(context, mousePosition.Y);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving mouse position: {ex.Message}");
        }
    }

    private Point GetCursorPosition(RelativeToEnum relativeTo)
    {
        switch (relativeTo)
        {
            case RelativeToEnum.Screen:
                return GetScreenCursorPosition();
            case RelativeToEnum.ForegroundWindow:
                return GetForegroundWindowCursorPosition();
            default:
                throw new ArgumentException("Invalid 'Relative To' value.");
        }
    }

    private static Point GetScreenCursorPosition()
    {
        POINT point;
        if (!GetCursorPos(out point))
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get cursor position.");

        return new Point(point.X, point.Y);
    }

    private static Point GetForegroundWindowCursorPosition()
    {
        var hwnd = GetForegroundWindow();
        if (hwnd == IntPtr.Zero)
            throw new InvalidOperationException("No foreground window is currently available.");

        if (!GetCursorPos(out var point))
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get cursor position.");

        if (!ScreenToClient(hwnd, ref point))
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to convert screen coordinates to client coordinates.");

        return new Point(point.X, point.Y);
    }

    #region P/Invoke Declarations

    [DllImport("user32.dll")]
    private static extern bool GetCursorPos(out POINT lpPoint);

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern bool ScreenToClient(IntPtr hWnd, ref POINT lpPoint);

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT
    {
        public int X;
        public int Y;

        public POINT(int x, int y)
        {
            X = x;
            Y = y;
        }
    }

    #endregion
}



