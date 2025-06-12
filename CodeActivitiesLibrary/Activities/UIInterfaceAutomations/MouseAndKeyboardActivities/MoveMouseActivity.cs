using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Move Mouse")]
    [Description("Moves the mouse cursor to a specific position on the screen.")]
    public class MoveMouseActivity : BaseCodeActivity
    {

        [DisplayName("Position X")]
        public InArgument<int> PositionX { get; set; }


        [DisplayName("Position Y")]
        public InArgument<int> PositionY { get; set; }


        [DisplayName("Relative To")]
        public InArgument<RelativeToEnum> RelativeTo { get; set; }


        [DisplayName("Move Mouse From Previous Position")]
        public InArgument<AnimationSpeedEnum> MoveMouseFromPreviousPosition { get; set; }


        [DisplayName("Current Cursor Position")]
        public OutArgument<Point> CurrentCursorPosition { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var posX = context.GetValue(PositionX);
                var posY = context.GetValue(PositionY);
                var relativeTo = context.GetValue(RelativeTo);
                var animationSpeed = context.GetValue(MoveMouseFromPreviousPosition);

                var currentPos = GetCurrentCursorPosition();

                MoveCursor(posX, posY, relativeTo, animationSpeed);

                var newPos = GetCurrentCursorPosition();
                context.SetValue(CurrentCursorPosition, new Point(newPos.X, newPos.Y));
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Failed to move the mouse.", ex);
            }
        }

        private Point GetCurrentCursorPosition()
        {
            if (!GetCursorPos(out var point))
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get cursor position.");

            return new Point(point.X, point.Y);
        }

        private void MoveCursor(int x, int y, RelativeToEnum relativeTo, AnimationSpeedEnum speed)
        {
            var target = ConvertToScreenCoordinates(x, y, relativeTo);
            var start = GetCurrentCursorPosition();

            var steps = 0;

            switch (speed)
            {
                case AnimationSpeedEnum.Instant:
                    steps = 0;
                    break;
                case AnimationSpeedEnum.LowSpeed:
                    steps = 50;
                    break;
                case AnimationSpeedEnum.NormalSpeed:
                    steps = 25;
                    break;
                case AnimationSpeedEnum.HighSpeed:
                    steps = 10;
                    break;
                default:
                    steps = 0;
                    break;
            }

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
                System.Threading.Thread.Sleep(10);
            }
        }

        private Point ConvertToScreenCoordinates(int x, int y, RelativeToEnum relativeTo)
        {
            if (relativeTo == RelativeToEnum.Screen)
            {
                return new Point(x, y);
            }
            else if (relativeTo == RelativeToEnum.ForegroundWindow)
            {
                var hwnd = GetForegroundWindow();
                var pt = new POINT(x, y);
                if (!ClientToScreen(hwnd, ref pt))
                    throw new Win32Exception(Marshal.GetLastWin32Error(), "ClientToScreen failed.");

                return new Point(pt.X, pt.Y);
            }
            else
            {
                throw new ArgumentException("Unsupported relative type.");
            }
        }

        #region Win32 Interop

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

        #endregion
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
}