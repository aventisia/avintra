using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Get Mouse Position")]
    [Description("Retrieves the current position of the mouse cursor on the screen in pixel coordinates.")]
    [ActivityMetaData(nodeImg: "/assets/MouseAndKeyboard.svg")]
    public class GetMousePositionActivity : BaseCodeActivity
    {
        // Input property

        [DisplayName("Relative To")]
        [Description("Specifies whether the mouse position is relative to the Screen or Foreground Window.")]
        public InArgument<RelativeToEnum> RelativeTo { get; set; }

        // Output properties

        [DisplayName("Mouse Pos X")]
        [Description("The horizontal (X) value of the mouse position.")]
        public OutArgument<int> MousePosX { get; set; }


        [DisplayName("Mouse Pos Y")]
        [Description("The vertical (Y) value of the mouse position.")]
        public OutArgument<int> MousePosY { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input argument
                var relativeTo = context.GetValue(RelativeTo);

                // Get the current mouse position
                var mousePosition = GetCursorPosition(relativeTo);

                // Set output arguments
                context.SetValue(MousePosX, mousePosition.X);
                context.SetValue(MousePosY, mousePosition.Y);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Mouse position retrieved successfully.");
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
            // Use Windows API to get the cursor position relative to the screen
            POINT point;
            if (!GetCursorPos(out point))
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get cursor position.");

            return new Point(point.X, point.Y);
        }

        private static Point GetForegroundWindowCursorPosition()
        {
            // Get the foreground window handle
            var hwnd = GetForegroundWindow();

            // Get the cursor position relative to the screen
            if (!GetCursorPos(out _))
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get cursor position.");

            // Convert screen coordinates to client coordinates
            POINT clientPoint;
            if (!ClientToScreen(hwnd, out clientPoint))
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to convert coordinates.");

            return new Point(clientPoint.X, clientPoint.Y);
        }

        #region P/Invoke Declarations

        [DllImport("user32.dll")]
        private static extern bool GetCursorPos(out POINT lpPoint);

        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        private static extern bool ClientToScreen(IntPtr hWnd, out POINT lpPoint);

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
}