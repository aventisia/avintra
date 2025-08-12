using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Send Mouse Click")]
    [Description("Sends a mouse click event to the specified location.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/MouseAndKeyboard.svg")]
    public class SendMouseClickActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Mouse Event to Send")]
        [Description("The type of mouse event to send (e.g., Left Click, Right Click).")]
        public InArgument<MouseEventEnum> MouseEvent { get; set; }


        [DisplayName("Wait")]
        [Description("Milliseconds to wait before sending the mouse event.")]
        [DefaultValue(0)]
        public InArgument<int> WaitBeforeSending { get; set; }


        [DisplayName("Move Mouse")]
        [Description("If true, moves the mouse to the current cursor position before sending the event.")]
        public InArgument<bool> MoveMouse { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var mouseEvent = MouseEvent.Get(context);
                var waitTime = WaitBeforeSending.Get(context);
                var moveMouse = MoveMouse.Get(context);

                if (waitTime < 0)
                    throw new ArgumentException("Wait time cannot be negative.");

                // Optionally move the mouse to the current cursor position
                if (moveMouse)
                {
                    var currentPoint = Cursor.Position;
                    NativeMethods.SetCursorPosition(currentPoint.X, currentPoint.Y);
                }

                // Simulate the mouse event
                switch (mouseEvent)
                {
                    case MouseEventEnum.LeftClick:
                        NativeMethods.MouseEvent((uint)NativeMethods.MouseEventFlags.MK_LBUTTON |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_LEFTDOWN |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                        break;

                    case MouseEventEnum.RightClick:
                        NativeMethods.MouseEvent((uint)NativeMethods.MouseEventFlags.MK_RBUTTON |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_RIGHTDOWN |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
                        break;

                    case MouseEventEnum.DoubleClick:
                        NativeMethods.MouseEvent((uint)NativeMethods.MouseEventFlags.MK_LBUTTON |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_LEFTDOWN |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                        Thread.Sleep(50); // Small delay between clicks
                        NativeMethods.MouseEvent((uint)NativeMethods.MouseEventFlags.MK_LBUTTON |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_LEFTDOWN |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                        break;

                    case MouseEventEnum.LeftButtonDown:
                        NativeMethods.MouseEvent(
                            (uint)NativeMethods.MouseEventFlags.MK_LBUTTON |
                            (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                        break;

                    case MouseEventEnum.LeftButtonUp:
                        NativeMethods.MouseEvent(
                            (uint)NativeMethods.MouseEventFlags.MK_LBUTTON |
                            (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_LEFTUP,
                            0, 0, 0, 0);
                        break;

                    case MouseEventEnum.RightButtonDown:
                        NativeMethods.MouseEvent(
                            (uint)NativeMethods.MouseEventFlags.MK_RBUTTON |
                            (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
                        break;

                    case MouseEventEnum.RightButtonUp:
                        NativeMethods.MouseEvent(
                            (uint)NativeMethods.MouseEventFlags.MK_RBUTTON |
                            (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
                        break;

                    case MouseEventEnum.MiddleClick:
                        NativeMethods.MouseEvent((uint)NativeMethods.MouseEventFlags.MK_MBUTTON |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_MIDDLEDOWN |
                                                 (uint)NativeMethods.MouseEventFlags.MOUSEEVENTF_MIDDLEUP, 0, 0, 0, 0);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(mouseEvent));
                }

                status = $"Successfully sent '{mouseEvent}' event.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error sending mouse event: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }

    public static class NativeMethods
    {
        [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
        public static extern void SetCursorPos(int X, int Y);

        [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
        public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);

        public enum MouseEventFlags : uint
        {
            MOUSEEVENTF_ABSOLUTE = 0x8000,
            MOUSEEVENTF_LEFTDOWN = 0x0002,
            MOUSEEVENTF_LEFTUP = 0x0004,
            MOUSEEVENTF_RIGHTDOWN = 0x0008,
            MOUSEEVENTF_RIGHTUP = 0x0010,
            MOUSEEVENTF_MIDDLEDOWN = 0x0020,
            MOUSEEVENTF_MIDDLEUP = 0x0040,
            MK_LBUTTON = 0x0001,
            MK_RBUTTON = 0x0002,
            MK_MBUTTON = 0x0010
        }

        public static void SetCursorPosition(int x, int y)
        {
            SetCursorPos(x, y);
        }

        public static void MouseEvent(uint flags, uint deltaX, uint deltaY, uint buttons, uint extraInfo)
        {
            mouse_event(flags, deltaX, deltaY, buttons, extraInfo);
        }
    }

    public enum MouseEventEnum
    {
        [Display(Name = "Left click", Description = "Simulates a left mouse click.")]
        LeftClick,

        [Display(Name = "Right click", Description = "Simulates a right mouse click.")]
        RightClick,

        [Display(Name = "Double click", Description = "Simulates a double mouse click.")]
        DoubleClick,

        [Display(Name = "Left button down", Description = "Presses the left mouse button down.")]
        LeftButtonDown,

        [Display(Name = "Left button up", Description = "Releases the left mouse button.")]
        LeftButtonUp,

        [Display(Name = "Right button down", Description = "Presses the right mouse button down.")]
        RightButtonDown,

        [Display(Name = "Right button up", Description = "Releases the right mouse button.")]
        RightButtonUp,

        [Display(Name = "Middle click", Description = "Simulates a middle mouse click.")]
        MiddleClick
    }
}