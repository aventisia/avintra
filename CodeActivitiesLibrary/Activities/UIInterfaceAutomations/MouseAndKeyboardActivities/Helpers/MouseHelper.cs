using System;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities.Helpers
{
    public static class MouseHelper
    {
        // Constants for mouse_event
        private const int MOUSEEVENTF_LEFTDOWN = 0x02;
        private const int MOUSEEVENTF_LEFTUP = 0x04;
        private const int MOUSEEVENTF_RIGHTDOWN = 0x08;
        private const int MOUSEEVENTF_RIGHTUP = 0x10;
        private const int MOUSEEVENTF_MIDDLEDOWN = 0x20;
        private const int MOUSEEVENTF_MIDDLEUP = 0x40;
        private const int MOUSEEVENTF_ABSOLUTE = 0x8000;
        private const int MOUSEEVENTF_MOVE = 0x0001;

        // INPUT structure for SendInput
        [StructLayout(LayoutKind.Sequential)]
        private struct INPUT
        {
            public uint type;
            public InputUnion u;
        }

        [StructLayout(LayoutKind.Explicit)]
        private struct InputUnion
        {
            [FieldOffset(0)] public MOUSEINPUT mi;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct MOUSEINPUT
        {
            public int dx;
            public int dy;
            public uint mouseData;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        private const uint INPUT_MOUSE = 0;
        private const uint MOUSEEVENTF_LEFTDOWN_SENDINPUT = 0x0002;
        private const uint MOUSEEVENTF_LEFTUP_SENDINPUT = 0x0004;
        private const uint MOUSEEVENTF_RIGHTDOWN_SENDINPUT = 0x0008;
        private const uint MOUSEEVENTF_RIGHTUP_SENDINPUT = 0x0010;
        private const uint MOUSEEVENTF_MIDDLEDOWN_SENDINPUT = 0x0020;
        private const uint MOUSEEVENTF_MIDDLEUP_SENDINPUT = 0x0040;

        [DllImport("user32.dll")]
        private static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, int dwExtraInfo);

        [DllImport("user32.dll")]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        [DllImport("user32.dll")]
        private static extern bool SetCursorPos(int x, int y);

        /// <summary>
        /// Moves cursor to specified position and performs a click
        /// </summary>
        public static void MouseClick(int x, int y, MouseButtonsEnum buttonEnum)
        {
            SetCursorPosition(x, y);
            switch (buttonEnum)
            {
                case MouseButtonsEnum.Left:
                    MouseDown(x, y, MouseButtonsEnum.Left);
                    MouseUp(x, y, MouseButtonsEnum.Left);
                    break;
                case MouseButtonsEnum.Right:
                    MouseDown(x, y, MouseButtonsEnum.Right);
                    MouseUp(x, y, MouseButtonsEnum.Right);
                    break;
                case MouseButtonsEnum.Middle:
                    MouseDown(x, y, MouseButtonsEnum.Middle);
                    MouseUp(x, y, MouseButtonsEnum.Middle);
                    break;
            }
        }

        /// <summary>
        /// Moves cursor to specified position and performs a double click
        /// </summary>
        public static void MouseDoubleClick(int x, int y, MouseButtonsEnum buttonEnum)
        {
            SetCursorPosition(x, y);
            MouseClick(x, y, buttonEnum);
            System.Threading.Thread.Sleep(150); // Small delay between clicks
            MouseClick(x, y, buttonEnum);
        }

        /// <summary>
        /// Moves cursor to specified position and presses mouse button down
        /// </summary>
        public static void MouseDown(int x, int y, MouseButtonsEnum buttonEnum)
        {
            SetCursorPosition(x, y);

            // Modern approach using SendInput (recommended)
            var inputs = new INPUT[1];
            inputs[0].type = INPUT_MOUSE;

            switch (buttonEnum)
            {
                case MouseButtonsEnum.Left:
                    inputs[0].u.mi.dwFlags = MOUSEEVENTF_LEFTDOWN_SENDINPUT;
                    break;
                case MouseButtonsEnum.Right:
                    inputs[0].u.mi.dwFlags = MOUSEEVENTF_RIGHTDOWN_SENDINPUT;
                    break;
                case MouseButtonsEnum.Middle:
                    inputs[0].u.mi.dwFlags = MOUSEEVENTF_MIDDLEDOWN_SENDINPUT;
                    break;
            }

            SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));

            // Alternative approach using mouse_event (older API)
            /*
            switch (button)
            {
                case MouseButtons.Left:
                    mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                    break;
                case MouseButtons.Right:
                    mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
                    break;
                case MouseButtons.Middle:
                    mouse_event(MOUSEEVENTF_MIDDLEDOWN, 0, 0, 0, 0);
                    break;
            }
            */
        }

        /// <summary>
        /// Moves cursor to specified position and releases mouse button
        /// </summary>
        public static void MouseUp(int x, int y, MouseButtonsEnum buttonEnum)
        {
            SetCursorPosition(x, y);

            // Modern approach using SendInput (recommended)
            var inputs = new INPUT[1];
            inputs[0].type = INPUT_MOUSE;

            switch (buttonEnum)
            {
                case MouseButtonsEnum.Left:
                    inputs[0].u.mi.dwFlags = MOUSEEVENTF_LEFTUP_SENDINPUT;
                    break;
                case MouseButtonsEnum.Right:
                    inputs[0].u.mi.dwFlags = MOUSEEVENTF_RIGHTUP_SENDINPUT;
                    break;
                case MouseButtonsEnum.Middle:
                    inputs[0].u.mi.dwFlags = MOUSEEVENTF_MIDDLEUP_SENDINPUT;
                    break;
            }

            SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));

            // Alternative approach using mouse_event (older API)
            /*
            switch (button)
            {
                case MouseButtons.Left:
                    mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                    break;
                case MouseButtons.Right:
                    mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
                    break;
                case MouseButtons.Middle:
                    mouse_event(MOUSEEVENTF_MIDDLEUP, 0, 0, 0, 0);
                    break;
            }
            */
        }

        /// <summary>
        /// Sets the cursor position
        /// </summary>
        private static void SetCursorPosition(int x, int y)
        {
            SetCursorPos(x, y);
        }
    }

    public enum MouseButtonsEnum
    {
        Left,
        Right,
        Middle
    }
}