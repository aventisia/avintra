using System.Drawing;
using System.Runtime.InteropServices;

namespace NodeLibrary.UiAutomationNodes.Helpers;

/// <summary>
/// Provides helper methods for mouse actions, such as moving the cursor and simulating mouse clicks.
/// </summary>
public static class MouseHelper
{
    // Import SetCursorPos from user32.dll to set the mouse cursor position.
    [DllImport("user32.dll")]
    internal static extern bool SetCursorPos(int x, int y);

    // Import mouse_event from user32.dll to simulate mouse events.
    [DllImport("user32.dll")]
    public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);

    // Mouse event constants for different mouse actions.
    public const int MOUSEEVENTF_LEFTDOWN = 0x02;
    public const int MOUSEEVENTF_LEFTUP = 0x04;
    public const int MOUSEEVENTF_RIGHTDOWN = 0x08;
    public const int MOUSEEVENTF_RIGHTUP = 0x10;

    public enum MouseClickTypeEnum
    {
        [Display(Name = "Left Click", Description = "Standard left mouse click.")]
        LeftClick = 0,

        [Display(Name = "Right Click", Description = "Right mouse click.")]
        RightClick = 1,

        [Display(Name = "Double Click", Description = "Double-click with the left mouse button.")]
        DoubleClick = 2,

        [Display(Name = "Left Button Down", Description = "Mouse left button down only.")]
        LeftButtonDown = 3,

        [Display(Name = "Left Button Up", Description = "Mouse left button up only.")]
        LeftButtonUp = 4,

        [Display(Name = "Right Button Down", Description = "Mouse right button down only.")]
        RightButtonDown = 5,

        [Display(Name = "Right Button Up", Description = "Mouse right button up only.")]
        RightButtonUp = 6,
    }

    /// <summary>
    /// Simulates a mouse click at the specified screen coordinates.
    /// </summary>
    /// <param name="clickType">Type of click: "Left Click", "Right Click", "Double Click", "Left Click Down", "Left Click Up", "Right Click Down", "Right Click Up".</param>
    /// <param name="xPosition">The X coordinate on the screen.</param>
    /// <param name="yPosition">The Y coordinate on the screen.</param>
    public static void SendMouseClick(MouseClickTypeEnum clickType, double xPosition, double yPosition)
    {
        try
        {
            // Move the cursor to the specified position.
            SetCursorPos(Convert.ToInt32(xPosition), Convert.ToInt32(yPosition));

            // Perform the specified mouse action.
            switch (clickType)
            {
                case MouseClickTypeEnum.LeftClick:
                    mouse_event(MOUSEEVENTF_LEFTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    mouse_event(MOUSEEVENTF_LEFTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    break;
                case MouseClickTypeEnum.RightClick:
                    mouse_event(MOUSEEVENTF_RIGHTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    mouse_event(MOUSEEVENTF_RIGHTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    break;
                case MouseClickTypeEnum.DoubleClick:
                    mouse_event(MOUSEEVENTF_LEFTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    mouse_event(MOUSEEVENTF_LEFTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    mouse_event(MOUSEEVENTF_LEFTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    mouse_event(MOUSEEVENTF_LEFTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    break;
                case MouseClickTypeEnum.LeftButtonDown:
                    mouse_event(MOUSEEVENTF_LEFTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    break;
                case MouseClickTypeEnum.LeftButtonUp:
                    mouse_event(MOUSEEVENTF_LEFTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    break;
                case MouseClickTypeEnum.RightButtonDown:
                    mouse_event(MOUSEEVENTF_RIGHTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    break;
                case MouseClickTypeEnum.RightButtonUp:
                    mouse_event(MOUSEEVENTF_RIGHTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                    break;
            }
        }
        catch (Exception ex)
        {
            // Log or handle exception as needed.
            Console.WriteLine(ex.ToString());
        }
    }

    /// <summary>
    /// Struct representing a point (x, y) in Win32 API.
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    internal struct Win32Point
    {
        public int X;
        public int Y;
    }

    /// <summary>
    /// Retrieves the current mouse cursor position on the screen.
    /// </summary>
    /// <returns>
    /// A <see cref="System.Windows.Point"/> representing the current mouse position.
    /// </returns>
    public static PointF GetMousePosition()
    {
        PointF point = new PointF();
        try
        {
            var win32Point = new Win32Point();
            if (GetCursorPos(ref win32Point))
            {
                point = new PointF(win32Point.X, win32Point.Y);
            }
        }
        catch (Exception ex)
        {
            // Log or handle exception as needed
            Console.WriteLine(ex.ToString());
        }
        return point;
    }

    /// <summary>
    /// Calls the Win32 API to get the cursor position.
    /// </summary>
    /// <param name="pt">Reference to a <see cref="Win32Point"/> struct to receive the position.</param>
    /// <returns>True if successful, otherwise false.</returns>
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetCursorPos(ref Win32Point pt);
}