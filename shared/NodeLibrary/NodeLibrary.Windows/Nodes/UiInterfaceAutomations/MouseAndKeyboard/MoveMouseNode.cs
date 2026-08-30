using NodeLibrary.MouseAndKeyboardNodes.Enums;
using System.Drawing;
using System.Runtime.InteropServices;

namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Move Mouse"), Description("Moves the mouse cursor to a specific position on the screen.")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class MoveMouseNode : BaseNode
{
    [DisplayName("Position X"), Description("Specifies the X coordinate on the screen where the mouse should be moved.")]
    public InArgument<int> PositionX { get; set; } = new InArgument<int>(0);

    [DisplayName("Position Y"), Description("Specifies the Y coordinate on the screen where the mouse should be moved.")]
    public InArgument<int> PositionY { get; set; } = new InArgument<int>(0);

    [DisplayName("Relative To"), Description("Determines the reference point for the mouse movement. Can be relative to the screen or a specific window.")]
    public InArgument<RelativeToEnum> RelativeTo { get; set; } = new InArgument<RelativeToEnum>(RelativeToEnum.Screen);

    [DisplayName("Move Mouse From Previous Position"), Description("Specifies whether to move the mouse from its current location using an animated effect, and sets the speed of the animation.")]
    public InArgument<AnimationSpeedEnum> MoveMouseFromPreviousPosition { get; set; } = new InArgument<AnimationSpeedEnum>(AnimationSpeedEnum.Instant);

    [DisplayName("Current Cursor Position"), Description("Returns the cursor's final position on the screen after the mouse operation completes.")]
    public OutArgument<Point> CurrentCursorPosition { get; set; } = new OutArgument<Point>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var posX = PositionX.Get(context);
            var posY = PositionY.Get(context);
            var relativeTo = RelativeTo.Get(context);
            var animationSpeed = MoveMouseFromPreviousPosition.Get(context);

            MoveCursor(posX, posY, relativeTo, animationSpeed);

            var newPos = GetCurrentCursorPosition();
            CurrentCursorPosition.Set(context, new Point(newPos.X, newPos.Y));
            status = $"Mouse moved successfully to position X: {newPos.X}, Y: {newPos.Y}.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to move the mouse: {ex.Message}");
        }
    }

    private static Point GetCurrentCursorPosition()
    {
        if (!GetCursorPos(out var point))
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get cursor position.");

        return new Point(point.X, point.Y);
    }

    private static void MoveCursor(int x, int y, RelativeToEnum relativeTo, AnimationSpeedEnum speed)
    {
        var target = ConvertToScreenCoordinates(x, y, relativeTo);
        var start = GetCurrentCursorPosition();

        var steps = speed switch
        {
            AnimationSpeedEnum.LowSpeed => 50,
            AnimationSpeedEnum.NormalSpeed => 25,
            AnimationSpeedEnum.HighSpeed => 10,
            _ => 0
        };

        if (steps == 0)
        {
            SetCursorPos(target.X, target.Y);
            return;
        }

        var dx = target.X - start.X;
        var dy = target.Y - start.Y;

        for (var i = 1; i <= steps; i++)
        {
            var stepX = start.X + dx * i / steps;
            var stepY = start.Y + dy * i / steps;
            SetCursorPos(stepX, stepY);
            Thread.Sleep(10);
        }
    }

    private static Point ConvertToScreenCoordinates(int x, int y, RelativeToEnum relativeTo)
    {
        if (relativeTo == RelativeToEnum.Screen)
        {
            return new Point(x, y);
        }

        if (relativeTo == RelativeToEnum.ForegroundWindow)
        {
            var hwnd = GetForegroundWindow();
            var pt = new POINT(x, y);
            if (!ClientToScreen(hwnd, ref pt))
                throw new Win32Exception(Marshal.GetLastWin32Error(), "ClientToScreen failed.");

            return new Point(pt.X, pt.Y);
        }

        throw new ArgumentException("Unsupported relative type.");
    }

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

    [DllImport("user32.dll")]
    private static extern bool GetCursorPos(out POINT lpPoint);

    [DllImport("user32.dll")]
    private static extern bool SetCursorPos(int x, int y);

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern bool ClientToScreen(IntPtr hWnd, ref POINT lpPoint);
}

public enum AnimationSpeedEnum
{
    [Display(Name = "Instant", Description = "Animation runs instantly without delay.")]
    Instant,

    [Display(Name = "Low Speed", Description = "Animation runs at a slow speed.")]
    LowSpeed,

    [Display(Name = "Normal Speed", Description = "Animation runs at normal speed.")]
    NormalSpeed,

    [Display(Name = "High Speed", Description = "Animation runs at a fast speed.")]
    HighSpeed
}
